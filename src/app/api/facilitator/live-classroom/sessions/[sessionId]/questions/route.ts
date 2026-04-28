/**
 * Live Session Q&A API
 * GET  /api/facilitator/live-classroom/sessions/[sessionId]/questions – list questions
 * POST /api/facilitator/live-classroom/sessions/[sessionId]/questions – submit a question
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const ALL_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN", "STUDENT", "PARENT"];

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const auth = await roleMiddleware(request, ALL_ROLES);
  if (auth instanceof NextResponse) return auth;

  const isFacilitator = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"].includes(auth.user.role);

  const questions = await prisma.liveSessionQuestion.findMany({
    where: {
      sessionId: params.sessionId,
      // Students only see non-dismissed questions (facilitators see all)
      ...(isFacilitator ? {} : { status: { not: "DISMISSED" } }),
    },
    orderBy: [{ isPinned: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
  });

  const data = questions.map((q) => ({
    id: q.id,
    questionText: q.isAnonymous && !isFacilitator ? q.questionText : q.questionText,
    authorLabel: q.isAnonymous ? "Anonymous" : (isFacilitator ? q.userId : "Anonymous"),
    isAnonymous: q.isAnonymous,
    status: q.status,
    isPinned: q.isPinned,
    answerText: q.answerText,
    upvotes: q.upvotes,
    isMine: q.userId === auth.user.userId,
    createdAt: q.createdAt,
  }));

  return NextResponse.json({ success: true, data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const auth = await roleMiddleware(request, ALL_ROLES);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { questionText, isAnonymous = false } = body;

  if (!questionText || String(questionText).trim().length < 5) {
    return NextResponse.json(
      { success: false, error: "Question must be at least 5 characters" },
      { status: 400 }
    );
  }

  const session = await prisma.liveSession.findUnique({
    where: { id: params.sessionId },
    select: { status: true, hasQandA: true },
  });

  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
  }

  if (!session.hasQandA) {
    return NextResponse.json(
      { success: false, error: "Q&A is not enabled for this session" },
      { status: 400 }
    );
  }

  const question = await prisma.liveSessionQuestion.create({
    data: {
      sessionId: params.sessionId,
      userId: auth.user.userId,
      questionText: String(questionText).trim(),
      isAnonymous: Boolean(isAnonymous),
    },
  });

  // Track engagement
  await prisma.liveSessionEngagement.create({
    data: {
      sessionId: params.sessionId,
      userId: auth.user.userId,
      eventType: "QUESTION_SUBMITTED",
      metadata: { questionId: question.id },
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    data: {
      id: question.id,
      questionText: question.questionText,
      isAnonymous: question.isAnonymous,
      status: question.status,
      upvotes: question.upvotes,
      createdAt: question.createdAt,
    },
  }, { status: 201 });
}
