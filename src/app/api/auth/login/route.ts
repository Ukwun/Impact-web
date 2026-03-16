import { NextRequest, NextResponse } from "next/server";
import { comparePassword, validateEmail, generateToken } from "@/lib/auth";
import { demoUsers } from "@/lib/demoUsers";
import {
  checkRateLimit,
  getClientIp,
  validateInput,
  APIValidationSchemas,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    // ========================================================================
    // RATE LIMITING - Check for brute force attacks
    // ========================================================================
    
    const clientIp = getClientIp(req.headers as any);
    const rateLimitResult = await checkRateLimit(clientIp, RATE_LIMIT_CONFIGS.AUTH_LOGIN);

    if (!rateLimitResult.allowed) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${clientIp}`);
      const response = NextResponse.json(
        {
          success: false,
          error: RATE_LIMIT_CONFIGS.AUTH_LOGIN.message,
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
    console.log(`\n\n🔐 ===== LOGIN ATTEMPT =====`);
    console.log(`Email: ${body.email}`);
    console.log(`IP: ${clientIp} (Remaining attempts: ${rateLimitResult.remaining})`);
    console.log(`Demo users available: ${demoUsers.size}`);
    console.log(`Demo user list:`, Array.from(demoUsers.keys()));

    // ========================================================================
    // INPUT VALIDATION
    // ========================================================================

    const validationResult = validateInput(APIValidationSchemas.login, {
      email: body.email?.trim().toLowerCase(),
      password: body.password,
    });

    if (!validationResult.valid) {
      console.warn(`⚠️ Validation failed:`, validationResult.errors);
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: validationResult.errors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // ========================================================================
    // TRY DATABASE FIRST, FALLBACK TO DEMO MODE
    // ========================================================================

    let user = null;
    let isDemoUser = false;

    // First check demo users (in-memory)
    console.log(`\n✓ Checking demo users...`);
    user = demoUsers.get(email);
    console.log(`User found in demo: ${user ? '✅ YES' : '❌ NO'}`);
    if (user) {
      console.log(`✅ DEMO USER FOUND: ${email}`);
      isDemoUser = true;
    }

    // If not in demo, try database
    if (!user) {
      console.log(`\n🗄️ Checking database...`);
      try {
        const { prisma } = await import("@/lib/prisma");
        user = await prisma.user.findUnique({
          where: { email: email },
        });
        console.log(`Database user found: ${user ? '✅ YES' : '❌ NO'}`);
      } catch (dbError) {
        // Database connection failed - log it but continue
        console.log("Database query failed:", (dbError as Error).message);
      }
    }

    if (!user) {
      console.log(`\n❌ NO USER FOUND - RETURNING 401`);
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log(`\n✅ USER FOUND! isDemoUser: ${isDemoUser}`);

    // ========================================================================
    // VERIFY PASSWORD
    // ========================================================================

    if (!isDemoUser) {
      // Database users: strict password verification
      const isPasswordValid = await comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        console.log(`Login failed: Invalid password for ${email}`);
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }
    } else {
      // Demo/test mode: Validate password properly for demo users
      const isPasswordValid = await comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        console.log(`Login failed: Invalid password for demo user ${email}`);
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }
      console.log(`✓ Demo login: Password validated for ${email}`);
    }

    // ========================================================================
    // CHECK IF ACCOUNT IS ACTIVE
    // ========================================================================

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, error: "Your account has been deactivated" },
        { status: 403 }
      );
    }

    // ========================================================================
    // GENERATE JWT TOKEN
    // ========================================================================

    const token = generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Update last login (only for database users)
    if (!isDemoUser) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      } catch (err) {
        // Ignore update error
      }
    }

    // ========================================================================
    // RETURN RESPONSE
    // ========================================================================

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      state: user.state,
      institution: user.institution,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt ? user.updatedAt : user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: isDemoUser ? "Login successful (Demo Mode)" : "Login successful",
      data: {
        token,
        user: userResponse,
        demoMode: isDemoUser,
      },
    });

    // Set auth token cookie for middleware authentication
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return NextResponse.json(
      { success: false, error: errorMessage || "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
