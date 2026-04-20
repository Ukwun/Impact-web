import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

    const { notes, attendance } = await request.json();
    const mentorId = payload.userId;
    const sessionId = params.sessionId;

    // Verify session belongs to this mentor
    const session = await prisma.mentorSession.findFirst({
      where: {
        id: sessionId,
        mentorId: mentorId,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Update session
    const updatedSession = await prisma.mentorSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        notes: notes || session.notes,
        attendance: attendance || "present",
        feedbackProvided: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedSession.id,
        status: updatedSession.status,
        attendance: updatedSession.attendance,
        feedbackProvided: updatedSession.feedbackProvided,
      },
    });
  } catch (error: any) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
