import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

  try {
    // Get current user's connections
    const userConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId, status: "accepted" },
          { accepterId: userId, status: "accepted" }
        ]
      },
      select: {
        requesterId: true,
        accepterId: true
      }
    });

    const connectedIds = new Set<string>();
    userConnections.forEach((conn) => {
      if (conn.requesterId === userId) connectedIds.add(conn.accepterId);
      else connectedIds.add(conn.requesterId);
    });

    // Get all other UNI_MEMBER users
    const members = await prisma.user.findMany({
      where: {
        role: "UNI_MEMBER",
        id: { not: userId },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileTitle: true,
        company: true,
        location: true,
        bio: true,
        skills: true,
        enrollments: {
          select: { courseId: true }
        }
      },
      take: 50,
      orderBy: { createdAt: "desc" }
    });

    // Calculate mutual connections and format response
    const formattedMembers = await Promise.all(
      members.map(async (member) => {
        // Get mutual connections
        const memberConnections = await prisma.connection.findMany({
          where: {
            OR: [
              { requesterId: member.id, status: "accepted" },
              { accepterId: member.id, status: "accepted" }
            ]
          },
          select: {
            requesterId: true,
            accepterId: true
          }
        });

        const memberConnectedIds = new Set<string>();
        memberConnections.forEach((conn) => {
          if (conn.requesterId === member.id) memberConnectedIds.add(conn.accepterId);
          else memberConnectedIds.add(conn.requesterId);
        });

        // Count mutual
        let mutualCount = 0;
        const expectedMutuals = Array.from(connectedIds);
        expectedMutuals.forEach((connected) => {
          if (memberConnectedIds.has(connected)) mutualCount++;
        });

        return {
          id: member.id,
          name: member.name,
          title: member.profileTitle || "Professional",
          company: member.company || "Not specified",
          location: member.location || "Not specified",
          bio: member.bio || "No bio yet",
          expertise: member.skills && member.skills.length > 0 ? member.skills : ["General"],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`,
          isConnected: connectedIds.has(member.id),
          mutualConnections: mutualCount,
          lastActive: new Date().toISOString() // Placeholder
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedMembers
    });
  } catch (error) {
    console.error("Members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
