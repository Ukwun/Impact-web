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

    // Get all sessions for this mentor
    const sessions = await prisma.mentorSession.findMany({
      where: {
        mentorId: mentorId,
      },
      select: {
        id: true,
        mentee: {
          select: {
            id: true,
            name: true,
          },
        },
        sessionDate: true,
        duration: true,
        topic: true,
        status: true,
        notes: true,
        attendance: true,
        feedbackProvided: true,
      },
      orderBy: {
        sessionDate: "desc",
      },
    });

    const transformedSessions = sessions.map((session) => ({
      id: session.id,
      menteeId: session.mentee.id,
      menteeName: session.mentee.name,
      sessionDate: session.sessionDate,
      duration: session.duration,
      topic: session.topic,
      status: session.status,
      notes: session.notes || "",
      attendance: session.attendance,
      feedbackProvided: session.feedbackProvided,
    }));

    return NextResponse.json({
      success: true,
      data: transformedSessions,
    });
  } catch (error: any) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { menteeId, sessionDate, duration, topic } = await request.json();

    if (!menteeId || !sessionDate || !duration || !topic) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const mentorId = payload.userId;

    // Verify mentee belongs to this mentor
    const mentee = await prisma.user.findFirst({
      where: {
        id: menteeId,
        mentorId: mentorId,
        role: "STUDENT",
      },
    });

    if (!mentee) {
      return NextResponse.json(
        { error: "Mentee not found or not your mentee" },
        { status: 404 }
      );
    }

    // Create mentoring session
    const session = await prisma.mentorSession.create({
      data: {
        mentorId,
        menteeId,
        sessionDate: new Date(sessionDate),
        duration: parseInt(duration),
        topic,
        status: "scheduled",
        feedbackProvided: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        menteeName: mentee.name,
        sessionDate: session.sessionDate,
        duration: session.duration,
        topic: session.topic,
      },
    });
  } catch (error: any) {
    console.error("Schedule session error:", error);
    return NextResponse.json(
      { error: "Failed to schedule session" },
      { status: 500 }
    );
  }
}
