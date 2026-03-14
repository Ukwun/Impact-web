import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/courses/[id]/lessons
 * Get all lessons for a course with user's progress
 * 
 * Response:
 * - 200: { success: true, lessons: [...] }
 * - 404: Course not found or not enrolled
 * - 401: Not authenticated
 * - 500: Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Verify user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId: courseId,
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

    // Get all lessons with user's progress
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: {
        progress: {
          where: {
            enrollmentId: enrollment.id,
          },
          select: {
            isCompleted: true,
            completedAt: true,
            secondsWatched: true,
          },
        },
        materials: {
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            fileSize: true,
          },
        },
        _count: {
          select: {
            notes: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const transformedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      videoThumbnail: lesson.videoThumbnail,
      duration: lesson.duration,
      order: lesson.order,
      moduleId: lesson.moduleId,
      materials: lesson.materials,
      progress: lesson.progress && lesson.progress.length > 0 ? lesson.progress[0] : null,
      notesCount: lesson._count.notes,
    }));

    return NextResponse.json({
      success: true,
      courseId,
      enrollmentId: enrollment.id,
      lessons: transformedLessons,
    });
  } catch (error) {
    console.error("Get lessons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
