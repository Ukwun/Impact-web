import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const UpdateLessonSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  videoThumbnail: z.string().url().optional(),
  duration: z.number().min(1).optional(),
  order: z.number().min(1).optional(),
  moduleId: z.string().optional(),
});

// Helper to verify authentication
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        materials: true,
        course: {
          select: {
            id: true,
            title: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    const lessonResponse = {
      id: lesson.id,
      courseId: lesson.courseId,
      courseName: lesson.course.title,
      instructor: lesson.course.createdBy ? `${lesson.course.createdBy.firstName} ${lesson.course.createdBy.lastName}` : 'Unknown Instructor',
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      videoThumbnail: lesson.videoThumbnail,
      duration: lesson.duration,
      materials: lesson.materials.map((m: any) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        url: m.url,
        fileSize: m.fileSize,
      })),
      createdAt: lesson.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: lessonResponse,
    });
  } catch (error) {
    console.error("Fetch lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/lessons/[id]
 * Update a lesson (course creator or admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;

    // Verify authentication
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get lesson with course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { createdById: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Verify authorization (course creator or admin)
    const isAdmin = user.role?.toUpperCase() === "ADMIN";
    const isCreator = lesson.course.createdById === user.sub;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { success: false, error: "You can only update lessons in your own courses" },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validatedData = UpdateLessonSchema.parse(body);

    // Update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: validatedData,
    });

    console.log(`✅ Lesson updated: ${lessonId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLesson.id,
        title: updatedLesson.title,
        description: updatedLesson.description,
        duration: updatedLesson.duration,
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

    console.error("❌ Update lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lessons/[id]
 * Delete a lesson (course creator or admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id;

    // Verify authentication
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get lesson with course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { createdById: true, title: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Verify authorization (course creator or admin)
    const isAdmin = user.role?.toUpperCase() === "ADMIN";
    const isCreator = lesson.course.createdById === user.sub;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { success: false, error: "You can only delete lessons in your own courses" },
        { status: 403 }
      );
    }

    // Delete lesson (cascade deletes related progress, notes, materials)
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    console.log(`✅ Lesson deleted: ${lessonId}`);

    return NextResponse.json({
      success: true,
      message: `Lesson has been deleted`,
    });
  } catch (error) {
    console.error("❌ Delete lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
