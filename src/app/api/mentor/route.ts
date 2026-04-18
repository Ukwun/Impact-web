import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/mentor
 * Fetch mentor's dashboard data including mentees, sessions, and statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch mentor's sessions
    const mentorSessions = await prisma.mentorSession.findMany({
      where: { mentorId: payload.sub },
      include: {
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    // Calculate statistics
    const now = new Date();
    const upcomingSessions = mentorSessions.filter(
      (s) => new Date(s.scheduledAt) > now
    );
    const pastSessions = mentorSessions.filter(
      (s) => new Date(s.scheduledAt) <= now
    );
    const completedSessions = mentorSessions.filter(
      (s) => s.endedAt !== null
    ).length;
    const activeSessions = mentorSessions.filter(
      (s) => s.startedAt !== null && s.endedAt === null
    ).length;

    // Get unique mentees
    const menteeMap = new Map<string, typeof mentorSessions[0]["mentee"]>();
    mentorSessions.forEach((session) => {
      if (session.mentee && !menteeMap.has(session.menteeId)) {
        menteeMap.set(session.menteeId, session.mentee);
      }
    });
    const uniqueMentees = Array.from(menteeMap.values());

    // Calculate mentee progress (simplified - could be enhanced with course data)
    const menteesWithProgress = await Promise.all(
      uniqueMentees.map(async (mentee) => {
        if (!mentee) return null;
        
        const menteeEnrollments = await prisma.enrollment.findMany({
          where: { userId: mentee.id },
          select: { progress: true },
        });

        const avgProgress =
          menteeEnrollments.length > 0
            ? Math.round(
                menteeEnrollments.reduce((sum, e) => sum + e.progress, 0) /
                  menteeEnrollments.length
              )
            : 0;

        const menteeSessions = mentorSessions.filter(
          (s) => s.menteeId === mentee.id
        );
        const lastMeeting = menteeSessions
          .filter((s) => s.startedAt)
          .sort((a, b) =>
            new Date(b.startedAt || 0).getTime() -
            new Date(a.startedAt || 0).getTime()
          )[0];
        const nextMeeting = upcomingSessions.find(
          (s) => s.menteeId === mentee.id
        );

        return {
          id: mentee.id,
          name: `${mentee.firstName} ${mentee.lastName}`,
          email: mentee.email,
          avatar: mentee.avatar,
          progress: avgProgress,
          lastMeeting: lastMeeting
            ? new Date(lastMeeting.startedAt || lastMeeting.scheduledAt).toLocaleDateString()
            : "No sessions yet",
          nextMeeting: nextMeeting
            ? new Date(nextMeeting.scheduledAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "No upcoming sessions",
          status:
            avgProgress >= 75
              ? "Exceeding Goals"
              : avgProgress >= 50
                ? "On Track"
                : "Needs Support",
        };
      })
    ).then((results) => results.filter((m) => m !== null));

    // Format sessions for display
    const formattedSessions = mentorSessions
      .filter((s) => new Date(s.scheduledAt) > now)
      .sort((a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
      )
      .slice(0, 5)
      .map((session) => ({
        id: session.id,
        mentee: `${session.mentee?.firstName || "Unknown"} ${
          session.mentee?.lastName || ""
        }`,
        date: new Date(session.scheduledAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: `${session.duration} min`,
        topic: session.title,
        status: "scheduled",
      }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalMentees: uniqueMentees.length,
          upcomingMeetings: upcomingSessions.length,
          completedSessions,
          activeSessions,
          avgMenteeProgress:
            menteesWithProgress.length > 0
              ? Math.round(
                  menteesWithProgress.reduce((sum, m) => sum + m.progress, 0) /
                    menteesWithProgress.length
                )
              : 0,
        },
        mentees: menteesWithProgress,
        sessions: formattedSessions,
        totalSessions: mentorSessions.length,
      },
    });
  } catch (error) {
    console.error("Fetch mentor data error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch mentor data" },
      { status: 500 }
    );
  }
}
