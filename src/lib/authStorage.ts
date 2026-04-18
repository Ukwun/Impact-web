/**
 * Shared auth storage keys used across the client for consistent behavior.
 */

export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_KEY = "auth_user";
export const AUTH_STORE_KEY = "impactedu-auth-store";

/**
 * Store auth token in both localStorage AND cookies
 * Cookies are needed for middleware to recognize authenticated requests
 */
export function setAuthTokenAndCookie(token: string) {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  
  // Store in cookie (7 days expiry)
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (7 * 24 * 60 * 60 * 1000));
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; expires=${expiryDate.toUTCString()}; Secure; SameSite=Lax`;
}

/**
 * Clear auth token from both localStorage AND cookies
 */
export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(AUTH_TOKEN_KEY);
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}
