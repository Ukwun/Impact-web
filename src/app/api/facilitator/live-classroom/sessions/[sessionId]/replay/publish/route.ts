import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { parseOpsEnvelope } from "@/lib/live-classroom-framework";

const FACILITATOR_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"];
type SessionParams = { params: Promise<{ sessionId: string }> };

export async function POST(request: NextRequest, { params }: SessionParams) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { sessionId } = await params;
  const body = await request.json();

  if (!body.recordingUrl) {
    return NextResponse.json({ success: false, error: "recordingUrl is required" }, { status: 400 });
  }

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    select: { facilitatorId: true },
  });

  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
  }

  if (auth.user.role === "FACILITATOR" && session.facilitatorId !== auth.user.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  await prisma.liveSession.update({
    where: { id: sessionId },
    data: {
      recordingUrl: String(body.recordingUrl),
      status: "COMPLETED",
    },
  });

  const metadata = await prisma.contentMetadata.findFirst({
    where: { resourceType: "LIVE_SESSION", resourceId: sessionId },
  });

  if (metadata) {
    const ops = parseOpsEnvelope(metadata.longDescription);
    const updatedOps = {
      ...ops,
      replay: {
        published: true,
        publishedAt: new Date().toISOString(),
      },
    };

    await prisma.contentMetadata.update({
      where: { id: metadata.id },
      data: {
        longDescription: JSON.stringify(updatedOps),
        progressComponentUrl: body.replayLibraryUrl || "/dashboard/resources/library",
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    success: true,
    message: "Replay published",
    data: {
      sessionId,
      recordingUrl: body.recordingUrl,
      publishedAt: new Date().toISOString(),
    },
  });
}
