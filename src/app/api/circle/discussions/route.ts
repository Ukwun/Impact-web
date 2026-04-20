import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "CIRCLE_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = payload.userId;

    // Get discussions in user's communities
    const discussions = await prisma.discussion.findMany({
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
          select: { id: true, name: true, avatar: true },
        },
        community: {
          select: { id: true, name: true },
        },
        replyCount: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: discussions.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content.substring(0, 200), // Preview
        author: d.author,
        communityName: d.community.name,
        replies: d.replyCount,
        likes: d.likeCount,
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "CIRCLE_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { communityId, title, content } = await request.json();
    const userId = payload.userId;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content required" },
        { status: 400 }
      );
    }

    // Create discussion
    const discussion = await prisma.discussion.create({
      data: {
        communityId,
        authorId: userId,
        title,
        content,
        replyCount: 0,
        likeCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Discussion created",
      discussion,
    });
  } catch (error) {
    console.error("Error creating discussion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
