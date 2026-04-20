import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Get all professional networks/communities
    const networks = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        memberCount: true,
        focusArea: true,
        image: true,
      },
      orderBy: { memberCount: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: networks,
    });
  } catch (error) {
    console.error("Error fetching networks:", error);
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

    const { communityId, action } = await request.json();
    const userId = payload.userId;

    if (action === "join") {
      // Check if already member
      const existingMember = await prisma.communityMember.findFirst({
        where: {
          communityId,
          userId,
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "Already a member" },
          { status: 400 }
        );
      }

      // Add user to community
      const member = await prisma.communityMember.create({
        data: {
          communityId,
          userId,
          joinedAt: new Date(),
        },
      });

      // Increment member count
      await prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        message: "Joined community",
        member,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error joining network:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
