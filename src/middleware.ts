import { NextRequest, NextResponse } from 'next/server';

// --- User Activity Tracking Helper ---
async function trackUserActivity(request: NextRequest) {
  try {
    // Only track for authenticated users (example: check for session cookie or header)
    const userId = request.cookies.get('userId')?.value;
    if (!userId) return;

    // Track only for page navigations (GET requests)
    if (request.method !== 'GET') return;

    // Collect basic activity data
    const activity = {
      userId,
      path: request.nextUrl.pathname,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent'),
      ip: request.ip,
    };

    // Send to your tracking API endpoint (implement /api/activity)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
  } catch (e) {
    // Fail silently
  }
}

/**
 * Middleware to add security headers
 * Authentication is handled client-side via Zustand store
 */
export async function middleware(request: NextRequest) {
  // Track user activity (non-blocking)
  trackUserActivity(request);

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: ws: wss:;"
  );
  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|offline.html|.*\\.png$|.*\\.jpg$|.*\\.webp$).*)',
  ],
};
