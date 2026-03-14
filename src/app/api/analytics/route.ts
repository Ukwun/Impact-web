import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * GET /api/analytics/overview
 * Get comprehensive platform analytics
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "30d"; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // User Analytics
    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: startDate } },
    });

    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: { gte: startDate },
      },
    });

    // Course Analytics
    const totalCourses = await prisma.course.count();
    const publishedCourses = await prisma.course.count({
      where: { isPublished: true },
    });

    const totalEnrollments = await prisma.enrollment.count();
    const newEnrollments = await prisma.enrollment.count({
      where: { enrolledAt: { gte: startDate } },
    });

    const completedCourses = await prisma.enrollment.count({
      where: { isCompleted: true },
    });

    // Quiz Analytics
    const totalQuizzes = await prisma.quiz.count();
    const quizAttempts = await prisma.quizAttempt.count({
      where: { createdAt: { gte: startDate } },
    });

    const passedQuizzes = await prisma.quizAttempt.count({
      where: {
        passed: true,
        createdAt: { gte: startDate },
      },
    });

    const avgQuizScore = await prisma.quizAttempt.aggregate({
      where: { createdAt: { gte: startDate } },
      _avg: { score: true },
    });

    // Assignment Analytics
    const totalAssignments = await prisma.assignment.count();
    const submittedAssignments = await prisma.assignmentSubmission.count({
      where: { submittedAt: { gte: startDate } },
    });

    const gradedAssignments = await prisma.assignmentSubmission.count({
      where: {
        grade: { not: null },
        submittedAt: { gte: startDate },
      },
    });

    // Revenue Analytics (if payments exist)
    const totalPayments = await prisma.payment.count({
      where: { status: "COMPLETED" },
    });

    const revenue = await prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
    });

    // Event Analytics
    const totalEvents = await prisma.event.count();
    const upcomingEvents = await prisma.event.count({
      where: {
        eventDate: { gte: now },
        isPublished: true,
      },
    });

    const eventRegistrations = await prisma.eventRegistration.count({
      where: { createdAt: { gte: startDate } },
    });

    // Certificate Analytics
    const totalCertificates = await prisma.certificate.count();
    const newCertificates = await prisma.certificate.count({
      where: { issuedAt: { gte: startDate } },
    });

    // User Role Distribution
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    // Top Performing Courses
    const topCourses = await prisma.enrollment.groupBy({
      by: ['courseId'],
      _count: { courseId: true },
      orderBy: { _count: { courseId: 'desc' } },
      take: 5,
    });

    const courseDetails = await Promise.all(
      topCourses.map(async (item) => {
        const course = await prisma.course.findUnique({
          where: { id: item.courseId },
          select: { title: true, instructor: { select: { firstName: true, lastName: true } } },
        });
        return {
          title: course?.title || 'Unknown Course',
          instructor: course?.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Unknown',
          enrollments: item._count.courseId,
        };
      })
    );

    // Recent Activity
    const recentActivity = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        overview: {
          totalUsers,
          newUsers,
          activeUsers,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          newEnrollments,
          completedCourses,
          completionRate: totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0,
        },
        assessments: {
          totalQuizzes,
          quizAttempts,
          passedQuizzes,
          quizPassRate: quizAttempts > 0 ? Math.round((passedQuizzes / quizAttempts) * 100) : 0,
          avgQuizScore: Math.round(avgQuizScore._avg.score || 0),
          totalAssignments,
          submittedAssignments,
          gradedAssignments,
        },
        revenue: {
          totalPayments,
          revenue: revenue._sum.amount || 0,
        },
        engagement: {
          totalEvents,
          upcomingEvents,
          eventRegistrations,
          totalCertificates,
          newCertificates,
        },
        demographics: {
          roleDistribution: roleStats.map(stat => ({
            role: stat.role,
            count: stat._count.role,
          })),
        },
        topCourses: courseDetails,
        recentActivity: recentActivity.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          joinedAt: user.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}