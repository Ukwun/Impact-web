import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/auth-service";

const VENTURE_ACTIVITY_TYPES = [
  "BUSINESS_PLAN",
  "PROJECTION_WORKSHEET",
  "INVESTOR_SIMULATION",
  "CAPSTONE_PITCH",
];

type Params = { params: Promise<{ activityId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { activityId } = await params;
  const body = await request.json();
  const responsePayload = body?.response;

  if (!responsePayload || typeof responsePayload !== "object") {
    return NextResponse.json({ success: false, error: "Submission content is required" }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity || !VENTURE_ACTIVITY_TYPES.includes(activity.activityType)) {
    return NextResponse.json({ success: false, error: "Venture artefact not found" }, { status: 404 });
  }

  const submission = await prisma.activitySubmission.upsert({
    where: {
      activityId_userId: {
        activityId,
        userId: auth.user.userId,
      },
    },
    update: {
      content: JSON.stringify(responsePayload),
      attachments: [],
      isSubmitted: true,
      submittedAt: new Date(),
    },
    create: {
      activityId,
      userId: auth.user.userId,
      content: JSON.stringify(responsePayload),
      attachments: [],
      isSubmitted: true,
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    message: "Venture artefact submitted successfully",
    data: {
      id: submission.id,
      submittedAt: submission.submittedAt,
      isSubmitted: submission.isSubmitted,
    },
  });
}