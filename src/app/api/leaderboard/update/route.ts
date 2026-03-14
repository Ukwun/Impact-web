import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * POST /api/leaderboard/update
 * Update user's leaderboard entry (internal/system use)
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      userId,
      activityType, // 'course_completed', 'quiz_passed', 'assignment_submitted', 'perfect_score', 'login_streak', 'study_time'
      points = 0,
      metadata = {},
    } = body;

    // Verify user has permission (only admin or the user themselves)
    if (payload.role !== "ADMIN" && payload.sub !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get or create leaderboard entry
    let leaderboardEntry = await prisma.leaderboardEntry.findUnique({
      where: { userId },
    });

    if (!leaderboardEntry) {
      leaderboardEntry = await prisma.leaderboardEntry.create({
        data: { userId },
      });
    }

    // Update based on activity type
    const updateData: any = {
      totalScore: leaderboardEntry.totalScore + points,
      lastActivityAt: new Date(),
    };

    switch (activityType) {
      case "course_completed":
        updateData.coursesCompleted = leaderboardEntry.coursesCompleted + 1;
        break;
      case "quiz_passed":
        updateData.quizzesPassed = leaderboardEntry.quizzesPassed + 1;
        break;
      case "assignment_submitted":
        updateData.assignmentsSubmitted = leaderboardEntry.assignmentsSubmitted + 1;
        break;
      case "perfect_score":
        updateData.perfectScores = leaderboardEntry.perfectScores + 1;
        break;
      case "login_streak":
        updateData.streakDays = Math.max(leaderboardEntry.streakDays, metadata.streakDays || 0);
        break;
      case "study_time":
        updateData.studyTimeMinutes = leaderboardEntry.studyTimeMinutes + (metadata.minutes || 0);
        break;
      case "login":
        updateData.totalLogins = leaderboardEntry.totalLogins + 1;
        break;
    }

    // Update the entry
    const updatedEntry = await prisma.leaderboardEntry.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Emit real-time update via WebSocket
    try {
      const { emitLeaderboardUpdate } = await import("@/lib/socket-events");
      await emitLeaderboardUpdate({
        userId,
        newScore: updatedEntry.totalScore,
        activityType,
        timestamp: new Date(),
      });
    } catch (socketError) {
      console.warn("Failed to emit leaderboard update:", socketError);
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        totalScore: updatedEntry.totalScore,
        rank: null, // Will be calculated on read
        activityType,
        points,
      },
    });
  } catch (error: any) {
    console.error("Error updating leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update leaderboard" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leaderboard/stats
 * Get leaderboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const totalUsers = await prisma.leaderboardEntry.count();
    const totalScore = await prisma.leaderboardEntry.aggregate({
      _sum: { totalScore: true },
    });
    const avgScore = totalUsers > 0 ? Math.round((totalScore._sum.totalScore || 0) / totalUsers) : 0;

    const topPerformers = await prisma.leaderboardEntry.findMany({
      take: 3,
      orderBy: { totalScore: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        averageScore: avgScore,
        topPerformers: topPerformers.map((entry, index) => ({
          rank: index + 1,
          name: `${entry.user.firstName} ${entry.user.lastName}`,
          score: entry.totalScore,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching leaderboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard stats" },
      { status: 500 }
    );
  }
}