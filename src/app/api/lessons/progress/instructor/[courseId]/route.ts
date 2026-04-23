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
 * Check if user is a facilitator/instructor for a course
 */
async function verifyInstructorAccess(
  userId: string,
  courseId: string
): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { createdById: true },
  });

  if (!course) throw new Error("COURSE_NOT_FOUND");

  // Allow course creator or system admin
  return course.createdById === userId; // Could expand to include co-instructors
}

/**
 * Calculate completion percentage
 */
function calculatePercentage(secondsWatched: number, durationMinutes: number) {
  const durationSeconds = durationMinutes * 60;
  return Math.min(100, Math.round((secondsWatched / durationSeconds) * 100));
}

// ============================================================================
// GET ENDPOINT - Instructor Dashboard Data
// ============================================================================

/**
 * GET /api/lessons/progress/instructor/[courseId]
 * Get class-wide lesson progress overview for instructors
 *
 * Shows:
 * - All enrolled students
 * - Each student's progress for all lessons
 * - Completion rates and time spent
 * - At-risk students (not progressing)
 * - Engagement metrics
 *
 * Response:
 * {
 *   success: true
 *   course: { id, title, totalLessons }
 *   students: [
 *     {
 *       userId: string
 *       firstName: string
 *       lastName: string
 *       email: string
 *       enrolledAt: date
 *       completionPercentage: number
 *       lessonsCompleted: number
 *       timeSpent: number (seconds)
 *       lastAccessedAt: date
 *       lessons: [
 *         { lessonId, title, duration, progress, isCompleted }
 *       ]
 *     }
 *   ]
 *   stats: {
 *     totalStudents: number
 *     averageCompletion: number
 *     studentsAtRisk: number
 *     averageTimePerLesson: number
 *   }
 * }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    // ✅ STEP 1: Verify authentication
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const userId = authUser.sub;

    // ✅ STEP 2: Verify instructor access
    try {
      const hasAccess = await verifyInstructorAccess(userId, courseId);
      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            error: "You do not have instructor access to this course",
          },
          { status: 403 }
        );
      }
    } catch (error: any) {
      if (error.message === "COURSE_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    console.log(`👨‍🏫 Fetching class progress for course: ${courseId}`);

    // ✅ STEP 3: Fetch course and enrollments
    const [course, enrollments] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          lessons: {
            select: { id: true, title: true, duration: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      }),
      prisma.enrollment.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          lessonProgress: {
            select: {
              lessonId: true,
              secondsWatched: true,
              isCompleted: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { enrolledAt: "asc" },
      }),
    ]);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // ✅ STEP 4: Calculate student progress
    const studentProgress = enrollments.map((enrollment) => {
      const progressMap = new Map(
        enrollment.lessonProgress.map((p) => [p.lessonId, p])
      );

      const lessonDetails = course.lessons.map((lesson) => {
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
          lastAccessedAt: progress?.updatedAt || null,
        };
      });

      const lessonsCompleted = lessonDetails.filter(
        (l) => l.isCompleted
      ).length;
      const totalLessons = lessonDetails.length;
      const completionPercentage =
        totalLessons > 0
          ? Math.round(
              lessonDetails.reduce((sum, l) => sum + l.completionPercentage, 0) /
                totalLessons
            )
          : 0;
      const totalTimeSpent = lessonDetails.reduce(
        (sum, l) => sum + l.secondsWatched,
        0
      );

      return {
        enrollmentId: enrollment.id,
        userId: enrollment.user.id,
        firstName: enrollment.user.firstName,
        lastName: enrollment.user.lastName,
        email: enrollment.user.email,
        enrolledAt: enrollment.enrolledAt,
        completionPercentage,
        lessonsCompleted,
        totalLessons,
        timeSpent: totalTimeSpent, // seconds
        avgTimePerLesson: totalTimeSpent / totalLessons || 0,
        lastAccessedAt: enrollment.lastAccessedAt,
        atRisk: completionPercentage < 30 && totalTimeSpent < 600, // Less than 10min watched and <30%
        lessons: lessonDetails,
      };
    });

    // ✅ STEP 5: Calculate class-wide statistics
    const averageCompletion =
      studentProgress.length > 0
        ? Math.round(
            studentProgress.reduce((sum, s) => sum + s.completionPercentage, 0) /
              studentProgress.length
          )
        : 0;

    const atRiskCount = studentProgress.filter((s) => s.atRisk).length;

    const averageTimePerStudent =
      studentProgress.length > 0
        ? Math.round(
            studentProgress.reduce((sum, s) => sum + s.timeSpent, 0) /
              studentProgress.length
          )
        : 0;

    const averageTimePerLesson =
      course.lessons.length > 0 ? averageTimePerStudent / course.lessons.length : 0;

    console.log(`✅ Class progress calculated: ${studentProgress.length} students`);

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        totalLessons: course.lessons.length,
        lessons: course.lessons,
      },
      students: studentProgress,
      stats: {
        totalStudents: studentProgress.length,
        classAverageCompletion: averageCompletion,
        studentsAtRisk: atRiskCount,
        averageTimePerStudent: Math.round(averageTimePerStudent),
        averageTimePerLesson: Math.round(averageTimePerLesson),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching class progress:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while fetching class progress",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET ENDPOINT - Single Student Progress
// ============================================================================

/**
 * GET /api/lessons/progress/instructor/[courseId]/student/[studentId]
 * Get detailed progress for a single student in a course
 *
 * Shows:
 * - All lesson progress
 * - Time spent on each lesson
 * - View count
 * - Completion timestamps
 * - Comparison to class average
 */
export async function getStudentProgress(
  req: NextRequest,
  { params }: { params: { courseId: string; studentId: string } }
) {
  try {
    const { courseId, studentId } = params;

    // ✅ STEP 1: Verify authentication
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ STEP 2: Verify instructor access
    try {
      const hasAccess = await verifyInstructorAccess(authUser.sub, courseId);
      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }
    } catch (error: any) {
      if (error.message === "COURSE_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    // ✅ STEP 3: Fetch student's progress
    const [enrollment, classStats] = await Promise.all([
      prisma.enrollment.findFirst({
        where: { courseId, userId: studentId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          course: {
            select: {
              lessons: {
                select: {
                  id: true,
                  title: true,
                  duration: true,
                  order: true,
                },
                orderBy: { order: "asc" },
              },
            },
          },
          lessonProgress: true,
        },
      }),
      prisma.enrollment.findMany({
        where: { courseId },
        include: { lessonProgress: true },
      }),
    ]);

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Student enrollment not found" },
        { status: 404 }
      );
    }

    // Calculate student progress
    const progressMap = new Map(
      enrollment.lessonProgress.map((p) => [p.lessonId, p])
    );

    const lessonDetails = enrollment.course.lessons.map((lesson) => {
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
        secondsWatched,
        completionPercentage,
        isCompleted: progress?.isCompleted || false,
        completedAt: progress?.completedAt,
        lastAccessedAt: progress?.updatedAt,
      };
    });

    // Calculate class averages for comparison
    const classLessonStats = enrollment.course.lessons.map((lesson) => {
      const allProgress = classStats.flatMap((e) =>
        e.lessonProgress.filter((lp) => lp.lessonId === lesson.id)
      );

      const avgWatchTime =
        allProgress.length > 0
          ? Math.round(
              allProgress.reduce((sum, lp) => sum + lp.secondsWatched, 0) /
                allProgress.length
            )
          : 0;

      const completionRate =
        allProgress.length > 0
          ? Math.round(
              (allProgress.filter((lp) => lp.isCompleted).length /
                allProgress.length) *
                100
            )
          : 0;

      return {
        lessonId: lesson.id,
        classAverageWatchTime: avgWatchTime,
        classCompletionRate: completionRate,
      };
    });

    return NextResponse.json({
      success: true,
      student: {
        firstName: enrollment.user.firstName,
        lastName: enrollment.user.lastName,
        email: enrollment.user.email,
        enrolledAt: enrollment.enrolledAt,
      },
      lessons: lessonDetails.map((lesson) => ({
        ...lesson,
        classAverageWatchTime:
          classLessonStats.find((c) => c.lessonId === lesson.lessonId)
            ?.classAverageWatchTime || 0,
        classCompletionRate:
          classLessonStats.find((c) => c.lessonId === lesson.lessonId)
            ?.classCompletionRate || 0,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching student progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
