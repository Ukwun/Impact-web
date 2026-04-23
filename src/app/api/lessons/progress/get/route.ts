import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract and verify user from auth token
 */
function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Verify user owns this enrollment
 */
async function verifyEnrollmentOwnership(userId: string, enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true },
  });

  if (!enrollment) {
    throw new Error("ENROLLMENT_NOT_FOUND");
  }

  if (enrollment.userId !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  return true;
}

/**
 * Calculate completion percentage
 */
function calculatePercentage(secondsWatched: number, durationMinutes: number) {
  const durationSeconds = durationMinutes * 60;
  return Math.min(100, Math.round((secondsWatched / durationSeconds) * 100));
}

/**
 * Get single lesson progress with full details
 */
async function getLessonProgressDetail(lessonId: string, enrollmentId: string) {
  const [lesson, progress] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { duration: true, title: true, courseId: true },
    }),
    prisma.lessonProgress.findUnique({
      where: { lessonId_enrollmentId: { lessonId, enrollmentId } },
    }),
  ]);

  if (!lesson) {
    throw new Error("LESSON_NOT_FOUND");
  }

  const secondsWatched = progress?.secondsWatched || 0;
  const completionPercentage = calculatePercentage(secondsWatched, lesson.duration);

  return {
    lessonId,
    title: lesson.title,
    duration: lesson.duration,
    secondsWatched,
    completionPercentage,
    isCompleted: progress?.isCompleted || false,
    completedAt: progress?.completedAt || null,
    lastAccessedAt: progress?.updatedAt || null,
    viewCount: progress?.viewCount || 0,
    hasProgress: !!progress,
  };
}

/**
 * Get all lessons in course with progress
 */
async function getCourseProgressDetail(
  courseId: string,
  enrollmentId: string
) {
  const [course, lessons, allProgress] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, duration: true },
    }),
    prisma.lesson.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        duration: true,
        order: true,
        moduleId: true,
      },
      orderBy: { order: "asc" },
    }),
    prisma.lessonProgress.findMany({
      where: { enrollmentId },
    }),
  ]);

  if (!course) {
    throw new Error("COURSE_NOT_FOUND");
  }

  const progressMap = new Map(
    allProgress.map((p) => [p.lessonId, p])
  );

  const lessonsWithProgress = lessons.map((lesson) => {
    const progress = progressMap.get(lesson.id);
    const secondsWatched = progress?.secondsWatched || 0;
    const completionPercentage = calculatePercentage(
      secondsWatched,
      lesson.duration
    );

    return {
      lessonId: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      order: lesson.order,
      moduleId: lesson.moduleId,
      secondsWatched,
      completionPercentage,
      isCompleted: progress?.isCompleted || false,
      lastAccessedAt: progress?.updatedAt || null,
    };
  });

  // Calculate course stats
  const lessonsCompleted = lessonsWithProgress.filter(
    (l) => l.isCompleted
  ).length;
  const totalLessons = lessonsWithProgress.length;
  const completionPercentage =
    totalLessons > 0
      ? Math.round(
          lessonsWithProgress.reduce((sum, l) => sum + l.completionPercentage, 0) /
            totalLessons
        )
      : 0;
  const totalTimeSpent = lessonsWithProgress.reduce(
    (sum, l) => sum + l.secondsWatched,
    0
  );

  return {
    courseId,
    title: course.title,
    courseDuration: course.duration,
    lessons: lessonsWithProgress,
    stats: {
      totalLessons,
      lessonsCompleted,
      lessonsNotStarted: totalLessons - lessonsCompleted,
      completionPercentage,
      totalTimeSpent,
      estimatedHoursRemaining: Math.ceil(
        (course.duration - totalTimeSpent / 60) / 60
      ),
    },
  };
}

/**
 * Get progress for all enrollments
 */
async function getUserProgressSummary(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          duration: true,
          thumbnail: true,
        },
      },
      lessonProgress: true,
    },
    orderBy: { lastAccessedAt: "desc" },
  });

  const enrollmentProgress = enrollments.map((enrollment) => {
    // Get all lessons in course
    let totalLessons = 0;
    const completedLessons = enrollment.lessonProgress.filter(
      (lp) => lp.isCompleted
    ).length;
    const totalDuration = enrollment.course.duration;
    const timeSpent = enrollment.lessonProgress.reduce(
      (sum, lp) => sum + lp.secondsWatched,
      0
    );

    // Estimate total lessons (assuming average 5 min per lesson)
    totalLessons = Math.ceil(totalDuration / 5);

    const completionPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      enrollmentId: enrollment.id,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.title,
      courseThumbnail: enrollment.course.thumbnail,
      completionPercentage,
      lessonsCompleted: completedLessons,
      totalLessons,
      timeSpent,
      enrolledAt: enrollment.enrolledAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      status: enrollment.status,
    };
  });

  // Calculate user-wide stats
  const totalCompletionPercentage =
    enrollmentProgress.length > 0
      ? Math.round(
          enrollmentProgress.reduce((sum, e) => sum + e.completionPercentage, 0) /
            enrollmentProgress.length
        )
      : 0;
  const totalCoursesStarted = enrollmentProgress.length;
  const totalCoursesCompleted = enrollmentProgress.filter(
    (e) => e.completionPercentage === 100
  ).length;
  const totalTimeSpent = enrollmentProgress.reduce(
    (sum, e) => sum + e.timeSpent,
    0
  );

  return {
    enrollments: enrollmentProgress,
    summary: {
      totalCoursesStarted,
      totalCoursesCompleted,
      averageCompletionPercentage: totalCompletionPercentage,
      totalTimeSpent,
      totalHoursSpent: Math.round(totalTimeSpent / 3600),
    },
  };
}

// ============================================================================
// GET ENDPOINT
// ============================================================================

/**
 * GET /api/lessons/progress
 * Retrieve lesson progress with flexible filtering
 *
 * Query Parameters:
 * - type: "summary" | "course" | "lesson" | "module" (default: "summary")
 * - enrollmentId: string (required for course/lesson/module)
 * - lessonId: string (required for type=lesson)
 * - moduleId: string (required for type=module)
 * - courseId: string (optional, for course type)
 *
 * Examples:
 * GET /api/lessons/progress?type=summary
 *   -> Get all enrollments and progress for authenticated user
 *
 * GET /api/lessons/progress?type=course&enrollmentId=xxx
 *   -> Get all lessons in course with progress
 *
 * GET /api/lessons/progress?type=lesson&enrollmentId=xxx&lessonId=yyy
 *   -> Get single lesson progress
 *
 * GET /api/lessons/progress?type=module&enrollmentId=xxx&moduleId=yyy
 *   -> Get all lessons in module with progress
 *
 * Response varies by type:
 * - 200: Success with appropriate data structure
 * - 400: Invalid query parameters
 * - 401: Unauthorized
 * - 404: Not found
 * - 500: Server error
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ STEP 1: Verify authentication
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const userId = authUser.sub;

    // ✅ STEP 2: Parse query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "summary";
    const enrollmentId = url.searchParams.get("enrollmentId");
    const lessonId = url.searchParams.get("lessonId");
    const moduleId = url.searchParams.get("moduleId");
    const courseId = url.searchParams.get("courseId");

    console.log(`📖 Fetching progress - Type: ${type} | User: ${userId}`);

    // ✅ STEP 3: Route by type
    switch (type) {
      // Get summary of all enrollments
      case "summary": {
        const data = await getUserProgressSummary(userId);
        return NextResponse.json({
          success: true,
          type: "summary",
          data,
        });
      }

      // Get all lessons in a course
      case "course": {
        if (!enrollmentId) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required parameter: enrollmentId",
            },
            { status: 400 }
          );
        }

        // Verify ownership
        try {
          await verifyEnrollmentOwnership(userId, enrollmentId);
        } catch (error: any) {
          if (error.message === "UNAUTHORIZED") {
            return NextResponse.json(
              {
                success: false,
                error: "You do not have access to this enrollment",
              },
              { status: 403 }
            );
          }
          throw error;
        }

        // Get course ID from enrollment
        const enrollment = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          select: { courseId: true },
        });

        if (!enrollment) {
          return NextResponse.json(
            { success: false, error: "Enrollment not found" },
            { status: 404 }
          );
        }

        const data = await getCourseProgressDetail(
          enrollment.courseId,
          enrollmentId
        );

        return NextResponse.json({
          success: true,
          type: "course",
          data,
        });
      }

      // Get single lesson progress
      case "lesson": {
        if (!enrollmentId || !lessonId) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Missing required parameters: enrollmentId and lessonId",
            },
            { status: 400 }
          );
        }

        // Verify ownership
        try {
          await verifyEnrollmentOwnership(userId, enrollmentId);
        } catch (error: any) {
          if (error.message === "UNAUTHORIZED") {
            return NextResponse.json(
              {
                success: false,
                error: "You do not have access to this enrollment",
              },
              { status: 403 }
            );
          }
          throw error;
        }

        try {
          const data = await getLessonProgressDetail(lessonId, enrollmentId);
          return NextResponse.json({
            success: true,
            type: "lesson",
            data,
          });
        } catch (error: any) {
          if (error.message === "LESSON_NOT_FOUND") {
            return NextResponse.json(
              { success: false, error: "Lesson not found" },
              { status: 404 }
            );
          }
          throw error;
        }
      }

      // Get all lessons in module
      case "module": {
        if (!enrollmentId || !moduleId) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required parameters: enrollmentId and moduleId",
            },
            { status: 400 }
          );
        }

        // Verify ownership
        try {
          await verifyEnrollmentOwnership(userId, enrollmentId);
        } catch (error: any) {
          if (error.message === "UNAUTHORIZED") {
            return NextResponse.json(
              {
                success: false,
                error: "You do not have access to this enrollment",
              },
              { status: 403 }
            );
          }
          throw error;
        }

        const [moduleData, lessons, allProgress] = await Promise.all([
          prisma.module.findUnique({
            where: { id: moduleId },
            select: { title: true, courseId: true, order: true },
          }),
          prisma.lesson.findMany({
            where: { moduleId },
            select: {
              id: true,
              title: true,
              duration: true,
              order: true,
            },
            orderBy: { order: "asc" },
          }),
          prisma.lessonProgress.findMany({
            where: { enrollmentId },
          }),
        ]);

        if (!moduleData) {
          return NextResponse.json(
            { success: false, error: "Module not found" },
            { status: 404 }
          );
        }

        const progressMap = new Map(
          allProgress.map((p) => [p.lessonId, p])
        );

        const lessonsWithProgress = lessons.map((lesson) => {
          const progress = progressMap.get(lesson.id);
          const secondsWatched = progress?.secondsWatched || 0;
          const completionPercentage = calculatePercentage(
            secondsWatched,
            lesson.duration
          );

          return {
            lessonId: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            order: lesson.order,
            secondsWatched,
            completionPercentage,
            isCompleted: progress?.isCompleted || false,
          };
        });

        const lessonsCompleted = lessonsWithProgress.filter(
          (l) => l.isCompleted
        ).length;
        const totalLessons = lessonsWithProgress.length;
        const completionPercentage =
          totalLessons > 0
            ? Math.round(
                lessonsWithProgress.reduce(
                  (sum, l) => sum + l.completionPercentage,
                  0
                ) / totalLessons
              )
            : 0;

        return NextResponse.json({
          success: true,
          type: "module",
          data: {
            moduleId,
            title: moduleData.title,
            courseId: moduleData.courseId,
            order: moduleData.order,
            lessons: lessonsWithProgress,
            stats: {
              totalLessons,
              lessonsCompleted,
              completionPercentage,
            },
          },
        });
      }

      // Invalid type
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Invalid type parameter: ${type}. Must be one of: summary, course, lesson, module`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ Error fetching progress:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while fetching progress",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
