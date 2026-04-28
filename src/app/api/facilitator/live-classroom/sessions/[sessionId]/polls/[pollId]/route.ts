/**
 * Live Session Poll Actions
 * PATCH /api/facilitator/live-classroom/sessions/[sessionId]/polls/[pollId]
 *   – launch or close a poll (facilitator)
 *   – submit a response (student)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const ALL_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN", "STUDENT", "PARENT"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string; pollId: string } }
) {
  const auth = await roleMiddleware(request, ALL_ROLES);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { action, selectedOptions } = body;

  const poll = await prisma.liveSessionPoll.findUnique({
    where: { id: params.pollId },
    include: { session: { select: { facilitatorId: true } } },
  });

  if (!poll || poll.sessionId !== params.sessionId) {
    return NextResponse.json({ success: false, error: "Poll not found" }, { status: 404 });
  }

  const isFacilitator = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"].includes(auth.user.role);

  // Facilitator actions: launch / close
  if (action === "LAUNCH" || action === "CLOSE") {
    if (!isFacilitator) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (action === "LAUNCH" && poll.status === "CLOSED") {
      return NextResponse.json({ success: false, error: "Cannot reopen a closed poll" }, { status: 400 });
    }

    const updated = await prisma.liveSessionPoll.update({
      where: { id: params.pollId },
      data: { status: action === "LAUNCH" ? "ACTIVE" : "CLOSED" },
    });

    return NextResponse.json({ success: true, data: updated });
  }

  // Student action: respond
  if (action === "RESPOND") {
    if (poll.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Poll is not active" }, { status: 400 });
    }

    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
      return NextResponse.json({ success: false, error: "selectedOptions is required" }, { status: 400 });
    }

    if (!poll.allowMultiple && selectedOptions.length > 1) {
      return NextResponse.json({ success: false, error: "This poll only allows a single choice" }, { status: 400 });
    }

    const invalidOptions = selectedOptions.filter((o: string) => !poll.options.includes(o));
    if (invalidOptions.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid option(s): ${invalidOptions.join(", ")}` },
        { status: 400 }
      );
    }

    const response = await prisma.liveSessionPollResponse.upsert({
      where: { pollId_userId: { pollId: params.pollId, userId: auth.user.userId } },
      update: { selectedOptions },
      create: { pollId: params.pollId, userId: auth.user.userId, selectedOptions },
    });

    // Track engagement
    await prisma.liveSessionEngagement.create({
      data: {
        sessionId: params.sessionId,
        userId: auth.user.userId,
        eventType: "POLL_RESPONSE",
        metadata: { pollId: params.pollId },
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: response });
  }

  return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
}
