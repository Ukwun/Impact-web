import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFirestore } from "@/lib/firebase-admin";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const jwtSecret: string = JWT_SECRET;

// ============================================================================
// JWT UTILITIES
// ============================================================================

export interface JWTPayload {
  sub: string; // userId
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(
    {
      ...payload,
    },
    jwtSecret,
    {
      expiresIn: "30d", // Token expires in 30 days
    }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode JWT token without verification (for inspection)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcryptjs.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*)"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password strength (simpler version - can be used as default)
 */
export function validatePasswordSimple(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// REQUEST UTILITIES
// ============================================================================

/**
 * Extract bearer token from request headers
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

/**
 * Authenticate user from request
 * Extracts token from Authorization header and verifies it, then fetches user from database
 */
export async function authenticateUser(request: NextRequest): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractToken(authHeader || "");

    if (!token) {
      return { success: false, error: "No token provided" };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return { success: false, error: "Invalid token" };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.isActive === false) {
      return { success: false, error: "Account is deactivated" };
    }

    let resolvedUser: any = user;

    // Enforce authoritative account state from Firestore (if available)
    // so role/status changes invalidate stale token assumptions.
    try {
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(payload.sub).get();

      if (userDoc.exists) {
        const userData = userDoc.data() as any;

        if (userData?.isActive === false) {
          return { success: false, error: "Account is deactivated" };
        }

        if (userData?.tokenInvalidBefore) {
          const invalidAfterMs = new Date(userData.tokenInvalidBefore).getTime();
          const tokenIssuedAtMs = Number(payload.iat || 0) * 1000;
          if (!Number.isNaN(invalidAfterMs) && tokenIssuedAtMs < invalidAfterMs) {
            return { success: false, error: "Token is no longer valid. Please sign in again." };
          }
        }

        resolvedUser = {
          ...user,
          role: userData?.role || user.role,
          approvalStatus: userData?.approvalStatus || "APPROVED",
          requestedRole: userData?.requestedRole || null,
          verified: typeof userData?.verified === "boolean" ? userData.verified : user.verified,
        };
      }
    } catch (firestoreError) {
      // Keep compatibility when Firestore is temporarily unavailable.
      resolvedUser = user;
    }

    return { success: true, user: resolvedUser };
  } catch (error) {
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Get user from request token (convenience function)
 * Returns user directly or null if authentication fails
 */
export async function getUserFromToken(request: NextRequest): Promise<any | null> {
  const authResult = await authenticateUser(request);
  return authResult.success ? authResult.user : null;
}
