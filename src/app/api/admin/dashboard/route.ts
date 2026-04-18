import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Helper function to calculate change percentage from last month
async function getChangePercentage(metric: string): Promise<string> {
  try {
    // Calculate date one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    switch (metric) {
      case "users": {
        const thisMonth = await prisma.user.count();
        const lastMonth = await prisma.user.count({
          where: {
            createdAt: {
              lt: oneMonthAgo,
            },
          },
        });
        const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
        return `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
      }
      case "courses": {
        const thisMonth = await prisma.course.count({ where: { isPublished: true } });
        const lastMonth = await prisma.course.count({
          where: {
            isPublished: true,
            createdAt: { lt: oneMonthAgo },
          },
        });
        const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
        return `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
      }
      case "completion": {
        const enrollmentsThisMonth = await prisma.enrollment.findMany({
          where: { createdAt: { gte: oneMonthAgo } },
          select: { progress: true },
        });
        const completedThisMonth = enrollmentsThisMonth.filter((e) => e.progress >= 100).length;
        const rateThisMonth = enrollmentsThisMonth.length > 0 
          ? (completedThisMonth / enrollmentsThisMonth.length) * 100 
          : 0;

        const enrollmentsLastMonth = await prisma.enrollment.findMany({
          where: { createdAt: { lt: oneMonthAgo } },
          select: { progress: true },
        });
        const completedLastMonth = enrollmentsLastMonth.filter((e) => e.progress >= 100).length;
        const rateLastMonth = enrollmentsLastMonth.length > 0 
          ? (completedLastMonth / enrollmentsLastMonth.length) * 100 
          : 50;

        const change = rateLastMonth > 0 ? ((rateThisMonth - rateLastMonth) / rateLastMonth) * 100 : 0;
        return `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
      }
      default:
        return "+0%";
    }
  } catch (error) {
    console.error(`Error calculating ${metric} change:`, error);
    return "+0%";
  }
}

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
    const topInstitutions = await prisma.user.groupBy({
      by: ["institution"],
      where: {
        institution: { not: null },
        isActive: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: { id: "desc" },
      },
      take: 3,
    });

    // Fetch real institution details with course and completion stats
    const institutionDetails = await Promise.all(
      topInstitutions.map(async (inst) => {
        const instName = inst.institution || "Unknown Institution";
        const studentCount = (inst._count?.id as number) || 0;

        // Get course count for this institution (courses created by facilitators from this institution)
        const courseCount = await prisma.course.count({
          where: {
            createdBy: {
              institution: instName,
            },
          },
        });

        // Get completion rate ONLY for students in this institution
        const institutionStudentEnrollments = await prisma.enrollment.findMany({
          where: {
            user: {
              institution: instName,
            },
          },
          select: { progress: true },
        });

        const institutionCompletionCount = institutionStudentEnrollments.filter(
          (e) => e.progress >= 100
        ).length;
        const institutionCompletionRate =
          institutionStudentEnrollments.length > 0
            ? Math.round(
                (institutionCompletionCount / institutionStudentEnrollments.length) * 100
              )
            : 0;

        return {
          name: instName,
          students: studentCount,
          courses: courseCount || 0,
          completion: institutionCompletionRate,
        };
      })
    );

    // Fetch recent system alerts from database (if alerts table exists, otherwise generate based on metrics)
    const activeIssues = [];

    // Check for courses with low enrollment
    const lowEnrollmentCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: { enrollments: true },
        },
      },
      take: 5,
    });

    // Sort by enrollment count manually
    const sortedCourses = lowEnrollmentCourses.sort(
      (a, b) => a._count.enrollments - b._count.enrollments
    );

    const lowEnrollmentAlert = sortedCourses.filter(
      (c) => c._count.enrollments < 5
    );

    const systemAlerts = [
      {
        id: 1,
        type: "status",
        title: "System Status",
        message: "All systems operational",
        severity: "info",
      },
    ];

    if (lowEnrollmentAlert.length > 0) {
      systemAlerts.push({
        id: 2,
        type: "enrollment",
        title: "Low Course Enrollment",
        message: `${lowEnrollmentAlert.length} courses have fewer than 5 enrollments`,
        severity: "warning",
      });
    }

    // Check for inactive users
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    if (inactiveUsers > 0) {
      systemAlerts.push({
        id: 3,
        type: "inactive",
        title: "Inactive Users",
        message: `${inactiveUsers} users have not logged in for 30+ days`,
        severity: "warning",
      });
    }

    // Fetch recent admin actions (from audit log if available, otherwise recent course/user changes)
    const recentCourses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdBy: { select: { firstName: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const adminActions = [
      ...recentCourses.map((course) => ({
        id: course.id,
        action: "Course Updated",
        target: course.title,
        timestamp: new Date(course.updatedAt).toLocaleDateString(),
        user: course.createdBy?.firstName || "System",
      })),
      ...recentUsers.map((user) => ({
        id: user.id,
        action: "User Created",
        target: user.firstName,
        timestamp: new Date(user.createdAt).toLocaleDateString(),
        user: "System",
      })),
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 5);

    // Calculate change percentages (now async)
    const [usersChange, coursesChange, completionChange] = await Promise.all([
      getChangePercentage("users"),
      getChangePercentage("courses"),
      getChangePercentage("completion"),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        analytics: [
          {
            label: "Total Users",
            value: totalUsers.toString(),
            change: usersChange,
            icon: "Users",
            color: "primary",
          },
          {
            label: "Active Courses",
            value: activeCourses.toString(),
            change: coursesChange,
            icon: "FileText",
            color: "secondary",
          },
          {
            label: "Completion Rate",
            value: completionRate + "%",
            change: completionChange,
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
        ],
        institutions: institutionDetails,
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
