import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "CIRCLE_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = payload.userId;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        expertise: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get joined communities
    const joinedCommunities = await prisma.community.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        memberCount: true,
        focusArea: true,
      },
    });

    // Get recent discussions in joined communities
    const recentDiscussions = await prisma.discussion.findMany({
      where: {
        community: {
          members: {
            some: { userId },
          },
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: { name: true },
        },
        community: {
          select: { name: true },
        },
        replyCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get suggested members (people with similar interests in same communities)
    const suggestedMembers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { role: "CIRCLE_MEMBER" },
          {
            communityMemberships: {
              some: {
                community: {
                  members: {
                    some: { userId },
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        expertise: true,
      },
      take: 6,
    });

    // Get unread messages
    const unreadMessages = await prisma.message.count({
      where: {
        toUserId: userId,
        isRead: false,
      },
    });

    // Calculate contribution score
    const discussionScore = await prisma.discussion.count({
      where: { authorId: userId },
    }) * 10;

    const replyScore = await prisma.reply.count({
      where: { authorId: userId },
    }) * 5;

    const contributionScore = discussionScore + replyScore;

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        avatar: user.avatar,
        joinedCommunities: joinedCommunities.map((c) => ({
          id: c.id,
          name: c.name,
          members: c.memberCount,
          isMember: true,
          focusArea: c.focusArea,
        })),
        recentDiscussions: recentDiscussions.map((d) => ({
          id: d.id,
          communityName: d.community.name,
          title: d.title,
          author: d.author.name,
          replies: d.replyCount,
          createdAt: d.createdAt.toISOString(),
        })),
        suggestedMembers: suggestedMembers.map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          expertise: m.expertise || [],
          isMutualsConnection: false,
        })),
        unreadMessages,
        contributionScore,
        communityCount: {
          joined: joinedCommunities.length,
          suggested: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error in circle dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
