import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/facilitator/analytics
 * Get analytics for facilitator's courses
 * Requires FACILITATOR or ADMIN role
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || (user.role !== "FACILITATOR" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const period = req.nextUrl.searchParams.get("period") || "month";

    // Get facilitator's courses
    const courses = await prisma.course.findMany({
      where: {
        createdById: user.sub,
      },
      select: {
        id: true,
        title: true,
        enrollments: {
          select: {
            userId: true,
            progress: true,
            lessonProgress: true,
          },
        },
      },
    });

    // Calculate analytics for each course
    const courseAnalytics = courses.map((course) => {
      const students = course.enrollments.length;
      const avgProgress =
        students > 0
          ? Math.round(
              course.enrollments.reduce((sum, e) => sum + e.progress, 0) /
                students
            )
          : 0;
      const completedCount = course.enrollments.filter(
        (e) => e.progress === 100
      ).length;
      const completionRate = students > 0 ? Math.round((completedCount / students) * 100) : 0;

      // Simple engagement score based on progress
      const engagementScore = Math.min(avgProgress + 10, 100);

      return {
        id: course.id,
        title: course.title,
        students,
        avgProgress,
        completionRate,
        engagementScore,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents: courseAnalytics.reduce((sum, c) => sum + c.students, 0),
        avgCompletionRate:
          courseAnalytics.length > 0
            ? Math.round(
                courseAnalytics.reduce((sum, c) => sum + c.completionRate, 0) /
                  courseAnalytics.length
              )
            : 0,
        avgEngagement:
          courseAnalytics.length > 0
            ? Math.round(
                courseAnalytics.reduce((sum, c) => sum + c.engagementScore, 0) /
                  courseAnalytics.length
              )
            : 0,
        courses: courseAnalytics,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching facilitator analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
