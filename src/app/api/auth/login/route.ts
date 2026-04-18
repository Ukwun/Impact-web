import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security";
import { getFirebaseAuth } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req.headers as any);
    const rateLimitResult = await checkRateLimit(clientIp, RATE_LIMIT_CONFIGS.AUTH_LOGIN);

    if (!rateLimitResult.allowed) {
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
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      const response = NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    const auth = getFirebaseAuth();

    try {
      const userRecord = await auth.getUserByEmail(email);

      const customToken = await auth.createCustomToken(userRecord.uid);

      const response = NextResponse.json(
        {
          success: true,
          message: "Login successful",
          user: {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
          },
          token: customToken,
          requiresPasswordChange: false,
        },
        { status: 200 }
      );

      return addCorsHeaders(response, req.headers.get("origin") || undefined);

    } catch (firebaseError: any) {
      if (firebaseError.code === "auth/user-not-found") {
        const response = NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
        return addCorsHeaders(response, req.headers.get("origin") || undefined);
      }

      const response = NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 401 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

  } catch (error) {
    const response = NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin") || undefined);
  }
}
