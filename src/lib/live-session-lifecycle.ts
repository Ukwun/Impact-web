import { AlertSeverity, NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type LifecycleEventType =
  | "SESSION_SCHEDULED"
  | "SESSION_STARTING"
  | "ATTENDANCE_RECORDED"
  | "REPLAY_PUBLISHED"
  | "SAFEGUARDING_ESCALATED";

type QueueChannel = "WHATSAPP" | "SMS";

type QueueLifecycleOptions = {
  sessionId: string;
  eventType: LifecycleEventType;
  actorUserId?: string;
  messageOverride?: string;
  includeParents?: boolean;
  extraMetadata?: Record<string, unknown>;
};

type QueueJob = {
  channel: QueueChannel;
  userId: string;
  phone: string | null;
  role: "LEARNER" | "PARENT";
};

function buildLifecycleCopy(input: {
  eventType: LifecycleEventType;
  sessionTitle: string;
  courseTitle: string;
  startTime: Date;
  messageOverride?: string;
}): { title: string; message: string; notificationType: NotificationType } {
  if (input.messageOverride) {
    return {
      title: input.sessionTitle,
      message: input.messageOverride,
      notificationType: NotificationType.SYSTEM,
    };
  }

  const formattedTime = input.startTime.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  switch (input.eventType) {
    case "SESSION_SCHEDULED":
      return {
        title: `Live session scheduled: ${input.sessionTitle}`,
        message: `Your ${input.courseTitle} live class is scheduled for ${formattedTime}. Join on time and prepare for attendance confirmation, participation, and assignment briefing.`,
        notificationType: NotificationType.EVENT_REMINDER,
      };
    case "SESSION_STARTING":
      return {
        title: `Live session starting: ${input.sessionTitle}`,
        message: `Your ${input.courseTitle} live class is starting now. Open the classroom, confirm attendance, and be ready for facilitator-led participation.`,
        notificationType: NotificationType.EVENT_REMINDER,
      };
    case "ATTENDANCE_RECORDED":
      return {
        title: `Attendance updated: ${input.sessionTitle}`,
        message: `Attendance has been recorded for ${input.sessionTitle}. Check your classroom follow-up prompt and assignment instructions.`,
        notificationType: NotificationType.SYSTEM,
      };
    case "REPLAY_PUBLISHED":
      return {
        title: `Replay available: ${input.sessionTitle}`,
        message: `The replay for ${input.sessionTitle} is now available in your library. Review the key concept teaching, challenge prompt, and assignment briefing.`,
        notificationType: NotificationType.EVENT_REMINDER,
      };
    case "SAFEGUARDING_ESCALATED":
      return {
        title: `Safeguarding follow-up: ${input.sessionTitle}`,
        message: `A safeguarding or conduct follow-up has been logged for ${input.sessionTitle}. The programme team will review and contact relevant stakeholders if required.`,
        notificationType: NotificationType.SYSTEM,
      };
  }
}

async function getSessionAudience(sessionId: string, includeParents = true) {
  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    include: {
      course: {
        include: {
          enrollments: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, phone: true },
              },
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw new Error("Live session not found");
  }

  const learnerIds = session.course.enrollments.map((enrollment) => enrollment.userId);
  const parents = includeParents
    ? await prisma.parentChild.findMany({
        where: {
          childId: { in: learnerIds },
          isActive: true,
          canReceiveAlerts: true,
        },
        include: {
          parent: {
            select: { id: true, phone: true },
          },
        },
      })
    : [];

  return { session, parents };
}

function buildQueueJobs(args: {
  learners: Array<{ userId: string; user: { phone: string | null } }>;
  parents: Array<{ parent: { id: string; phone: string | null } }>;
}): QueueJob[] {
  const jobs: QueueJob[] = [];

  for (const learner of args.learners) {
    jobs.push(
      { channel: "WHATSAPP", userId: learner.userId, phone: learner.user.phone, role: "LEARNER" },
      { channel: "SMS", userId: learner.userId, phone: learner.user.phone, role: "LEARNER" }
    );
  }

  for (const relationship of args.parents) {
    jobs.push(
      { channel: "WHATSAPP", userId: relationship.parent.id, phone: relationship.parent.phone, role: "PARENT" },
      { channel: "SMS", userId: relationship.parent.id, phone: relationship.parent.phone, role: "PARENT" }
    );
  }

  return jobs;
}

export async function queueLiveSessionLifecycleNotifications(options: QueueLifecycleOptions) {
  const { session, parents } = await getSessionAudience(options.sessionId, options.includeParents ?? true);

  const copy = buildLifecycleCopy({
    eventType: options.eventType,
    sessionTitle: session.title,
    courseTitle: session.course.title,
    startTime: session.startTime,
    messageOverride: options.messageOverride,
  });

  const notifications = session.course.enrollments.map((enrollment) => ({
    userId: enrollment.userId,
    title: copy.title,
    message: copy.message,
    type: copy.notificationType,
    link: `/dashboard/facilitator/classroom/${session.courseId}`,
    relatedId: session.id,
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications,
    });
  }

  const jobs = buildQueueJobs({ learners: session.course.enrollments, parents });

  await prisma.systemAlert.create({
    data: {
      title: `${options.eventType.replaceAll("_", " ")} queue prepared`,
      message: `Queued ${jobs.length} outbound WhatsApp/SMS jobs for ${session.title}.`,
      severity: AlertSeverity.INFO,
      category: "Messaging Queue",
      source: "live_session_lifecycle",
      metadata: {
        sessionId: session.id,
        courseId: session.courseId,
        eventType: options.eventType,
        actorUserId: options.actorUserId,
        queuedJobs: jobs,
        queuedCount: jobs.length,
        ...options.extraMetadata,
      } satisfies Prisma.JsonObject,
    },
  });

  return {
    sessionId: session.id,
    queuedCount: jobs.length,
    recipientCount: notifications.length,
  };
}

export async function createReplayReviewAlert(input: {
  sessionId: string;
  recordingUrl: string;
  actorUserId?: string;
  replayLibraryUrl?: string;
}) {
  const session = await prisma.liveSession.findUnique({
    where: { id: input.sessionId },
    include: { course: { select: { title: true } } },
  });

  if (!session) {
    throw new Error("Live session not found");
  }

  return prisma.systemAlert.create({
    data: {
      title: `Replay review required: ${session.title}`,
      message: `A replay has been published for ${session.course.title}. Review content quality, safeguarding fit, and publishing readiness.`,
      severity: AlertSeverity.WARNING,
      category: "Replay Review",
      source: "live_session_replay",
      metadata: {
        sessionId: session.id,
        courseId: session.courseId,
        sessionTitle: session.title,
        courseTitle: session.course.title,
        recordingUrl: input.recordingUrl,
        replayLibraryUrl: input.replayLibraryUrl || "/dashboard/resources/library",
        actorUserId: input.actorUserId,
        reviewStatus: "PENDING",
      } satisfies Prisma.JsonObject,
    },
  });
}

export async function createSafeguardingEscalationAlert(input: {
  sessionId: string;
  note: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  actorUserId?: string;
}) {
  const session = await prisma.liveSession.findUnique({
    where: { id: input.sessionId },
    include: { course: { select: { title: true } } },
  });

  if (!session) {
    throw new Error("Live session not found");
  }

  return prisma.systemAlert.create({
    data: {
      title: `Safeguarding escalation: ${session.title}`,
      message: `A ${input.severity.toLowerCase()} severity safeguarding note was logged for ${session.course.title}.`,
      severity:
        input.severity === "HIGH"
          ? AlertSeverity.CRITICAL
          : input.severity === "MEDIUM"
            ? AlertSeverity.WARNING
            : AlertSeverity.INFO,
      category: "Safeguarding",
      source: "live_session_incident",
      metadata: {
        sessionId: session.id,
        courseId: session.courseId,
        sessionTitle: session.title,
        courseTitle: session.course.title,
        incidentNote: input.note,
        incidentSeverity: input.severity,
        actorUserId: input.actorUserId,
        escalationStatus: input.severity === "HIGH" ? "OPEN" : "REVIEW",
      } satisfies Prisma.JsonObject,
    },
  });
}
