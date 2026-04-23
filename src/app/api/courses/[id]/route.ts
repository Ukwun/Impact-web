import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CourseService, ProgressService } from "@/lib/database-service";
import { getUserFromToken, verifyToken } from "@/lib/auth";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";
import { z } from "zod";

export const dynamic = 'force-dynamic';

// Validation schema for updating course
const UpdateCourseSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  duration: z.number().min(0).optional(),
  language: z.string().optional(),
  thumbnail: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/courses/[id]
 * Get course details including lessons and user's enrollment status
 * 
 * Response:
 * - 200: { success: true, course: {...}, isEnrolled: boolean, lessons: [...], progress: {...} }
 * - 404: Course not found
 * - 500: Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const user = await getUserFromToken(req);

    // Get course with all details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            videoUrl: true,
            order: true,
            moduleId: true,
            lessonMaterials: {
              select: {
                id: true,
                title: true,
                type: true,
                url: true,
                fileSize: true,
                uploadedAt: true,
              },
              orderBy: { uploadedAt: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check enrollment status if user is authenticated
    let isEnrolled = false;
    let userEnrollment = null;

    if (user) {
      userEnrollment = await prisma.enrollment.findUnique({
        where: {
          courseId_userId: {
            courseId: courseId,
            userId: user.id,
          },
        },
        include: {
          lessonProgress: {
            select: {
              lessonId: true,
              isCompleted: true,
            },
          },
        },
      });

      isEnrolled = !!userEnrollment;
    }

    // Transform response
    const response = {
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        difficulty: course.difficulty,
        duration: course.duration,
        language: course.language,
        instructor: `${course.createdBy.firstName} ${course.createdBy.lastName}`,
        enrollmentCount: course._count.enrollments,
        lessonCount: course._count.lessons,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
      },
      isEnrolled,
      enrollment: userEnrollment
        ? {
            id: userEnrollment.id,
            progress: userEnrollment.progress,
            isCompleted: userEnrollment.isCompleted,
            enrolledAt: userEnrollment.enrolledAt,
            lastAccessedAt: userEnrollment.lastAccessedAt,
            completedLessonIds: userEnrollment.lessonProgress
              .filter((lp) => lp.isCompleted)
              .map((lp) => lp.lessonId),
          }
        : null,
      lessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl,
        order: lesson.order,
        moduleId: lesson.moduleId,
        materials: lesson.lessonMaterials.map((material) => ({
          id: material.id,
          title: material.title,
          type: material.type,
          url: material.url,
          fileSize: material.fileSize,
        })),
        isCompleted: userEnrollment?.lessonProgress.some(
          (lp) => lp.lessonId === lesson.id && lp.isCompleted
        ) || false,
      })),
      modules: course.modules,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get course error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course details" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Update course (creator or admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const user = getAuthUser(req);

    // Verify authentication
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the course
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

    // Verify authorization (creator or admin)
    if (
      course.createdById !== user.sub &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this course" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = UpdateCourseSchema.parse(body);

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: validatedData,
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCourse.id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        instructor: `${updatedCourse.createdBy.firstName} ${updatedCourse.createdBy.lastName}`,
        isPublished: updatedCourse.isPublished,
        updatedAt: updatedCourse.updatedAt,
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

    console.error("Update course error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Soft delete course (archive it - creator or admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const user = getAuthUser(req);

    // Verify authentication
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { createdById: true, title: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Verify authorization (creator or admin)
    if (
      course.createdById !== user.sub &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this course" },
        { status: 403 }
      );
    }

    // Soft delete (archive) the course
    await prisma.course.update({
      where: { id: courseId },
      data: { isArchived: true },
    });

    return NextResponse.json({
      success: true,
      message: `Course "${course.title}" has been archived`,
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
