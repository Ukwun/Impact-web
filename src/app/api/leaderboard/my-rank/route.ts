import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/leaderboard/my-rank
 * Get user's current rank in global leaderboard using LeaderboardEntry
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get("state"); // Optional state filter

    // Get user's leaderboard entry
    let whereClause: any = { userId: payload.sub };
    if (state) {
      whereClause.user = { state };
    }

    const userEntry = await prisma.leaderboardEntry.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            state: true,
            institution: true,
          },
        },
      },
    });

    if (!userEntry) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "User has no leaderboard entry yet",
      });
    }

    // Count how many users have higher scores
    let higherScoresWhere: any = {
      totalScore: { gt: userEntry.totalScore },
    };
    if (state) {
      higherScoresWhere.user = { state };
    }

    const higherScores = await prisma.leaderboardEntry.count({
      where: higherScoresWhere,
    });

    const rank = higherScores + 1;

    return NextResponse.json({
      success: true,
      data: {
        rank,
        totalScore: userEntry.totalScore,
        coursesCompleted: userEntry.coursesCompleted,
        quizzesPassed: userEntry.quizzesPassed,
        assignmentsSubmitted: userEntry.assignmentsSubmitted,
        perfectScores: userEntry.perfectScores,
        streakDays: userEntry.streakDays,
        studyTimeMinutes: userEntry.studyTimeMinutes,
        lastActivityAt: userEntry.lastActivityAt,
        user: userEntry.user,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user rank:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user rank" },
      { status: 500 }
    );
  }
}
