import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "MENTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mentorId = payload.userId;

    // Get mentor's mentees count
    const menteesCount = await prisma.user.count({
      where: {
        mentorId: mentorId,
        role: "STUDENT",
      },
    });

    // Get sessions count
    const sessionsCount = await prisma.mentorSession.count({
      where: {
        mentorId: mentorId,
      },
    });

    // Get completed sessions
    const completedCount = await prisma.mentorSession.count({
      where: {
        mentorId: mentorId,
        status: "completed",
      },
    });

    // Get upcoming sessions
    const upcomingCount = await prisma.mentorSession.count({
      where: {
        mentorId: mentorId,
        status: "scheduled",
        sessionDate: {
          gte: new Date(),
        },
      },
    });

    // Calculate average mentee progress
    const mentees = await prisma.user.findMany({
      where: {
        mentorId: mentorId,
        role: "STUDENT",
      },
      select: {
        enrollments: {
          select: {
            completionPercentage: true,
          },
        },
      },
    });

    const avgProgress =
      menteesCount > 0
        ? Math.round(
            mentees.reduce((sum, m) => {
              const avg = m.enrollments.length > 0
                ? m.enrollments.reduce((s, e) => s + e.completionPercentage, 0) / m.enrollments.length
                : 0;
              return sum + avg;
            }, 0) / menteesCount
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalMentees: menteesCount,
        totalSessions: sessionsCount,
        completedSessions: completedCount,
        upcomingSessions: upcomingCount,
        averageMenteeProgress: avgProgress,
      },
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
