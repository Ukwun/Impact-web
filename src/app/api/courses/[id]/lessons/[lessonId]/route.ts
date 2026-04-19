import { NextRequest, NextResponse } from "next/server";
import { getLesson, updateLesson, deleteLesson } from "@/lib/firestore-utils";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// Validation schema for updating lesson
const UpdateLessonSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  videoThumbnail: z.string().url().optional(),
  duration: z.number().min(0).optional(),
  order: z.number().min(0).optional(),
  moduleId: z.string().optional(),
});

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/courses/[id]/lessons/[lessonId]
 * Get lesson details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const { id: courseId, lessonId } = params;

    // Fetch lesson from Firestore
    const lesson = await getLesson(courseId, lessonId);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error("❌ Get lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]/lessons/[lessonId]
 * Update lesson (creator or admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const { id: courseId, lessonId } = params;
    const user = getAuthUser(req);

    if (!user || !['FACILITATOR', 'ADMIN'].includes(user.role?.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = UpdateLessonSchema.parse(body);

    // Update lesson in Firestore
    const updatedLesson = await updateLesson(
      courseId,
      lessonId,
      validatedData
    );

    if (!updatedLesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Lesson updated: ${lessonId}`);

    return NextResponse.json({
      success: true,
      data: updatedLesson,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("❌ Update lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]/lessons/[lessonId]
 * Delete lesson (creator or admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const { id: courseId, lessonId } = params;
    const user = getAuthUser(req);

    if (!user || !['FACILITATOR', 'ADMIN'].includes(user.role?.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete lesson from Firestore
    const success = await deleteLesson(courseId, lessonId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Lesson deleted: ${lessonId}`);

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
