import { NextRequest, NextResponse } from "next/server";
import { hashPassword, validatePasswordSimple, validateEmail, generateToken } from "@/lib/auth";
import { demoUsers } from "@/lib/demoUsers";
import {
  checkRateLimit,
  getClientIp,
  validateInput,
  validatePassword,
  APIValidationSchemas,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    // ========================================================================
    // RATE LIMITING - Prevent spam signups
    // ========================================================================

    const clientIp = getClientIp(req.headers as any);
    const rateLimitResult = await checkRateLimit(clientIp, RATE_LIMIT_CONFIGS.AUTH_SIGNUP);

    if (!rateLimitResult.allowed) {
      console.warn(`⚠️ Rate limit exceeded for signup IP: ${clientIp}`);
      const response = NextResponse.json(
        {
          success: false,
          error: RATE_LIMIT_CONFIGS.AUTH_SIGNUP.message,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
      response.headers.set(
        "Retry-After",
        Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
      );
      return response;
    }

    const body = await req.json();
    console.log(`\n📝 ===== SIGNUP ATTEMPT =====`);
    console.log(`Email: ${body.email}`);
    console.log(`IP: ${clientIp} (Remaining signups: ${rateLimitResult.remaining})`);

    // ========================================================================
    // INPUT VALIDATION (password strength depends on mode)
    // ========================================================================

    // Check if database is available first
    let databaseAvailable = false;
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$connect();
      databaseAvailable = true;
    } catch (dbError) {
      console.log("Database unavailable, will use demo mode");
    }

    // Strict password validation only for database users
    if (databaseAvailable) {
      const passwordStrengthCheck = validatePassword(body.password);
      if (!passwordStrengthCheck.isValid) {
        console.warn(`⚠️ Password too weak:`, passwordStrengthCheck.feedback);
        return NextResponse.json(
          {
            success: false,
            error: "Password is too weak",
            passwordFeedback: passwordStrengthCheck.feedback,
            passwordStrength: passwordStrengthCheck.strength,
          },
          { status: 400 }
        );
      }
    } else {
      // Demo mode: basic password validation only
      const passwordStrengthCheck = validatePasswordSimple(body.password);
      if (!passwordStrengthCheck.valid) {
        console.warn(`⚠️ Password too weak for demo:`, passwordStrengthCheck.errors);
        return NextResponse.json(
          {
            success: false,
            error: "Password is too weak",
            passwordErrors: passwordStrengthCheck.errors,
          },
          { status: 400 }
        );
      }
    }

    // Validate against schema
    const validationInput = {
      email: body.email?.trim().toLowerCase(),
      password: body.password,
      confirmPassword: body.confirmPassword || body.passwordConfirm,
      fullName: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      role: body.role,
      agreeToTerms: body.agreeToTerms || body.agreedToTerms || true,
    };

    // Add custom validation for password match
    if (body.password !== (body.confirmPassword || body.passwordConfirm)) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const validationResult = validateInput(APIValidationSchemas.register, validationInput);

    if (!validationResult.valid) {
      console.warn(`⚠️ Validation failed:`, validationResult.errors);
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: validationResult.errors },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;
    const firstName = body.firstName || body.firstName || 'User';
    const lastName = body.lastName || 'Account';

    // ========================================================================
    // CHECK IF USER ALREADY EXISTS (Database First)
    // ========================================================================

    // Check database first (production priority)
    try {
      const { prisma } = await import("@/lib/prisma");
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email already registered" },
          { status: 409 }
        );
      }
    } catch (dbError) {
      console.log("Database check failed, will check demo users:", (dbError as Error).message);
    }

    // Check demo users as fallback
    if (demoUsers.has(email)) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    // ========================================================================
    // CREATE NEW USER (Database First, Demo Fallback)
    // ========================================================================

    // Try database first (production priority)
    try {
      const { prisma } = await import("@/lib/prisma");
      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          phone: body.phone || null,
          role: (body.role || "STUDENT").toUpperCase() as any,
          state: body.state || "Unknown",
          institution: body.institution || null,
          passwordHash: hashedPassword,
          emailVerified: false,
        },
      });

      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        state: user.state,
        institution: user.institution,
        createdAt: user.createdAt,
      };

      // Generate JWT token for immediate auth
      const token = generateToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      console.log(`✅ User registered in database: ${email} - Role: ${user.role}`);

      const response = NextResponse.json(
        {
          success: true,
          message: "Registration successful! Welcome to ImpactApp!",
          data: { user: userResponse, token, demoMode: false },
        },
        { status: 201 }
      );

      // Set auth token cookie for middleware authentication
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } catch (dbError) {
      console.log("Database registration failed, falling back to demo mode:", (dbError as Error).message);

      // Database unavailable - use demo mode as last resort
      const hashedPassword = await hashPassword(password);
      const userId = "user-" + Math.random().toString(36).substr(2, 9);

      const newUser = {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: body.phone || null,
        role: (body.role || "STUDENT").toUpperCase(),
        state: body.state || "Unknown",
        institution: body.institution || null,
        passwordHash: hashedPassword,
        emailVerified: false,
        isActive: true,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log(`⚠️ User registered in demo mode: ${email}. Total demo users: ${demoUsers.size}`);

      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        state: newUser.state,
        institution: newUser.institution,
        createdAt: newUser.createdAt,
      };

      // Generate JWT token for immediate auth
      const token = generateToken({
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      const response = NextResponse.json(
        {
          success: true,
          message: "Registration successful! (Demo mode - database unavailable)",
          data: { user: userResponse, token, demoMode: true },
        },
        { status: 201 }
      );

      // Set auth token cookie for middleware authentication
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return NextResponse.json(
      { success: false, error: errorMessage || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
