import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role?.toUpperCase() !== "MENTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mentorId = payload.userId || payload.sub;

    // ==== GET REAL DATA FROM DATABASE ====

    // Get mentor's mentees (from MentorSession model)
    const mentorSessions = await prisma.mentorSession.findMany({
      where: { mentorId },
      include: {
        mentee: {
          include: {
            enrollments: {
              select: {
                completionPercentage: true,
              },
            },
          },
        },
      },
    });

    // Get unique mentees
    const menteeMap = new Map();
    mentorSessions.forEach((session) => {
      if (!menteeMap.has(session.menteeId)) {
        const avgProgress =
          session.mentee.enrollments.length > 0
            ? Math.round(
                session.mentee.enrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) /
                  session.mentee.enrollments.length
              )
            : 0;

        menteeMap.set(session.menteeId, {
          id: session.menteeId,
          name: `${session.mentee.firstName} ${session.mentee.lastName}`,
          focusArea: session.topic || "General Mentorship",
          progression: avgProgress,
          nextSession: session.scheduledDate
            ? session.scheduledDate.toISOString()
            : "No session scheduled",
        });
      }
    });

    const activeMentees = Array.from(menteeMap.values());

    // Get upcoming sessions
    const upcomingSessions = await prisma.mentorSession.findMany({
      where: {
        mentorId,
        status: { in: ["scheduled", "ongoing"] },
      },
      include: {
        mentee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
      take: 5,
    });

    const upcomingFormatted = upcomingSessions.map((session) => ({
      id: session.id,
      menteeName: `${session.mentee.firstName} ${session.mentee.lastName}`,
      scheduledFor: session.scheduledDate?.toISOString() || new Date().toISOString(),
      topic: session.topic || "Mentoring Session",
    }));

    // Calculate hours this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonthSessions = await prisma.mentorSession.findMany({
      where: {
        mentorId,
        scheduledDate: {
          gte: thisMonthStart,
        },
      },
    });

    // Estimate 1 hour per session
    const mentorshipHoursThisMonth = thisMonthSessions.length;

    return NextResponse.json({
      success: true,
      data: {
        activeMentees,
        upcomingSessions: upcomingFormatted,
        totalMentees: activeMentees.length,
        mentorshipHoursThisMonth,
      },
    });
  } catch (error) {
    console.error("Error in mentor dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
