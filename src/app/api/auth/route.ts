/**
 * Authentication API Routes
 * /api/auth - User login, logout, and token verification
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, createToken, verifyToken } from "@/lib/auth-service";
import { cookies } from "next/headers";

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

    // TODO: Fetch user from database and verify password
    // const user = await prisma.user.findUnique({ where: { email } });
    // if (!user || !verifyPassword(password, user.passwordHash)) {
    //   return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    // }

    // Mock user for demonstration
    const mockUser = {
      id: "user-" + Date.now(),
      email: email,
      name: "Test User",
      role: "STUDENT",
      school: "Central High School",
    };

    // Create JWT token
    const token = createToken(mockUser);

    // Set secure cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: mockUser,
        token: token,
        expiresIn: "24h",
      },
    });

    // Set HTTP-only cookie for token
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
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
        expiresAt: authResult.expiresAt,
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
