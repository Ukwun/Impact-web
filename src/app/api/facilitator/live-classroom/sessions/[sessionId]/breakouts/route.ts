/**
 * Live Session Breakout Rooms API
 * GET  /api/facilitator/live-classroom/sessions/[sessionId]/breakouts – list rooms
 * POST /api/facilitator/live-classroom/sessions/[sessionId]/breakouts – create rooms
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { createZoomMeeting, isZoomConfigured } from "@/lib/zoom";

const FACILITATOR_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"];
const ALL_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN", "STUDENT", "PARENT"];

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const auth = await roleMiddleware(request, ALL_ROLES);
  if (auth instanceof NextResponse) return auth;

  const rooms = await prisma.liveSessionBreakoutRoom.findMany({
    where: { sessionId: params.sessionId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: rooms });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) return auth;

  const session = await prisma.liveSession.findUnique({
    where: { id: params.sessionId },
    select: {
      facilitatorId: true,
      title: true,
      startTime: true,
      endTime: true,
      breakoutGroups: true,
    },
    include: {
      // Reuse attendance list to know who is enrolled
      attendance: { select: { userId: true } },
    } as any,
  });

  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
  }

  if (auth.user.role === "FACILITATOR" && (session as any).facilitatorId !== auth.user.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { rooms: roomDefs } = body;

  // roomDefs is an array of { roomName, memberUserIds, topic }
  if (!Array.isArray(roomDefs) || roomDefs.length === 0) {
    return NextResponse.json(
      { success: false, error: "rooms array is required" },
      { status: 400 }
    );
  }

  // First, deactivate any existing rooms
  await prisma.liveSessionBreakoutRoom.updateMany({
    where: { sessionId: params.sessionId },
    data: { isActive: false },
  });

  const sessionData = session as any;
  const durationMinutes = sessionData.endTime
    ? Math.round((new Date(sessionData.endTime).getTime() - new Date(sessionData.startTime).getTime()) / 60_000)
    : 60;

  const createdRooms = await Promise.all(
    roomDefs.map(async (def: { roomName: string; memberUserIds?: string[]; topic?: string }, idx: number) => {
      let meetingUrl: string | null = null;

      if (isZoomConfigured()) {
        try {
          const zoom = await createZoomMeeting({
            topic: `${sessionData.title} – ${def.roomName || `Room ${idx + 1}`}`,
            startTime: new Date(sessionData.startTime),
            durationMinutes: Math.max(durationMinutes, 30),
            waitingRoom: false,
          });
          meetingUrl = zoom.joinUrl;
        } catch {
          // Zoom unavailable; proceed without a dedicated meeting link
        }
      }

      return prisma.liveSessionBreakoutRoom.create({
        data: {
          sessionId: params.sessionId,
          roomName: def.roomName || `Room ${idx + 1}`,
          meetingUrl,
          memberUserIds: def.memberUserIds ?? [],
          topic: def.topic ?? null,
          isActive: true,
        },
      });
    })
  );

  // Track engagement for assigned users
  const assignedUserIds = roomDefs.flatMap((r: any) => r.memberUserIds ?? []);
  if (assignedUserIds.length > 0) {
    await prisma.liveSessionEngagement.createMany({
      data: assignedUserIds.map((uid: string) => ({
        sessionId: params.sessionId,
        userId: uid,
        eventType: "BREAKOUT_ASSIGNED",
        metadata: {},
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ success: true, data: createdRooms }, { status: 201 });
}
