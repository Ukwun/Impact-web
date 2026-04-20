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
    if (!payload || payload.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = payload.userId;

    // Get all university peers
    const peers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { role: "UNI_MEMBER" },
        ],
      },
      select: {
        id: true,
        name: true,
        specialization: true,
        avatar: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    // Get connection status for each peer
    const peersWithStatus = await Promise.all(
      peers.map(async (peer) => {
        const connection = await prisma.connection.findFirst({
          where: {
            OR: [
              { fromUserId: userId, toUserId: peer.id },
              { fromUserId: peer.id, toUserId: userId },
            ],
          },
          select: { status: true },
        });

        return {
          id: peer.id,
          name: peer.name,
          specialization: peer.specialization,
          avatar: peer.avatar,
          email: peer.email,
          connectionStatus: connection?.status || "NONE",
          isConnected: connection?.status === "CONNECTED",
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: peersWithStatus,
    });
  } catch (error) {
    console.error("Error fetching uni peers:", error);
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
    if (!payload || payload.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { peerId, action } = await request.json();
    const userId = payload.userId;

    if (action === "connect") {
      // Create a connection request
      const existingConnection = await prisma.connection.findFirst({
        where: {
          OR: [
            { fromUserId: userId, toUserId: peerId },
            { fromUserId: peerId, toUserId: userId },
          ],
        },
      });

      if (existingConnection) {
        return NextResponse.json(
          { error: "Connection already exists" },
          { status: 400 }
        );
      }

      const connection = await prisma.connection.create({
        data: {
          fromUserId: userId,
          toUserId: peerId,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        connection,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error connecting peers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
