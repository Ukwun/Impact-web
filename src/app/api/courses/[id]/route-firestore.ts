import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getCourse, updateCourse, deleteCourse, getEnrollment, createEnrollment, getUserEnrollments, listLessons } from "@/lib/firestore-utils";
import { z } from "zod";

// Validation schema for updating course
const UpdateCourseSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  duration: z.number().min(0).optional(),
  thumbnail: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/courses/[id]
 * Get course details including lessons
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const user = getAuthUser(req);

    // Get course details
    const course = await getCourse(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    if (user) {
      const enrollment = await getEnrollment(courseId, user.sub);
      isEnrolled = !!enrollment;
    }

    // Get lessons
    const lessons = await listLessons(courseId);

    return NextResponse.json({
      success: true,
      data: {
        course,
        isEnrolled,
        lessons,
      },
    });
  } catch (error) {
    console.error("❌ Get course error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get course" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Update course (facilitator/admin only)
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

    // Get course to verify ownership
    const course = await getCourse(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check authorization (creator or admin)
    if (course.createdBy !== user.sub && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this course" },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validatedData = UpdateCourseSchema.parse(body);

    // Update course
    const updated = await updateCourse(courseId, validatedData);

    console.log(`✅ Course ${courseId} updated`);

    return NextResponse.json({
      success: true,
      data: updated,
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

    console.error("❌ Update course error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course (admin only)
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

    // Get course
    const course = await getCourse(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check authorization (admin only)
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admins can delete courses" },
        { status: 403 }
      );
    }

    // Delete course and all related data
    await deleteCourse(courseId);

    console.log(`✅ Course ${courseId} deleted`);

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete course error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/enroll
 * Enroll user in course
 */
export async function enroll(
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

    // Check if already enrolled
    const existingEnrollment = await getEnrollment(courseId, user.sub);
    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await createEnrollment(courseId, user.sub);

    console.log(`✅ User ${user.sub} enrolled in course ${courseId}`);

    return NextResponse.json(
      {
        success: true,
        data: enrollment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Enroll error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
