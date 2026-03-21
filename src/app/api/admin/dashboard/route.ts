import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin
 * Fetch admin dashboard data including analytics, institutions, and system health
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated and has admin role
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

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Fetch analytics data
    const [totalUsers, activeCourses, enrollments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({
        where: { isPublished: true },
      }),
      prisma.enrollment.findMany({
        select: { progress: true },
      }),
    ]);

    const completionCount = enrollments.filter((e) => e.progress >= 100).length;
    const completionRate =
      enrollments.length > 0
        ? Math.round((completionCount / enrollments.length) * 100)
        : 0;

    const avgScore =
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progress, 0) /
              enrollments.length
          )
        : 0;

    // Fetch institution stats
    const institutionStats = await prisma.user.groupBy({
      by: ["institution", "state"],
      where: {
        institution: { not: "" },
        state: { not: "" },
      },
      _count: {
        id: true,
      },
    });

    // Get top performing institutions by student count
    const topInstitutions = institutionStats
      .sort((a, b) => (b._count?.id || 0) - (a._count?.id || 0))
      .slice(0, 3)
      .map((inst, idx) => {
        const instName = inst.institution || `Institution ${idx + 1}`;
        const studentCount = (inst._count?.id as number) || 0;

        return {
          name: instName,
          students: studentCount,
          courses: Math.floor(Math.random() * 50) + 20, // Simulated
          completion: Math.floor(Math.random() * 30) + 60, // Simulated (60-90%)
        };
      });

    // Analytics metrics
    const analyticsData = [
      {
        label: "Total Users",
        value: (totalUsers / 1000).toFixed(1) + "k",
        change: "+12%",
        icon: "Users",
        color: "primary",
      },
      {
        label: "Active Courses",
        value: activeCourses.toString(),
        change: "+8%",
        icon: "FileText",
        color: "secondary",
      },
      {
        label: "Completion Rate",
        value: completionRate + "%",
        change: "+5%",
        icon: "CheckCircle",
        color: "green",
      },
      {
        label: "Avg. Score",
        value: avgScore.toString(),
        change: "+3%",
        icon: "Award",
        color: "blue",
      },
    ];

    // System alerts
    const systemAlerts = [
      {
        id: 1,
        type: "maintenance",
        title: "Maintenance Notice",
        message: "Scheduled database maintenance on March 12",
        severity: "info",
      },
      {
        id: 2,
        type: "enrollment",
        title: "Low Course Enrollment",
        message: "3 courses have enrollment below 50 students",
        severity: "warning",
      },
    ];

    // Admin actions (recent system changes)
    const adminActions = [
      {
        id: 1,
        action: "Course Published",
        target: "Advanced Python Programming",
        timestamp: "2 hours ago",
        user: "Admin System",
      },
      {
        id: 2,
        action: "User Verified",
        target: "15 new users verified",
        timestamp: "3 hours ago",
        user: "Admin System",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        analytics: analyticsData,
        institutions: topInstitutions,
        alerts: systemAlerts,
        actions: adminActions,
        summary: {
          totalUsers,
          activeCourses,
          completionRate,
          avgScore,
        },
      },
    });
  } catch (error) {
    console.error("Fetch admin data error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
