import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth-service";
import { updateRhythmSessionState } from "@/lib/rhythm-db";

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const updated = await updateRhythmSessionState(
    authResult.user.userId,
    params.sessionId,
    "IN_PROGRESS"
  );

  return NextResponse.json({
    success: true,
    message: "Session started",
    data: {
      sessionId: params.sessionId,
      userId: authResult.user.userId,
      startedAt: updated.startedAt,
      status: "IN_PROGRESS",
    },
  });
}
