/**
 * Authentication API Routes
 * /api/auth - User login, logout, and token verification
 *
 * NOTE: This legacy route is kept for compatibility. The primary login
 * endpoint is /api/auth/login which uses Firebase credential verification.
 * This route uses bcrypt + Prisma for environments without Firebase.
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, createToken, verifyToken } from "@/lib/auth-service";
import { verifyToken as verifyJwt, generateToken, comparePassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { demoUsers } from "@/lib/demoUsers";

// ========================================================================
// LOGIN ENDPOINT
// ========================================================================

export async function POST(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    if (pathname.includes("/login")) {
      return handleLogin(request);
    } else if (pathname.includes("/logout")) {
      return handleLogout(request);
    } else if (pathname.includes("/verify")) {
      return handleVerify(request);
    } else if (pathname.includes("/refresh")) {
      return handleRefreshToken(request);
    }

    return NextResponse.json(
      { success: false, error: "Invalid auth endpoint" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Try database lookup first
    let dbUser: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      institution: string | null;
      isActive: boolean;
      passwordHash: string;
    } | null = null;

    try {
      dbUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          institution: true,
          isActive: true,
          passwordHash: true,
        },
      });
    } catch {
      // Database unavailable – fall through to demo users
    }

    if (dbUser) {
      if (!dbUser.isActive) {
        return NextResponse.json(
          { success: false, error: "Account is deactivated" },
          { status: 403 }
        );
      }

      const passwordValid = await comparePassword(password, dbUser.passwordHash);
      if (!passwordValid) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Update lastLoginAt non-blocking
      prisma.user
        .update({ where: { id: dbUser.id }, data: { lastLoginAt: new Date() } })
        .catch(() => {});

      const tokenPayload = {
        sub: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      };

      const token = generateToken(tokenPayload);

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: `${dbUser.firstName} ${dbUser.lastName}`.trim(),
            role: dbUser.role,
            school: dbUser.institution,
          },
          token,
          expiresIn: "30d",
        },
      });

      response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    // 2. Fall back to demo/test users when database is unavailable
    const demoUser = demoUsers.get(normalizedEmail);
    if (demoUser) {
      const passwordValid = await comparePassword(password, demoUser.passwordHash);
      if (!passwordValid) {
        return NextResponse.json(
          { success: false, error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const tokenPayload = {
        sub: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
      };

      const token = generateToken(tokenPayload);

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: demoUser.id,
            email: demoUser.email,
            name: `${demoUser.firstName} ${demoUser.lastName}`.trim(),
            role: demoUser.role,
            school: demoUser.institution,
          },
          token,
          expiresIn: "30d",
        },
      });

      response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    // No user found at all
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}

async function handleLogout(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // TODO: Invalidate token in database if using token blacklist
    // await prisma.tokenBlacklist.create({
    //   data: { token: authResult.token, expiresAt: authResult.expiresAt }
    // });

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear cookie
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}

async function handleVerify(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if invalid
    }

    // Token is valid
    return NextResponse.json({
      success: true,
      message: "Token is valid",
      data: {
        user: authResult.user,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: "Token verification failed" },
      { status: 500 }
    );
  }
}

async function handleRefreshToken(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Create new token
    const newToken = createToken(authResult.user);

    const response = NextResponse.json({
      success: true,
      message: "Token refreshed",
      data: {
        token: newToken,
        expiresIn: "24h",
      },
    });

    // Update cookie with new token
    response.cookies.set({
      name: "auth_token",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
