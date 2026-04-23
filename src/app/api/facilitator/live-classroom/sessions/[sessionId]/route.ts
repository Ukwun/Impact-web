import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import {
  computeParticipationScore,
  LIVE_SESSION_SEQUENCE,
  parseOpsEnvelope,
} from "@/lib/live-classroom-framework";
import { queueLiveSessionLifecycleNotifications } from "@/lib/live-session-lifecycle";

const FACILITATOR_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"];

type SessionParams = { params: Promise<{ sessionId: string }> };

export async function GET(request: NextRequest, { params }: SessionParams) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { sessionId } = await params;

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          createdById: true,
          enrollments: {
            select: {
              id: true,
              progress: true,
              userId: true,
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
      },
      attendance: {
        select: {
          id: true,
          userId: true,
          attended: true,
          attendanceMinutes: true,
          joinedAt: true,
          leftAt: true,
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
  }

  if (auth.user.role === "FACILITATOR" && session.facilitatorId !== auth.user.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const metadata = await prisma.contentMetadata.findFirst({
    where: { resourceType: "LIVE_SESSION", resourceId: session.id },
  });

  const ops = parseOpsEnvelope(metadata?.longDescription);
  const expectedMinutes = Math.max(
    1,
    Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))
  );

  const courseQuizAttempts = await prisma.quizAttempt.findMany({
    where: {
      userId: { in: session.course.enrollments.map((item) => item.userId) },
      quiz: { courseId: session.courseId },
      isPassed: true,
    },
    select: {
      userId: true,
      percentageScore: true,
    },
  });

  const activitySubmissions = await prisma.activitySubmission.findMany({
    where: {
      userId: { in: session.course.enrollments.map((item) => item.userId) },
      activity: { courseId: session.courseId },
      isSubmitted: true,
    },
    select: { userId: true, id: true },
  });

  const quizByUser = new Map<string, number[]>();
  for (const attempt of courseQuizAttempts) {
    const current = quizByUser.get(attempt.userId) || [];
    current.push(attempt.percentageScore || 0);
    quizByUser.set(attempt.userId, current);
  }

  const submissionsByUser = new Map<string, number>();
  for (const submission of activitySubmissions) {
    submissionsByUser.set(submission.userId, (submissionsByUser.get(submission.userId) || 0) + 1);
  }

  const attendanceByUser = new Map(session.attendance.map((item) => [item.userId, item]));
  const totalSubmitted = Math.max(1, activitySubmissions.length);

  const learners = session.course.enrollments.map((enrollment) => {
    const attendance = attendanceByUser.get(enrollment.userId);
    const quizzes = quizByUser.get(enrollment.userId) || [];
    const quizAverage =
      quizzes.length > 0
        ? quizzes.reduce((sum, value) => sum + value, 0) / quizzes.length
        : 0;
    const learnerSubmissions = submissionsByUser.get(enrollment.userId) || 0;
    const submissionRate = (learnerSubmissions / totalSubmitted) * 100;

    return {
      userId: enrollment.userId,
      name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
      email: enrollment.user.email,
      progress: enrollment.progress,
      attendance: attendance
        ? {
            attended: attendance.attended,
            attendanceMinutes: attendance.attendanceMinutes,
            joinedAt: attendance.joinedAt,
            leftAt: attendance.leftAt,
          }
        : {
            attended: false,
            attendanceMinutes: 0,
            joinedAt: null,
            leftAt: null,
          },
      participationScore: computeParticipationScore({
        attendanceMinutes: attendance?.attendanceMinutes || 0,
        expectedMinutes,
        quizAverage,
        submissionRate,
      }),
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        status: session.status,
        sessionType: session.sessionType,
        startTime: session.startTime,
        endTime: session.endTime,
        meetingUrl: session.meetingUrl,
        recordingUrl: session.recordingUrl,
        hasPolls: session.hasPolls,
        hasQandA: session.hasQandA,
        breakoutGroups: session.breakoutGroups,
      },
      course: {
        id: session.course.id,
        title: session.course.title,
      },
      facilitatorNotes: metadata?.facilitatorNotes || "",
      assignmentReminder: metadata?.learnerInstructions || "",
      sequence: LIVE_SESSION_SEQUENCE,
      currentStepKey: ops.currentStepKey,
      polls: ops.polls,
      breakouts: ops.breakouts,
      incidents: ops.incidents,
      replay: ops.replay,
      learners,
      summary: {
        totalLearners: learners.length,
        attendedLearners: learners.filter((item) => item.attendance.attended).length,
        averageParticipation:
          learners.length > 0
            ? Math.round(learners.reduce((sum, item) => sum + item.participationScore, 0) / learners.length)
            : 0,
      },
    },
  });
}

export async function PATCH(request: NextRequest, { params }: SessionParams) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { sessionId } = await params;
  const body = await request.json();

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    select: { id: true, facilitatorId: true },
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
  const ops = parseOpsEnvelope(metadata?.longDescription);

  const updatedOps = {
    ...ops,
    ...(body.currentStepKey ? { currentStepKey: body.currentStepKey } : {}),
    ...(Array.isArray(body.polls) ? { polls: body.polls } : {}),
    ...(Array.isArray(body.breakouts) ? { breakouts: body.breakouts } : {}),
  };

  await prisma.liveSession.update({
    where: { id: sessionId },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.meetingUrl !== undefined ? { meetingUrl: body.meetingUrl || null } : {}),
      ...(body.breakoutGroups !== undefined ? { breakoutGroups: Math.max(0, Number(body.breakoutGroups) || 0) } : {}),
      ...(body.hasPolls !== undefined ? { hasPolls: Boolean(body.hasPolls) } : {}),
      ...(body.hasQandA !== undefined ? { hasQandA: Boolean(body.hasQandA) } : {}),
    },
  });

  if (body.status === "LIVE") {
    await queueLiveSessionLifecycleNotifications({
      sessionId,
      eventType: "SESSION_STARTING",
      actorUserId: auth.user.userId,
      includeParents: true,
    });
  }

  if (metadata) {
    await prisma.contentMetadata.update({
      where: { id: metadata.id },
      data: {
        facilitatorNotes: body.facilitatorNotes ?? metadata.facilitatorNotes,
        learnerInstructions: body.assignmentReminder ?? metadata.learnerInstructions,
        longDescription: JSON.stringify(updatedOps),
      },
    });
  }

  return NextResponse.json({ success: true, message: "Session updated" });
}
