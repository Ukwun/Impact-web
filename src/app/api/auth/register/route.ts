import { NextRequest, NextResponse } from "next/server";
import { validatePassword } from "@/lib/security/passwordValidator";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security";
import { getFirebaseAuth, getFirestore } from "@/lib/firebase-admin";
import { generateToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req.headers as any);
    const rateLimitResult = await checkRateLimit(clientIp, RATE_LIMIT_CONFIGS.AUTH_SIGNUP);

    if (!rateLimitResult.allowed) {
      console.warn("Rate limit exceeded for signup IP: " + clientIp);
      const response = NextResponse.json(
        {
          success: false,
          error: RATE_LIMIT_CONFIGS.AUTH_SIGNUP.message,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const firstName = body.firstName || 'User';
    const lastName = body.lastName || 'Account';
    const role = (body.role || 'student').toUpperCase();
    const phone = body.phone || '';
    const state = body.state || '';

    console.log(`📝 Register Request - Email: ${email}, Role from form: "${body.role}", Normalized to: "${role}"`);

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Password is too weak",
          feedback: passwordCheck.feedback,
        },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    const fullName = (firstName + " " + lastName).trim();
    if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Name can only contain letters, spaces, hyphens, and apostrophes",
        },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    if (!email || !password) {
      const response = NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    const auth = getFirebaseAuth();
    
    try {
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: fullName,
      });

      console.log("User created: " + userRecord.uid);

      try {
        const db = getFirestore();
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          displayName: fullName,
          role: role,
          phone: phone,
          state: state,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
        });
        console.log("Profile stored in Firestore");
      } catch (firestoreError) {
        console.warn("Firestore write failed (non-critical): " + (firestoreError as Error).message);
      }

      const customToken = await auth.createCustomToken(userRecord.uid);

      // Generate JWT token for API authentication
      const jwtToken = generateToken({
        sub: userRecord.uid,
        email: email,
        role: role,
      });

      // Return user data with proper role
      const response = NextResponse.json(
        {
          success: true,
          message: "Account created successfully",
          user: {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            role: role,
          },
          token: jwtToken,
        },
        { status: 201 }
      );

      return addCorsHeaders(response, req.headers.get("origin") || undefined);

    } catch (firebaseError: any) {
      let errorMessage = "Signup failed";
      let statusCode = 400;

      if (firebaseError.code === "auth/email-already-exists") {
        errorMessage = "Email already registered";
        statusCode = 409;
      } else if (firebaseError.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (firebaseError.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }

      console.error("Firebase error: " + firebaseError.code);

      const response = NextResponse.json(
        { success: false, error: errorMessage },
        { status: statusCode }
      );

      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

  } catch (error) {
    console.error("Signup error: " + (error as Error).message);
    const response = NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin") || undefined);
  }
}
