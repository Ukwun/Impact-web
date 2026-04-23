import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const UpdateLessonProgressSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
  enrollmentId: z.string().uuid("Invalid enrollment ID"),
  secondsWatched: z
    .number()
    .min(0, "Seconds watched cannot be negative")
    .int("Seconds watched must be an integer"),
  isCompleted: z.boolean().optional(),
  viewCount: z.number().int().optional(),
  lastAccessedAt: z.string().datetime().optional(),
});

const BulkUpdateSchema = z.object({
  enrollmentId: z.string().uuid("Invalid enrollment ID"),
  lessons: z.array(
    z.object({
      lessonId: z.string().uuid(),
      secondsWatched: z.number().min(0).int(),
      isCompleted: z.boolean().optional(),
    })
  ),
});

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
 * Calculate completion percentage based on lesson duration
 */
async function calculateCompletionPercentage(
  lessonId: string,
  secondsWatched: number
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { duration: true }, // duration in minutes
  });

  if (!lesson) throw new Error("LESSON_NOT_FOUND");

  const durationInSeconds = lesson.duration * 60;
  const percentage = Math.min(100, (secondsWatched / durationInSeconds) * 100);

  return {
    percentage: Math.round(percentage),
    durationInSeconds,
  };
}

// ============================================================================
// POST ENDPOINT - Update single lesson progress
// ============================================================================

/**
 * POST /api/lessons/progress
 * Update a student's progress on a specific lesson
 *
 * Realistic Scenarios:
 * - Student watching video: POST secondsWatched every 30-60 seconds
 * - Resuming after pause: POST secondsWatched to resume position
 * - Completing lesson: POST with isCompleted=true
 * - Rewatching: secondsWatched can exceed lesson duration
 *
 * Request body:
 * {
 *   lessonId: string (uuid)
 *   enrollmentId: string (uuid)
 *   secondsWatched: number (>=0)
 *   isCompleted: boolean (optional)
 *   viewCount: number (optional)
 *   lastAccessedAt: ISO8601 string (optional)
 * }
 *
 * Response:
 * {
 *   success: true
 *   message: "Progress updated successfully"
 *   data: {
 *     lessonId: string
 *     enrollmentId: string
 *     secondsWatched: number
 *     isCompleted: boolean
 *     completionPercentage: number (0-100)
 *     updatedAt: ISO8601 date
 *   }
 * }
 */
export async function POST(req: NextRequest) {
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
    console.log(`📝 Updating lesson progress for user: ${userId}`);

    // ✅ STEP 2: Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    let validatedData;
    try {
      validatedData = UpdateLessonProgressSchema.parse(body);
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const {
      lessonId,
      enrollmentId,
      secondsWatched,
      isCompleted,
      viewCount,
      lastAccessedAt,
    } = validatedData;

    // ✅ STEP 3: Verify user owns this enrollment
    try {
      await verifyEnrollmentOwnership(userId, enrollmentId);
    } catch (error: any) {
      if (error.message === "ENROLLMENT_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Enrollment not found" },
          { status: 404 }
        );
      }
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { success: false, error: "You do not have access to this enrollment" },
          { status: 403 }
        );
      }
      throw error;
    }

    // ✅ STEP 4: Verify lesson exists in course
    const lessonInCourse = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true, duration: true },
    });

    if (!lessonInCourse) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Verify lesson belongs to enrollee's course
    const enrollmentCourse = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { courseId: true },
    });

    if (enrollmentCourse?.courseId !== lessonInCourse.courseId) {
      return NextResponse.json(
        { success: false, error: "Lesson does not belong to this course" },
        { status: 400 }
      );
    }

    // ✅ STEP 5: Calculate completion percentage
    const { percentage: completionPercentage } =
      await calculateCompletionPercentage(lessonId, secondsWatched);

    // ✅ STEP 6: Upsert lesson progress (create or update)
    const updatedProgress = await prisma.lessonProgress.upsert({
      where: {
        lessonId_enrollmentId: { lessonId, enrollmentId },
      },
      update: {
        secondsWatched: Math.max(secondsWatched, 0),
        isCompleted:
          isCompleted || completionPercentage >= 95 || undefined, // Auto-complete at 95%
        completedAt:
          isCompleted || completionPercentage >= 95
            ? new Date()
            : undefined,
        viewCount: viewCount || undefined,
        updatedAt: new Date(),
      },
      create: {
        lessonId,
        enrollmentId,
        secondsWatched,
        isCompleted: isCompleted || completionPercentage >= 95 || false,
        completedAt:
          isCompleted || completionPercentage >= 95 ? new Date() : null,
        viewCount: viewCount || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // ✅ STEP 7: Update enrollment's lastAccessedAt
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { lastAccessedAt: new Date() },
    });

    // 📊 Log the update
    console.log(
      `✅ Lesson progress updated: ${lessonId} | ${completionPercentage}% | User: ${userId}`
    );

    // 🎉 Return successful response
    return NextResponse.json(
      {
        success: true,
        message: "Progress updated successfully",
        data: {
          lessonId,
          enrollmentId,
          secondsWatched: updatedProgress.secondsWatched,
          isCompleted: updatedProgress.isCompleted,
          completionPercentage,
          updatedAt: updatedProgress.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating lesson progress:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while updating progress",
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
// PUT ENDPOINT - Bulk update multiple lessons
// ============================================================================

/**
 * PUT /api/lessons/progress
 * Bulk update progress for multiple lessons
 *
 * Realistic Scenarios:
 * - Syncing mobile app with server (batched updates)
 * - Importing progress from another system
 * - Instructor marking multiple lessons complete for a student
 *
 * Request body:
 * {
 *   enrollmentId: string (uuid)
 *   lessons: Array<{
 *     lessonId: string (uuid)
 *     secondsWatched: number (>=0)
 *     isCompleted: boolean (optional)
 *   }>
 * }
 *
 * Response:
 * {
 *   success: true
 *   message: "3 lessons updated successfully"
 *   data: {
 *     updated: number
 *     failed: number
 *     results: Array<{ lessonId, success, secondsWatched, completionPercentage }>
 *   }
 * }
 */
export async function PUT(req: NextRequest) {
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
    console.log(`📦 Bulk updating lesson progress for user: ${userId}`);

    // ✅ STEP 2: Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    let validatedData;
    try {
      validatedData = BulkUpdateSchema.parse(body);
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const { enrollmentId, lessons } = validatedData;

    // ✅ STEP 3: Verify user owns this enrollment
    try {
      await verifyEnrollmentOwnership(userId, enrollmentId);
    } catch (error: any) {
      if (error.message === "ENROLLMENT_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Enrollment not found" },
          { status: 404 }
        );
      }
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { success: false, error: "You do not have access to this enrollment" },
          { status: 403 }
        );
      }
      throw error;
    }

    // ✅ STEP 4: Process each lesson update
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const lesson of lessons) {
      try {
        const { lessonId, secondsWatched, isCompleted } = lesson;

        // Verify lesson exists and belongs to enrollment's course
        const lessonData = await prisma.lesson.findUnique({
          where: { id: lessonId },
          select: { courseId: true, duration: true },
        });

        if (!lessonData) {
          results.push({
            lessonId,
            success: false,
            error: "Lesson not found",
          });
          failureCount++;
          continue;
        }

        // Verify course match
        const enrollmentData = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          select: { courseId: true },
        });

        if (enrollmentData?.courseId !== lessonData.courseId) {
          results.push({
            lessonId,
            success: false,
            error: "Lesson does not belong to course",
          });
          failureCount++;
          continue;
        }

        // Calculate completion percentage
        const { percentage: completionPercentage } =
          await calculateCompletionPercentage(lessonId, secondsWatched);

        // Update progress
        const updatedProgress = await prisma.lessonProgress.upsert({
          where: {
            lessonId_enrollmentId: { lessonId, enrollmentId },
          },
          update: {
            secondsWatched,
            isCompleted:
              isCompleted || completionPercentage >= 95 || undefined,
            completedAt:
              isCompleted || completionPercentage >= 95
                ? new Date()
                : undefined,
            updatedAt: new Date(),
          },
          create: {
            lessonId,
            enrollmentId,
            secondsWatched,
            isCompleted: isCompleted || completionPercentage >= 95 || false,
            completedAt:
              isCompleted || completionPercentage >= 95 ? new Date() : null,
            viewCount: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        results.push({
          lessonId,
          success: true,
          secondsWatched: updatedProgress.secondsWatched,
          isCompleted: updatedProgress.isCompleted,
          completionPercentage,
        });
        successCount++;
      } catch (error) {
        console.error(`Error updating lesson ${lesson.lessonId}:`, error);
        results.push({
          lessonId: lesson.lessonId,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
        failureCount++;
      }
    }

    // ✅ STEP 5: Update enrollment's lastAccessedAt
    if (successCount > 0) {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { lastAccessedAt: new Date() },
      });
    }

    console.log(
      `✅ Bulk update completed: ${successCount} succeeded, ${failureCount} failed`
    );

    return NextResponse.json(
      {
        success: failureCount === 0,
        message: `${successCount} lessons updated successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
        data: {
          updated: successCount,
          failed: failureCount,
          total: lessons.length,
          results,
        },
      },
      { status: failureCount === 0 ? 200 : 207 } // 207 Multi-Status if partial success
    );
  } catch (error) {
    console.error("❌ Error in bulk update:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while updating progress",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
