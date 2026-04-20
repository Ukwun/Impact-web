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
    // Get enrolled courses count
    const enrolledCourses = await prisma.enrollment.count({
      where: { userId }
    });

    // Get professional connections
    const connections = await prisma.connection.count({
      where: {
        OR: [
          { requesterId: userId, status: "accepted" },
          { accepterId: userId, status: "accepted" }
        ]
      }
    });

    // Get registered events
    const registeredEvents = await prisma.eventRegistration.count({
      where: { userId }
    });

    // Get pending connection requests
    const pendingRequests = await prisma.connection.count({
      where: {
        accepterId: userId,
        status: "pending"
      }
    });

    // Calculate average course progress
    const enrollmentProgress = await prisma.enrollment.findMany({
      where: { userId },
      select: { completionPercentage: true }
    });

    const averageProgress = enrollmentProgress.length > 0
      ? Math.round(
          enrollmentProgress.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) /
          enrollmentProgress.length
        )
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        enrolledCourses,
        currentConnections: connections,
        registeredEvents,
        pendingRequests,
        averageCourseProgress: averageProgress
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
