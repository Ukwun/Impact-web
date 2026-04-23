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

  if (!body.note) {
    return NextResponse.json({ success: false, error: "note is required" }, { status: 400 });
  }

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    select: { facilitatorId: true, title: true },
  });

  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
  }

  if (auth.user.role === "FACILITATOR" && session.facilitatorId !== auth.user.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const metadata = await prisma.contentMetadata.findFirst({
    where: { resourceType: "LIVE_SESSION", resourceId: sessionId },
  });

  if (!metadata) {
    return NextResponse.json({ success: false, error: "Session metadata not found" }, { status: 404 });
  }

  const ops = parseOpsEnvelope(metadata.longDescription);
  const incident = {
    id: `incident_${Date.now()}`,
    note: String(body.note),
    severity: (body.severity || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
    createdAt: new Date().toISOString(),
    createdBy: auth.user.userId,
  };

  const updatedOps = {
    ...ops,
    incidents: [incident, ...ops.incidents].slice(0, 100),
  };

  await prisma.contentMetadata.update({
    where: { id: metadata.id },
    data: {
      longDescription: JSON.stringify(updatedOps),
      facilitatorNotes: metadata.facilitatorNotes
        ? `${metadata.facilitatorNotes}\n\n[Safeguarding ${incident.severity}] ${incident.note}`
        : `[Safeguarding ${incident.severity}] ${incident.note}`,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Incident note saved",
    data: incident,
  });
}
