import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
function getAuthUser(req: NextRequest) {
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
    const courseId = params.id;
    const lessonId = params.lessonId;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        materials: {
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            fileSize: true,
          },
        },
      },
    });

    if (!lesson || lesson.courseId !== courseId) {
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
    console.error("Get lesson error:", error);
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
    const courseId = params.id;
    const lessonId = params.lessonId;
    const user = getAuthUser(req);

    // Verify authentication
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the lesson and course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    });

    if (!lesson || lesson.courseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get course and verify creator/admin
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { createdById: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Verify authorization
    if (
      course.createdById !== user.sub &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this lesson" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = UpdateLessonSchema.parse(body);

    // Update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLesson.id,
        title: updatedLesson.title,
        description: updatedLesson.description,
        updatedAt: updatedLesson.updatedAt,
      },
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

    console.error("Update lesson error:", error);
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
    const courseId = params.id;
    const lessonId = params.lessonId;
    const user = getAuthUser(req);

    // Verify authentication
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the lesson and course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true, title: true },
    });

    if (!lesson || lesson.courseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get course and verify creator/admin
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { createdById: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Verify authorization
    if (
      course.createdById !== user.sub &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this lesson" },
        { status: 403 }
      );
    }

    // Delete lesson (cascade deletes materials, progress, etc.)
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({
      success: true,
      message: `Lesson "${lesson.title}" has been deleted`,
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
