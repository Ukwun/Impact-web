import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/mentor/sessions - Schedule a new mentoring session
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Verify MENTOR role
    if (payload.role?.toUpperCase() !== "MENTOR") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions - MENTOR required" },
        { status: 403 }
      );
    }

    const mentorId = payload.userId || payload.sub;
    const { menteeId, topic, scheduledDate, notes } = await request.json();

    if (!menteeId || !topic || !scheduledDate) {
      return NextResponse.json(
        { success: false, error: "menteeId, topic, and scheduledDate are required" },
        { status: 400 }
      );
    }

    // Verify mentee exists
    const mentee = await prisma.user.findUnique({
      where: { id: menteeId },
    });

    if (!mentee) {
      return NextResponse.json(
        { success: false, error: "Mentee not found" },
        { status: 404 }
      );
    }

    // Create mentoring session
    const session = await prisma.mentorSession.create({
      data: {
        mentorId,
        menteeId,
        topic,
        scheduledDate: new Date(scheduledDate),
        notes: notes || "",
        status: "scheduled",
      },
      include: {
        mentee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Session scheduled successfully",
      session: {
        id: session.id,
        menteeName: `${session.mentee.firstName} ${session.mentee.lastName}`,
        topic: session.topic,
        scheduledDate: session.scheduledDate,
        status: session.status,
      },
    });
  } catch (error) {
    console.error("Error scheduling mentoring session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to schedule session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mentor/sessions - Get mentor's sessions
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Verify MENTOR role
    if (payload.role?.toUpperCase() !== "MENTOR") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const mentorId = payload.userId || payload.sub;

    // Get all sessions for this mentor
    const sessions = await prisma.mentorSession.findMany({
      where: { mentorId },
      include: {
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    });

    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      menteeId: session.mentee.id,
      menteeName: `${session.mentee.firstName} ${session.mentee.lastName}`,
      menteeEmail: session.mentee.email,
      topic: session.topic,
      scheduledDate: session.scheduledDate,
      status: session.status,
      notes: session.notes,
      createdAt: session.createdAt,
    }));

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      total: formattedSessions.length,
    });
  } catch (error) {
    console.error("Error fetching mentoring sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
