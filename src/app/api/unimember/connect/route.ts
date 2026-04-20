import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload || payload.role !== "UNI_MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = payload.userId;
  const body = await request.json();

  try {
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    if (userId === memberId) {
      return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }

    // Check if member exists
    const member = await prisma.user.findUnique({
      where: { id: memberId }
    });

    if (!member || member.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if already connected
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, accepterId: memberId },
          { requesterId: memberId, accepterId: userId }
        ]
      }
    });

    if (existingConnection) {
      if (existingConnection.status === "accepted") {
        return NextResponse.json({ error: "Already connected with this member" }, { status: 400 });
      } else {
        return NextResponse.json({ error: "Connection request already sent" }, { status: 400 });
      }
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        requesterId: userId,
        accepterId: memberId,
        status: "pending",
        requestedAt: new Date()
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          connectionId: connection.id,
          status: "pending",
          message: "Connection request sent"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Connect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
