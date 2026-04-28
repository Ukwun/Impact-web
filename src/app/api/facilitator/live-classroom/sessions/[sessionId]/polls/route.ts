/**
 * Live Session Polls API
 * GET  /api/facilitator/live-classroom/sessions/[sessionId]/polls  – list polls
 * POST /api/facilitator/live-classroom/sessions/[sessionId]/polls  – create poll
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const FACILITATOR_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"];
const ALL_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN", "STUDENT", "PARENT"];

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const auth = await roleMiddleware(request, ALL_ROLES);
  if (auth instanceof NextResponse) return auth;

  const polls = await prisma.liveSessionPoll.findMany({
    where: { sessionId: params.sessionId },
    include: {
      responses: {
        select: { userId: true, selectedOptions: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Tally results
  const data = polls.map((poll) => {
    const tally: Record<string, number> = {};
    poll.options.forEach((opt) => { tally[opt] = 0; });
    poll.responses.forEach((r) => {
      r.selectedOptions.forEach((opt) => {
        tally[opt] = (tally[opt] ?? 0) + 1;
      });
    });

    return {
      id: poll.id,
      question: poll.question,
      options: poll.options,
      status: poll.status,
      allowMultiple: poll.allowMultiple,
      totalResponses: poll.responses.length,
      tally,
      // Students see whether they responded; facilitators see all responses
      myResponse: poll.responses.find((r) => r.userId === auth.user.userId)?.selectedOptions ?? null,
    };
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) return auth;

  const session = await prisma.liveSession.findUnique({
    where: { id: params.sessionId },
    select: { facilitatorId: true },
  });

  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
  }

  if (auth.user.role === "FACILITATOR" && session.facilitatorId !== auth.user.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { question, options, allowMultiple = false } = body;

  if (!question || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json(
      { success: false, error: "question and at least 2 options are required" },
      { status: 400 }
    );
  }

  const poll = await prisma.liveSessionPoll.create({
    data: {
      sessionId: params.sessionId,
      question,
      options,
      allowMultiple,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ success: true, data: poll }, { status: 201 });
}
