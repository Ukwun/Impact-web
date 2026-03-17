import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect routes and handle authentication
 * Runs on every request to the server
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or localStorage (passed via header from client)
  const token = request.cookies.get('auth_token')?.value;
  const authHeader = request.headers.get('authorization');

  // Public routes that don't require auth
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/forgot-password',
    '/about',
    '/community',
    '/events',
    '/learning',
    '/programmes',
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // If trying to access protected route without auth
  if (isProtectedRoute && !token && !authHeader) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Allow authenticated users to access the login/register pages so they can
  // log out / switch accounts. These pages will display a prompt when already signed in.
  // NOTE: This prevents the middleware from stealing users back to /dashboard.

  // Add security headers to all responses
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (CSP) - allow Google Fonts and WebSocket connections
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
