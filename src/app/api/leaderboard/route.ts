import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/leaderboard
 * Get global leaderboard rankings using the dedicated LeaderboardEntry model
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);
    const offset = parseInt(searchParams.get("offset") || "0");
    const state = searchParams.get("state"); // Optional state filter
    const school = searchParams.get("school"); // Optional school filter

    let whereClause: any = {};

    // Add filters if provided
    if (state) {
      whereClause.user = { state };
    }
    if (school) {
      whereClause.user = { ...whereClause.user, institution: school };
    }

    // Get leaderboard entries with user info
    const leaderboardEntries = await prisma.leaderboardEntry.findMany({
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
      orderBy: {
        totalScore: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Add ranking positions
    const leaderboard = leaderboardEntries.map((entry, index) => ({
      rank: offset + index + 1,
      user: entry.user,
      totalScore: entry.totalScore,
      coursesCompleted: entry.coursesCompleted,
      quizzesPassed: entry.quizzesPassed,
      assignmentsSubmitted: entry.assignmentsSubmitted,
      perfectScores: entry.perfectScores,
      streakDays: entry.streakDays,
      studyTimeMinutes: entry.studyTimeMinutes,
      lastActivityAt: entry.lastActivityAt,
    }));

    // Get total count
    const totalCount = await prisma.leaderboardEntry.count({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      data: leaderboard,
      total: totalCount,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
