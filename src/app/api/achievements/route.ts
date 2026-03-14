import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/achievements
 * Get all available achievements (for display/definition purposes)
 */
export async function GET(request: NextRequest) {
  try {
    // Define all available achievements in the system
    const allAchievements = [
      {
        id: "first_course",
        badge: "first_course",
        title: "First Steps",
        description: "Complete your first course",
        icon: "🎓",
        points: 10,
      },
      {
        id: "five_courses",
        badge: "five_courses",
        title: "Scholar",
        description: "Complete 5 courses",
        icon: "📚",
        points: 50,
      },
      {
        id: "perfect_score",
        badge: "perfect_score",
        title: "Perfect Score",
        description: "Achieve 100% on a quiz",
        icon: "⭐",
        points: 25,
      },
      {
        id: "quiz_master",
        badge: "quiz_master",
        title: "Quiz Master",
        description: "Complete 10 quizzes",
        icon: "🧠",
        points: 40,
      },
      {
        id: "assignment_champion",
        badge: "assignment_champion",
        title: "Assignment Champion",
        description: "Get A+ on 5 assignments",
        icon: "🥇",
        points: 60,
      },
      {
        id: "early_bird",
        badge: "early_bird",
        title: "Early Bird",
        description: "Complete a course within 7 days of enrollment",
        icon: "🌅",
        points: 20,
      },
      {
        id: "streaker",
        badge: "streaker",
        title: "On Fire",
        description: "Login for 7 consecutive days",
        icon: "🔥",
        points: 30,
      },
      {
        id: "mentor_star",
        badge: "mentor_star",
        title: "Mentor Star",
        description: "Help 5 other students",
        icon: "⭐",
        points: 50,
      },
      {
        id: "leaderboard_top_10",
        badge: "leaderboard_top_10",
        title: "Rising Star",
        description: "Reach top 10 in leaderboard",
        icon: "🌟",
        points: 100,
      },
      {
        id: "leaderboard_top_1",
        badge: "leaderboard_top_1",
        title: "Leaderboard Champion",
        description: "Rank #1 on leaderboard",
        icon: "👑",
        points: 500,
      },
    ];

    return NextResponse.json({
      success: true,
      data: allAchievements,
      total: allAchievements.length,
    });
  } catch (error: any) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
