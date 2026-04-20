import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/parent/children/:childId/progress
 * Get a specific child's course progress (with permission check)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    // Verify parent authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parentId = payload.userId;
    const childId = params.childId;

    // ============================================================================
    // VERIFY PARENT HAS PERMISSION TO VIEW THIS CHILD'S PROGRESS
    // ============================================================================
    const parentChild = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId,
          childId,
        },
      },
    });

    if (!parentChild || !parentChild.isActive) {
      return NextResponse.json(
        { error: "Child not found or access denied" },
        { status: 404 }
      );
    }

    if (!parentChild.canViewProgress) {
      return NextResponse.json(
        { error: "Permission denied - cannot view progress" },
        { status: 403 }
      );
    }

    // ============================================================================
    // GET CHILD'S COURSE ENROLLMENTS AND PROGRESS
    // ============================================================================
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: childId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            duration: true,
          },
        },
        lessonProgress: {
          select: {
            lessonId: true,
            isCompleted: true,
          },
        },
      },
    });

    // Get lesson count for each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = await prisma.lesson.count({
          where: { courseId: enrollment.course.id },
        });

        const completedLessons = enrollment.lessonProgress.filter(
          (lp) => lp.isCompleted
        ).length;

        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          courseId: enrollment.course.id,
          courseName: enrollment.course.title,
          description: enrollment.course.description,
          difficulty: enrollment.course.difficulty,
          duration: enrollment.course.duration,
          enrolledAt: enrollment.enrolledAt,
          isCompleted: enrollment.isCompleted,
          completedAt: enrollment.completedAt,
          progress: progressPercentage,
          lessonsCompleted: completedLessons,
          totalLessons,
        };
      })
    );

    // ============================================================================
    // GET CHILD'S BASIC INFO
    // ============================================================================
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      child: {
        id: childId,
        name: `${child?.firstName} ${child?.lastName}`,
        email: child?.email,
        avatar: child?.avatar,
      },
      courses: coursesWithProgress,
      totalCourses: coursesWithProgress.length,
      completedCourses: coursesWithProgress.filter((c) => c.isCompleted).length,
      averageProgress:
        coursesWithProgress.length > 0
          ? Math.round(
              coursesWithProgress.reduce((sum, c) => sum + c.progress, 0) /
                coursesWithProgress.length
            )
          : 0,
    });
  } catch (error) {
    console.error("Error fetching child progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
