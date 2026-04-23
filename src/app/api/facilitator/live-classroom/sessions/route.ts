import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { defaultOpsEnvelope, LIVE_SESSION_SEQUENCE } from "@/lib/live-classroom-framework";
import { queueLiveSessionLifecycleNotifications } from "@/lib/live-session-lifecycle";

const FACILITATOR_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"];

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const courseId = request.nextUrl.searchParams.get("courseId");

  const sessions = await prisma.liveSession.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(auth.user.role === "FACILITATOR" ? { facilitatorId: auth.user.userId } : {}),
    },
    include: {
      course: {
        select: { id: true, title: true },
      },
      attendance: {
        select: { userId: true, attended: true, attendanceMinutes: true },
      },
    },
    orderBy: [{ startTime: "asc" }],
    take: 100,
  });

  return NextResponse.json({
    success: true,
    data: sessions.map((session) => {
      const attendedCount = session.attendance.filter((item) => item.attended).length;
      return {
        id: session.id,
        title: session.title,
        description: session.description,
        courseId: session.courseId,
        courseTitle: session.course.title,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        sessionType: session.sessionType,
        meetingUrl: session.meetingUrl,
        recordingUrl: session.recordingUrl,
        hasPolls: session.hasPolls,
        hasQandA: session.hasQandA,
        breakoutGroups: session.breakoutGroups,
        attendanceSummary: {
          totalTracked: session.attendance.length,
          attended: attendedCount,
          attendanceRate: session.attendance.length > 0 ? Math.round((attendedCount / session.attendance.length) * 100) : 0,
        },
      };
    }),
  });
}

export async function POST(request: NextRequest) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();

  if (!body.courseId || !body.title || !body.startTime || !body.endTime) {
    return NextResponse.json(
      { success: false, error: "courseId, title, startTime and endTime are required" },
      { status: 400 }
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: body.courseId },
    select: { id: true, createdById: true },
  });

  if (!course) {
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  }

  if (auth.user.role === "FACILITATOR" && course.createdById !== auth.user.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const session = await prisma.liveSession.create({
    data: {
      courseId: body.courseId,
      moduleId: body.moduleId || null,
      title: body.title,
      description: body.description || null,
      facilitatorId: auth.user.userId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      status: "SCHEDULED",
      sessionType: body.sessionType || "CLASSROOM",
      meetingUrl: body.meetingUrl || null,
      hasPolls: Boolean(body.hasPolls),
      hasQandA: body.hasQandA ?? true,
      breakoutGroups: Number.isFinite(body.breakoutGroups) ? Math.max(0, Number(body.breakoutGroups)) : 0,
    },
  });

  await prisma.contentMetadata.upsert({
    where: {
      resourceType_resourceId: {
        resourceType: "LIVE_SESSION",
        resourceId: session.id,
      },
    },
    update: {
      title: body.title,
      shortDescription: body.description || null,
      contentType: "LIVE_CLASSROOM",
      facilitatorNotes: body.facilitatorNotes || null,
      longDescription: JSON.stringify(defaultOpsEnvelope()),
      engageLiveComponentUrl: `/dashboard/facilitator/classroom/${body.courseId}`,
      completionRule: "Attendance confirmation and assignment briefing completion",
      learningObjectives: body.learningObjectives || [],
    },
    create: {
      resourceType: "LIVE_SESSION",
      resourceId: session.id,
      title: body.title,
      shortDescription: body.description || null,
      contentType: "LIVE_CLASSROOM",
      facilitatorNotes: body.facilitatorNotes || null,
      longDescription: JSON.stringify(defaultOpsEnvelope()),
      engageLiveComponentUrl: `/dashboard/facilitator/classroom/${body.courseId}`,
      completionRule: "Attendance confirmation and assignment briefing completion",
      learningObjectives: body.learningObjectives || LIVE_SESSION_SEQUENCE.map((item) => item.label),
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await queueLiveSessionLifecycleNotifications({
    sessionId: session.id,
    eventType: "SESSION_SCHEDULED",
    actorUserId: auth.user.userId,
    includeParents: true,
    extraMetadata: {
      scheduleWindow: {
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Live session created",
    data: session,
  });
}
