// Courses API - Complete course management with database
// GET /api/courses - List all courses
// POST /api/courses/:id/enroll - Enroll student in course

import { NextRequest, NextResponse } from "next/server";
import { CourseService, ProgressService } from "@/lib/database-service";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

// GET all courses with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * 12;
    const status = searchParams.get('status');

    const filters: any = {};
    if (status) filters.status = status;

    const result = await CourseService.listCourses(filters, skip, 12);

    const response = NextResponse.json(
      {
        success: true,
        data: result.courses,
        pagination: {
          total: result.total,
          page,
          pages: result.pages,
          pageSize: 12,
        },
      },
      { status: 200 }
    );

    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("Error fetching courses:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
