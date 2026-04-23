/**
 * Student Dashboard API Route
 * /api/dashboard/student - Get student-specific dashboard data
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, roleMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Unauthorized
    }

    // Verify user is student or admin
    const roleCheck = await roleMiddleware(request, ["STUDENT", "FACILITATOR", "PARENT", "ADMIN"]);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId") || authResult.user.id;

    // Verify access - students can only view their own dashboard
    if (authResult.user.role === "STUDENT" && authResult.user.id !== studentId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot access other student's dashboard" },
        { status: 403 }
      );
    }

    // TODO: Fetch actual data from database using Prisma
    // const student = await prisma.user.findUnique({ where: { id: studentId }, include: { studentProfile: true } });
    // const enrollments = await prisma.enrollment.findMany({ where: { studentId } });
    // const assignments = await prisma.assignment.findMany({ ... });

    const dashboardData = {
      success: true,
      data: {
        student: {
          id: studentId,
          name: "Alex Johnson",
          grade: "Grade 10",
          school: "Central High School",
          avatar: "https://api.example.com/avatars/alex.jpg",
        },
        activeCourses: [
          {
            id: "course-1",
            name: "Advanced Mathematics",
            progress: 85,
            nextAssignment: "Chapter 5 Quiz",
            dueDate: "2026-04-25",
            difficulty: "Advanced",
          },
          {
            id: "course-2",
            name: "World History",
            progress: 72,
            nextAssignment: "Essay on Industrial Revolution",
            dueDate: "2026-04-28",
            difficulty: "Intermediate",
          },
        ],
        recentAssignments: [
          {
            id: "assign-1",
            title: "Quadratic Equations Problem Set",
            course: "Advanced Mathematics",
            status: "SUBMITTED",
            dueDate: "2026-04-20",
            grade: 92,
          },
          {
            id: "assign-2",
            title: "American Revolution Timeline",
            course: "World History",
            status: "GRADED",
            dueDate: "2026-04-18",
            grade: 88,
          },
        ],
        achievements: [
          { title: "Quiz Master", icon: "🎯", date: "2026-04-19", category: "KNOWLEDGE" },
          { title: "Streak Leader", icon: "🔥", date: "2026-04-15", category: "EFFORT" },
        ],
        weeklyStats: {
          lecturesCompleted: 8,
          hoursLearned: 12.5,
          assignmentsSubmitted: 3,
          discussionContributions: 5,
        },
        leaderboard: [
          { rank: 1, name: "Emma Smith", points: 2840, trend: "up" },
          { rank: 2, name: "Alex Johnson", points: 2720, trend: "up" },
          { rank: 3, name: "James Brown", points: 2650, trend: "down" },
        ],
        peerActivity: [
          {
            name: "Sarah Lee",
            activity: "completed the Biology Project",
            time: "2 hours ago",
            points: 52,
          },
          {
            name: "Mike Chen",
            activity: "earned Physics Expert badge",
            time: "4 hours ago",
            points: 48,
          },
        ],
        recommendations: [
          "You're doing great in Mathematics! Keep up the momentum.",
          "Try the peer study group for World History this week.",
          "Your project on renewable energy was excellent - share it in the showcase!",
        ],
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
