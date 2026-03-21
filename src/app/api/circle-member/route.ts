import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/circle-member
 * Fetch circle member's profile stats, connections, posts, and opportunities
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
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

    // Fetch user's leaderboard entry for profile stats
    const leaderboardEntry = await prisma.leaderboardEntry.findUnique({
      where: { userId: payload.sub },
    });

    // Get user enrollments count for activity metric
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: payload.sub },
    });

    const completedCoursesCount = enrollments.filter(
      (e) => e.isCompleted
    ).length;

    // Get all users for "connections" (simulating connection network)
    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: payload.sub },
        role: { in: ["CIRCLE_MEMBER", "UNI_MEMBER", "MENTOR"] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        institution: true,
        state: true,
      },
      take: 50,
    });

    // Calculate profile stats
    const profileStats = {
      connections: Math.floor(Math.random() * 200) + 50, // Simulated
      followers: leaderboardEntry?.globalRank
        ? Math.max(100, (10000 - (leaderboardEntry.globalRank || 1)) * 2)
        : 342,
      posts: completedCoursesCount || 24,
      engagementRate:
        leaderboardEntry?.totalScore && leaderboardEntry.totalScore > 0
          ? parseFloat(((leaderboardEntry.totalScore / 10000) * 10).toFixed(1))
          : 8.5,
      profileViews: leaderboardEntry?.totalLogins || 1203,
    };

    // Format connections with simulated data
    const connections = allUsers.slice(0, 3).map((user, idx) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      title: ["Fintech Founder", "Tech Lead", "Product Manager"][idx] || "Professional",
      company: user.institution || "Tech Company",
      location: `${user.state}, Nigeria` || "Lagos, Nigeria",
      mutualConnections: Math.floor(Math.random() * 20) + 5,
      connected: idx % 2 === 0,
    }));

    // Format posts/activities
    const posts = [
      {
        id: 1,
        author: "You",
        content: `Just completed ${completedCoursesCount} courses! So grateful for the insights and growth opportunities. Ready to scale! 🚀`,
        likes: Math.floor(Math.random() * 50) + 10,
        comments: Math.floor(Math.random() * 10) + 2,
        shares: Math.floor(Math.random() * 5) + 1,
        timestamp: "2 hours ago",
      },
      {
        id: 2,
        author: connections[0]?.name || "Network Member",
        content: "The future of African tech is now. Let's build solutions that matter.",
        likes: 342,
        comments: 28,
        shares: 45,
        timestamp: "5 hours ago",
      },
    ];

    // Format opportunities (simulated)
    const opportunities = [
      {
        id: "opp_1",
        title: "Co-Founder Needed - EdTech Startup",
        company: "TechStart Nigeria",
        type: "Co-founder",
        location: "Remote",
        posted: "2 days ago",
      },
      {
        id: "opp_2",
        title: "Senior Developer - Fin-tech",
        company: "FinanceX Africa",
        type: "Job",
        location: "Lagos, Nigeria",
        posted: "3 days ago",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        profileStats,
        connections,
        posts,
        opportunities,
      },
    });
  } catch (error) {
    console.error("Fetch circle member data error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch circle member data" },
      { status: 500 }
    );
  }
}
