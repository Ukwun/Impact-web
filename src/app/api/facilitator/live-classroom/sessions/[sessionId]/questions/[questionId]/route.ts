/**
 * Live Session Q&A Question Actions
 * PATCH /api/facilitator/live-classroom/sessions/[sessionId]/questions/[questionId]
 *   Facilitator: answer, pin, dismiss
 *   Student: upvote
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const ALL_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN", "STUDENT", "PARENT"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string; questionId: string } }
) {
  const auth = await roleMiddleware(request, ALL_ROLES);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { action, answerText } = body;

  const question = await prisma.liveSessionQuestion.findUnique({
    where: { id: params.questionId },
  });

  if (!question || question.sessionId !== params.sessionId) {
    return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
  }

  const isFacilitator = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"].includes(auth.user.role);

  if (action === "ANSWER") {
    if (!isFacilitator) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (!answerText || String(answerText).trim().length === 0) {
      return NextResponse.json({ success: false, error: "answerText is required" }, { status: 400 });
    }

    const updated = await prisma.liveSessionQuestion.update({
      where: { id: params.questionId },
      data: {
        answerText: String(answerText).trim(),
        answeredByUserId: auth.user.userId,
        status: "ANSWERED",
      },
    });

    return NextResponse.json({ success: true, data: updated });
  }

  if (action === "PIN" || action === "UNPIN") {
    if (!isFacilitator) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.liveSessionQuestion.update({
      where: { id: params.questionId },
      data: { isPinned: action === "PIN" },
    });

    return NextResponse.json({ success: true, data: updated });
  }

  if (action === "DISMISS") {
    if (!isFacilitator) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.liveSessionQuestion.update({
      where: { id: params.questionId },
      data: { status: "DISMISSED" },
    });

    return NextResponse.json({ success: true, data: updated });
  }

  if (action === "UPVOTE") {
    // Any authenticated user can upvote (once — tracked via engagement)
    const alreadyUpvoted = await prisma.liveSessionEngagement.findFirst({
      where: {
        sessionId: params.sessionId,
        userId: auth.user.userId,
        eventType: "QUESTION_UPVOTED",
        metadata: { path: ["questionId"], equals: params.questionId },
      },
    });

    if (alreadyUpvoted) {
      return NextResponse.json({ success: false, error: "Already upvoted" }, { status: 400 });
    }

    const [updated] = await prisma.$transaction([
      prisma.liveSessionQuestion.update({
        where: { id: params.questionId },
        data: { upvotes: { increment: 1 } },
      }),
      prisma.liveSessionEngagement.create({
        data: {
          sessionId: params.sessionId,
          userId: auth.user.userId,
          eventType: "QUESTION_UPVOTED",
          metadata: { questionId: params.questionId },
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: { id: updated.id, upvotes: updated.upvotes } });
  }

  return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
}
