/**
 * Authentication Service & Guards
 * Comprehensive auth utilities, middleware, and role-based access control
 * ImpactApp Platform - April 23, 2026
 */

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken as verifyJwtToken } from '@/lib/auth';

// ========================================================================
// TYPES
// ========================================================================

export type UserRole = 'STUDENT' | 'FACILITATOR' | 'PARENT' | 'ADMIN' | 'SUPER_ADMIN' | 'SCHOOL_ADMIN';

export interface AuthToken {
  userId: string;
  email: string;
  role: UserRole;
  schoolId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

function normalizeRole(rawRole: string | undefined): UserRole {
  const role = String(rawRole || 'STUDENT').toUpperCase();
  if (role === 'FACILITATOR') return 'FACILITATOR';
  if (role === 'PARENT') return 'PARENT';
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (role === 'SCHOOL_ADMIN') return 'SCHOOL_ADMIN';
  return 'STUDENT';
}

function parseStandardJwtToken(token: string): AuthToken | null {
  const payload = verifyJwtToken(token);
  if (!payload) return null;

  const role = normalizeRole(payload.role);
  return {
    userId: payload.sub,
    email: payload.email,
    role,
    schoolId: '',
    permissions: ROLE_PERMISSIONS[role] || [],
    iat: payload.iat,
    exp: payload.exp,
  };
}

export interface AuthContext {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    schoolId: string;
  };
  token?: string;
  error?: string;
}

// ========================================================================
// CONSTANTS
// ========================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Role-based permission mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    'manage_all',
    'manage_users',
    'manage_schools',
    'manage_courses',
    'view_analytics',
  ],
  ADMIN: [
    'manage_school',
    'manage_users',
    'manage_courses',
    'view_analytics',
    'manage_alerts',
  ],
  SCHOOL_ADMIN: [
    'manage_courses',
    'view_analytics',
    'view_students',
    'manage_facilitators',
  ],
  FACILITATOR: [
    'create_courses',
    'manage_own_courses',
    'grade_assignments',
    'view_student_progress',
    'send_messages',
    'create_announcements',
  ],
  PARENT: [
    'view_child_progress',
    'view_assignments',
    'send_messages',
    'view_grades',
    'access_reports',
  ],
  STUDENT: [
    'view_courses',
    'submit_assignments',
    'view_grades',
    'create_projects',
    'send_messages',
    'view_progress',
  ],
};

// Route protection mapping
const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/dashboard/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/student': ['STUDENT'],
  '/dashboard/parent': ['PARENT'],
  '/dashboard/facilitator': ['FACILITATOR'],
  '/learning/rhythm': ['STUDENT', 'FACILITATOR', 'PARENT'],
  '/projects': ['STUDENT', 'FACILITATOR'],
  '/api/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/api/facilitator': ['FACILITATOR', 'ADMIN', 'SUPER_ADMIN'],
  '/api/parent': ['PARENT', 'ADMIN', 'SUPER_ADMIN'],
  '/api/student': ['STUDENT', 'ADMIN', 'SUPER_ADMIN'],
};

// ========================================================================
// TOKEN MANAGEMENT
// ========================================================================

/**
 * Create JWT token
 */
export async function createToken(payload: Omit<AuthToken, 'iat' | 'exp'>): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + Math.floor(TOKEN_EXPIRY / 1000);

  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new Promise<string>((resolve, reject) => {
    const payload_with_time = { ...payload, iat, exp };
    // In production, use jose library properly
    resolve(JSON.stringify(payload_with_time)); // Simplified for demo
  });

  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<AuthToken | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    // In production, implement proper JWT verification
    const decoded = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
    
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    return decoded as AuthToken;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// ========================================================================
// AUTHENTICATION VERIFICATION
// ========================================================================

/**
 * Get current authenticated user from request
 */
export async function getAuthUser(request: NextRequest): Promise<AuthToken | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value ||
                cookieStore.get('authToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const standardJwt = parseStandardJwtToken(token);
  if (standardJwt) return standardJwt;

  return await verifyToken(token);
}

/**
 * Verify authentication (Server-side)
 */
export async function verifyAuth(): Promise<AuthContext> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return { isAuthenticated: false };
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.email.split('@')[0], // Placeholder
        role: decoded.role,
        schoolId: decoded.schoolId,
      },
      token,
    };
  } catch (error) {
    return { isAuthenticated: false, error: 'Auth verification failed' };
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission) || permissions.includes('manage_all');
}

/**
 * Check if user can access route
 */
export function canAccessRoute(userRole: UserRole, routePath: string): boolean {
  const allowedRoles = PROTECTED_ROUTES[routePath];
  if (!allowedRoles) {
    return true; // Public route
  }
  return allowedRoles.includes(userRole);
}

// ========================================================================
// MIDDLEWARE FUNCTIONS
// ========================================================================

/**
 * Authentication middleware for API routes
 */
export async function authMiddleware(request: NextRequest) {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Add user to request context (attach to headers for handler access)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.userId);
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-school-id', user.schoolId);

  return {
    user,
    request: new NextRequest(request.nextUrl, {
      ...request,
      headers: requestHeaders,
    }),
  };
}

/**
 * Role-based access control middleware
 */
export async function roleMiddleware(request: NextRequest, requiredRoles: UserRole[]) {
  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) {
    return authResult; // Not authenticated
  }

  const { user } = authResult;

  if (!requiredRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Data access middleware - ensure users can only access their own data
 */
export async function dataAccessMiddleware(
  request: NextRequest,
  requestedUserId: string
): Promise<boolean> {
  const user = await getAuthUser(request);

  if (!user) {
    return false;
  }

  // Super admins can access anything
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Admins can access school data
  if (user.role === 'ADMIN' || user.role === 'SCHOOL_ADMIN') {
    return true; // TODO: Add school validation
  }

  // Users can access their own data
  return user.userId === requestedUserId;
}

// ========================================================================
// ERROR HANDLING
// ========================================================================

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authErrors = {
  INVALID_TOKEN: new AuthError('INVALID_TOKEN', 'Invalid or expired token', 401),
  MISSING_TOKEN: new AuthError('MISSING_TOKEN', 'Authorization token is required', 401),
  INSUFFICIENT_PERMISSIONS: new AuthError(
    'INSUFFICIENT_PERMISSIONS',
    'You do not have permission to access this resource',
    403
  ),
  INVALID_CREDENTIALS: new AuthError('INVALID_CREDENTIALS', 'Invalid email or password', 401),
  USER_NOT_FOUND: new AuthError('USER_NOT_FOUND', 'User not found', 404),
};

// ========================================================================
// UTILITIES
// ========================================================================

/**
 * Generate safe redirect after auth
 */
export function getRedirectUrl(role: UserRole): string {
  const redirectMap: Record<UserRole, string> = {
    SUPER_ADMIN: '/dashboard/admin',
    ADMIN: '/dashboard/admin',
    SCHOOL_ADMIN: '/dashboard/admin',
    FACILITATOR: '/dashboard/facilitator',
    PARENT: '/dashboard/parent',
    STUDENT: '/dashboard/student',
  };

  return redirectMap[role] || '/dashboard';
}

/**
 * Extract user info from request headers (set by middleware)
 */
export function getUserFromHeaders(headers: Headers) {
  return {
    userId: headers.get('x-user-id'),
    role: headers.get('x-user-role') as UserRole | null,
    schoolId: headers.get('x-school-id'),
  };
}

/**
 * Rate limit check (implement with Redis in production)
 */
export async function checkRateLimit(userId: string): Promise<boolean> {
  // TODO: Implement with Redis
  // For now, always return true
  return true;
}
