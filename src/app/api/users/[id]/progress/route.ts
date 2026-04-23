// User Progress API - Track learning progress
// GET /api/users/[id]/progress - Get user's learning progress
// POST /api/users/[id]/progress - Update progress

import { NextRequest, NextResponse } from "next/server";
import { ProgressService, NotificationService } from "@/lib/database-service";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

// GET user's progress
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
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

    if (!decoded || decoded.sub !== params.id) {
      const response = NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const courseId = req.nextUrl.searchParams.get('courseId');
    const progress = await ProgressService.getUserProgress(params.id, courseId || undefined);

    const response = NextResponse.json(
      {
        success: true,
        data: progress,
      },
      { status: 200 }
    );

    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("Error fetching progress:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

// POST update progress
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
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

    if (!decoded || decoded.sub !== params.id) {
      const response = NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const body = await req.json();
    const { courseId, lessonId, progress } = body;

    if (!courseId || !lessonId || progress === undefined) {
      const response = NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const updated = await ProgressService.updateProgress(
      params.id,
      courseId,
      lessonId,
      Math.min(100, Math.max(0, progress))
    );

    // Send notification on lesson completion
    if (progress >= 100) {
      await NotificationService.createNotification(params.id, {
        type: 'LESSON_COMPLETED',
        title: 'Lesson Completed! 🎉',
        message: 'Great job! You have completed a lesson.',
        relatedId: lessonId,
      });
    }

    const response = NextResponse.json(
      {
        success: true,
        data: updated,
        message: progress >= 100 ? "Lesson completed! Well done!" : "Progress updated",
      },
      { status: 200 }
    );

    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("Error updating progress:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
