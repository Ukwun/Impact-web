// Analytics API - Platform and user statistics
// GET /api/analytics/platform - Platform statistics
// GET /api/analytics/course/[id] - Course analytics
// GET /api/analytics/user/[id] - User activity

import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/database-service";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

// GET platform statistics
export async function GET(req: NextRequest) {
  try {
    // For admin endpoints, verify authorization header if required path
    if (req.nextUrl.pathname.includes('/admin')) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        const response = NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
        return addCorsHeaders(response, req.headers.get("origin"));
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded || decoded.role !== 'ADMIN') {
        const response = NextResponse.json(
          { success: false, error: "Admin access required" },
          { status: 403 }
        );
        return addCorsHeaders(response, req.headers.get("origin"));
      }
    }

    const stats = await AnalyticsService.getPlatformStats();

    const response = NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );

    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("Error fetching analytics:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
