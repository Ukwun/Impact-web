import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserEnrollments, getCourse } from "@/lib/firestore-utils";

/**
 * GET /api/progress
 * Fetch user's course progress and enrollment data from Firestore
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = payload.sub;
    console.log(`📊 Fetching progress for user: ${userId}`);

    // Fetch user's enrollments from Firestore
    const enrollments = await getUserEnrollments(userId);

    // Map enrollments to include course details
    const enrollmentData = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        const course = await getCourse(enrollment.courseId);
        return {
          enrollmentId: enrollment.id,
          course: course ? {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            difficulty: course.difficulty,
            duration: course.duration,
          } : null,
          progress: enrollment.progress || 0,
          isCompleted: enrollment.isCompleted || false,
          completedAt: enrollment.completedAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          enrolledAt: enrollment.enrolledAt,
        };
      })
    );

    console.log(`✅ Found ${enrollmentData.length} enrollments for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: {
        enrollments: enrollmentData,
        total: enrollmentData.length,
      },
    });
  } catch (error) {
    console.error("❌ Fetch progress error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
