import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/achievements/user
 * Get current user's achievements
 */
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
    const userId = searchParams.get("userId") || payload.sub;

    // Get user's achievements with full details
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    });

    // Get total achievement count (hardcoded for now, could be moved to a separate table)
    const allAchievements = await prisma.userAchievement.findMany({
      select: { badge: true },
      distinct: ['badge'],
    });
    const totalAchievements = Math.max(allAchievements.length, 10);

    // Format achievement data (since we store achievement data directly in UserAchievement)
    const achievements = userAchievements.map((ua) => ({
      id: ua.id,
      badge: ua.badge,
      title: ua.title || ua.badge, // fallback to badge if no title
      description: ua.description,
      icon: ua.icon || "🏆", // default icon
      unlockedAt: ua.unlockedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        totalUnlocked: achievements.length,
        totalAvailable: totalAchievements,
        completionPercentage:
          Math.round((achievements.length / totalAchievements) * 100),
      },
    });
  } catch (error: any) {
    console.error("Error fetching user achievements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements/user
 * Unlock an achievement for user (admin/system use)
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
    const { userId, badge, title, description, icon } = body;

    // Verify user has permission (only admin or system can unlock achievements)
    if (payload.role !== "ADMIN" && payload.sub !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check if achievement already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_badge: {
          userId,
          badge,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: "Achievement already unlocked",
      });
    }

    // Create achievement
    const achievement = await prisma.userAchievement.create({
      data: {
        userId,
        badge,
        title,
        description: description || "",
        icon: icon || "",
      },
    });

    // Emit real-time event
    // This will be handled by WebSocket when socket.io is integrated
    console.log(`✓ Achievement unlocked: ${badge} for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: achievement,
    });
  } catch (error: any) {
    console.error("Error unlocking achievement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unlock achievement" },
      { status: 500 }
    );
  }
}
