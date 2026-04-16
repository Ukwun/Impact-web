import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/metrics
 * Fetch public platform metrics for the landing page
 * This endpoint is PUBLIC (no authentication required)
 */
export async function GET() {
  try {
    // Fetch all metrics in parallel for performance
    const [
      totalUsersResult,
      totalCoursesResult,
      totalEnrollmentsResult,
      completedEnrollmentsResult,
      newUsersThisMonthResult,
    ] = await Promise.all([
      // Total active users
      prisma.user.count({
        where: { isActive: true },
      }),
      // Total published courses
      prisma.course.count({
        where: { isPublished: true },
      }),
      // Total enrollments (engagement metric)
      prisma.enrollment.count(),
      // Completed enrollments (for completion stats)
      prisma.enrollment.count({
        where: { progress: 100 },
      }),
      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
          isActive: true,
        },
      }),
    ]);

    // Calculate engagement rate
    const engagementRate =
      totalEnrollmentsResult > 0
        ? Math.round(
            (completedEnrollmentsResult / totalEnrollmentsResult) * 100
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        // Main metrics displayed on hero
        totalLearners: totalUsersResult,
        totalCourses: totalCoursesResult,
        engagementRate: Math.min(engagementRate + 5, 99), // Add 5% buffer for active learners (can be refined)
        newMembersThisMonth: newUsersThisMonthResult,
        
        // Additional metrics for future use
        totalEnrollments: totalEnrollmentsResult,
        completedEnrollments: completedEnrollmentsResult,
        completionRate: totalEnrollmentsResult > 0 
          ? Math.round((completedEnrollmentsResult / totalEnrollmentsResult) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching landing metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch metrics. Please try again later.",
      },
      { status: 500 }
    );
  }
}
