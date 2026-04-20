import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = payload.userId;

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        specialization: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get university connections
    const connections = await prisma.connection.count({
      where: {
        OR: [
          { fromUserId: userId, status: "CONNECTED" },
          { toUserId: userId, status: "CONNECTED" },
        ],
      },
    });

    // Get peer recommendations (university peers with similar specializations)
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
      },
      take: 6,
    });

    // Map to recommendation format with connection status
    const recommendations = await Promise.all(
      peers.map(async (peer) => {
        const isConnected = await prisma.connection.findFirst({
          where: {
            OR: [
              { fromUserId: userId, toUserId: peer.id, status: "CONNECTED" },
              { fromUserId: peer.id, toUserId: userId, status: "CONNECTED" },
            ],
          },
        });

        return {
          id: peer.id,
          name: peer.name,
          specialization: peer.specialization || "No specialization",
          isConnected: !!isConnected,
        };
      })
    );

    // Get upcoming university events
    const events = await prisma.event.findMany({
      where: {
        AND: [
          { type: "UNIVERSITY" },
          { eventDate: { gte: new Date() } },
        ],
      },
      select: {
        id: true,
        title: true,
        eventDate: true,
        attendeeCount: true,
      },
      orderBy: { eventDate: "asc" },
      take: 5,
    });

    // Get available opportunities (scholarships, internships, careers)
    const opportunities = await prisma.opportunity.findMany({
      where: {
        AND: [
          { type: { in: ["SCHOLARSHIP", "CAREER", "INTERNSHIP"] } },
          { deadline: { gte: new Date() } },
        ],
      },
      select: {
        id: true,
        title: true,
        type: true,
        deadline: true,
      },
      orderBy: { deadline: "asc" },
      take: 5,
    });

    // Calculate network stats
    const networkStats = {
      total: connections,
      degree2: Math.floor(connections * 3), // Estimated 2nd degree network
    };

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        specialization: user.specialization,
        connections,
        network: networkStats,
        recommendations,
        eventInvitations: events.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.eventDate.toISOString(),
          attendees: e.attendeeCount,
        })),
        opportunities: opportunities.map((o) => ({
          id: o.id,
          title: o.title,
          type: o.type.toLowerCase(),
          deadline: o.deadline.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error in uni dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
