import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/courses/[id]
 * Get course details including lessons and user's enrollment status
 * 
 * Response:
 * - 200: { success: true, course: {...}, isEnrolled: boolean, lessons: [...] }
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
