import { NextResponse, NextRequest } from "next/server";

/**
 * CORS Configuration for API routes
 * Allows requests from Netlify frontend to Render backend
 */
const ALLOWED_ORIGINS = [
  "https://impactweb.netlify.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  
  return response;
}

/**
 * Handle CORS preflight OPTIONS requests
 */
export function handleCorsOptions(req: NextRequest): NextResponse | null {
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, req.headers.get("origin") || undefined);
  }
  return null;
}

/**
 * Middleware to apply CORS to all responses
 * Use in API routes like:
 * 
 * export async function POST(req: NextRequest) {
 *   // Handle CORS preflight
 *   const corsResponse = handleCorsOptions(req);
 *   if (corsResponse) return corsResponse;
 *   
 *   try {
 *     // ... your handler logic
 *     const response = NextResponse.json({ success: true });
 *     return addCorsHeaders(response, req.headers.get("origin") || undefined);
 *   } catch (err) {
 *     const response = NextResponse.json({ error: "message" }, { status: 500 });
 *     return addCorsHeaders(response, req.headers.get("origin") || undefined);
 *   }
 * }
 */
