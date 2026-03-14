import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

/**
 * POST /api/lessons/[id]/complete
 * Mark a lesson as completed
 * 
 * Request Body: (optional)
 * {
 *   "secondsWatched": number
 * }
 * 
 * Response:
 * - 200: { success: true, progress: {...} }
 * - 401: Not authenticated
 * - 403: Not enrolled in course
 * - 404: Lesson not found
 * - 500: Server error
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const lessonId = params.id;
    let secondsWatched = 0;

    try {
      const body = await req.json();
      if (body.secondsWatched) {
        secondsWatched = body.secondsWatched;
      }
    } catch {
      // No body, that's okay
    }

    // Get lesson with course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        courseId: true,
        duration: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId: lesson.courseId,
          userId: user.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Upsert lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        lessonId_enrollmentId: {
          lessonId: lessonId,
          enrollmentId: enrollment.id,
        },
      },
      create: {
        lessonId: lessonId,
        enrollmentId: enrollment.id,
        isCompleted: true,
        completedAt: new Date(),
        secondsWatched: secondsWatched || lesson.duration * 60,
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        secondsWatched: Math.max(
          (await prisma.lessonProgress.findUnique({
            where: {
              lessonId_enrollmentId: {
                lessonId: lessonId,
                enrollmentId: enrollment.id,
              },
            },
          }))?.secondsWatched || 0,
          secondsWatched
        ),
      },
    });

    // Update enrollment progress
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
      },
    });

    const newProgress = Math.round((completedLessons / totalLessons) * 100);

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: newProgress,
        lastAccessedAt: new Date(),
      },
    });

    console.log(
      `✅ User ${user.id} completed lesson ${lessonId}, course progress: ${newProgress}%`
    );

    return NextResponse.json({
      success: true,
      message: "Lesson marked as completed",
      progress: {
        lessonId: progress.lessonId,
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt,
        secondsWatched: progress.secondsWatched,
      },
      courseProgress: {
        enrollmentId: updatedEnrollment.id,
        progress: updatedEnrollment.progress,
        completedAt: updatedEnrollment.completedAt,
        completedLessons,
        totalLessons,
      },
    });
  } catch (error) {
    console.error("Mark lesson complete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark lesson as completed" },
      { status: 500 }
    );
  }
}
