/**
 * CSRF Token System
 * Prevents Cross-Site Request Forgery attacks
 */

import crypto from 'crypto';

// In-memory CSRF token store
// In production, use Redis or store in secure session
const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>();

const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a random CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Store CSRF token for a session/user
 */
export function storeCSRFToken(sessionId: string): string {
  const token = generateCSRFToken();
  const expiresAt = Date.now() + TOKEN_EXPIRY_TIME;

  csrfTokenStore.set(sessionId, {
    token,
    expiresAt,
  });

  // Clean up old entries while we're here
  cleanupExpiredTokens();

  return token;
}

/**
 * Verify CSRF token
 * @param sessionId - Session identifier
 * @param token - Token to verify
 * @returns true if valid, false otherwise
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const entry = csrfTokenStore.get(sessionId);

  if (!entry) {
    return false;
  }

  // Check if token expired
  if (entry.expiresAt < Date.now()) {
    csrfTokenStore.delete(sessionId);
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return constantTimeEquals(entry.token, token);
}

/**
 * Refresh CSRF token (generate new token while keeping session valid)
 */
export function refreshCSRFToken(sessionId: string): string {
  csrfTokenStore.delete(sessionId);
  return storeCSRFToken(sessionId);
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, entry] of csrfTokenStore.entries()) {
    if (entry.expiresAt < now) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach((key) => csrfTokenStore.delete(key));
}

/**
 * Constant-time string comparison
 * Prevents timing attacks
 */
function constantTimeEquals(token1: string, token2: string): boolean {
  if (token1.length !== token2.length) {
    return false;
  }

  let match = true;

  for (let i = 0; i < token1.length; i++) {
    if (token1[i] !== token2[i]) {
      match = false;
    }
  }

  return match;
}

/**
 * Extract session ID from cookies or headers
 */
export function getSessionId(headers: Record<string, any>): string {
  // Try to extract from Authorization header (e.g., JWT)
  const authHeader = headers['authorization'];
  if (authHeader) {
    return authHeader.replace('Bearer ', '');
  }

  // Try to extract from cookies
  const cookieHeader = headers['cookie'];
  if (cookieHeader) {
    const sessionCookie = cookieHeader
      .split(';')
      .find((c: string) => c.trim().startsWith('sessionId='));

    if (sessionCookie) {
      return sessionCookie.split('=')[1];
    }
  }

  return 'anonymous';
}

/**
 * Get CSRF token for rendering in HTML forms
 */
export function getCSRFTokenForSession(sessionId: string): string {
  const entry = csrfTokenStore.get(sessionId);

  if (!entry || entry.expiresAt < Date.now()) {
    return storeCSRFToken(sessionId);
  }

  return entry.token;
}

// Cleanup expired tokens every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    cleanupExpiredTokens();
  }, 60 * 60 * 1000);
}
