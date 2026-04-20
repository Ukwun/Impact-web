import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

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

    // ✅ MOCK DATA - No database queries
    const mockData = {
      success: true,
      data: {
        activeMentees: [
          {
            id: "m1",
            name: "Alex Rivera",
            focusArea: "Career Development",
            progression: 65,
            nextSession: "2026-04-25 10:00 AM",
          },
          {
            id: "m2",
            name: "Jordan Lee",
            focusArea: "Technical Skills",
            progression: 48,
            nextSession: "2026-04-27 2:00 PM",
          },
          {
            id: "m3",
            name: "Casey Morgan",
            focusArea: "Leadership",
            progression: 82,
            nextSession: "2026-04-22 3:30 PM",
          },
        ],
        upcomingSessions: [
          {
            id: "s1",
            menteeName: "Casey Morgan",
            scheduledFor: "2026-04-22T15:30:00Z",
            topic: "Leadership strategies",
          },
          {
            id: "s2",
            menteeName: "Alex Rivera",
            scheduledFor: "2026-04-25T10:00:00Z",
            topic: "Career transition planning",
          },
        ],
        totalMentees: 8,
        mentorshipHoursThisMonth: 12,
      },
    };

    return NextResponse.json(mockData);

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
