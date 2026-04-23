import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const FACILITATOR_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"];
type SessionParams = { params: Promise<{ sessionId: string }> };

export async function POST(request: NextRequest, { params }: SessionParams) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { sessionId } = await params;
  const body = await request.json();
  const records = Array.isArray(body.records) ? body.records : [];

  if (records.length === 0) {
    return NextResponse.json({ success: false, error: "records are required" }, { status: 400 });
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

  await prisma.$transaction(
    records.map((record: { userId: string; attended?: boolean; attendanceMinutes?: number }) =>
      prisma.liveSessionAttendance.upsert({
        where: {
          sessionId_userId: {
            sessionId,
            userId: record.userId,
          },
        },
        update: {
          attended: Boolean(record.attended),
          attendanceMinutes: Math.max(0, Number(record.attendanceMinutes) || 0),
          joinedAt: record.attended ? new Date() : null,
          leftAt: record.attended ? null : new Date(),
        },
        create: {
          sessionId,
          userId: record.userId,
          attended: Boolean(record.attended),
          attendanceMinutes: Math.max(0, Number(record.attendanceMinutes) || 0),
          joinedAt: record.attended ? new Date() : null,
          leftAt: record.attended ? null : new Date(),
        },
      })
    )
  );

  return NextResponse.json({
    success: true,
    message: "Attendance updated",
    data: { sessionId, updated: records.length },
  });
}
