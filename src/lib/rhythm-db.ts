import { prisma } from "@/lib/prisma";

type RhythmTemplate = {
  id: string;
  name: string;
  description: string;
  pattern: {
    pattern: Record<string, string>;
    totalWeeklyHours: number;
    focusAreas: string[];
    flexibility: "STRICT" | "MODERATE" | "FLEXIBLE";
  };
  hoursPerWeek: number;
  sessionCount: number;
  sessionDuration: number;
  targetAudience: string[];
  successRate: number;
};

type RhythmState = {
  currentTemplateId: string;
  sessions: Record<string, { status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"; startedAt?: string; completedAt?: string }>;
  streakDays: number;
  updatedAt?: string;
};

const DEFAULT_TEMPLATE_ID = "balanced-learner";

function toIsoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function parseJson<T>(value?: string | null, fallback?: T): T {
  if (!value) {
    return fallback as T;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback as T;
  }
}

async function upsertTemplate(template: RhythmTemplate) {
  const existing = await prisma.contentMetadata.findFirst({
    where: {
      resourceType: "RHYTHM_TEMPLATE",
      resourceId: template.id,
    },
  });

  const payload = {
    title: template.name,
    shortDescription: template.description,
    longDescription: JSON.stringify(template),
    resourceType: "RHYTHM_TEMPLATE",
    resourceId: template.id,
    contentType: "RHYTHM_TEMPLATE",
    isPublished: true,
    publishedAt: new Date(),
  };

  if (existing) {
    return prisma.contentMetadata.update({
      where: { id: existing.id },
      data: payload,
    });
  }

  return prisma.contentMetadata.create({ data: payload });
}

export async function seedRhythmCmsData() {
  const templates: RhythmTemplate[] = [
    {
      id: "balanced-learner",
      name: "Balanced Learner",
      description: "A practical weekly blend of learn, apply, live, and review.",
      pattern: {
        pattern: {
          MON: "Learn: concept lessons and guided notes",
          TUE: "Practice: worksheet and reflection task",
          WED: "Live: facilitator-led session",
          THU: "Live: clinics and Q&A",
          FRI: "Assess: quiz and rubric challenge",
          SAT: "Reinforce: replay and peer challenge",
          SUN: "Reflect and prepare for next week",
        },
        totalWeeklyHours: 6,
        focusAreas: ["Learn", "Apply", "Engage Live", "Show Progress"],
        flexibility: "MODERATE",
      },
      hoursPerWeek: 6,
      sessionCount: 8,
      sessionDuration: 45,
      targetAudience: ["Primary", "Junior Secondary", "Senior Secondary", "ImpactUni"],
      successRate: 86,
    },
    {
      id: "deep-dive",
      name: "Deep Dive",
      description: "Longer focused blocks for intensive progression.",
      pattern: {
        pattern: {
          MON: "Learn and annotate",
          TUE: "Apply and build",
          WED: "Live studio",
          THU: "Guided clinic",
          FRI: "Assessment and project checkpoint",
          SAT: "Capstone sprint",
          SUN: "Reflection and planning",
        },
        totalWeeklyHours: 8,
        focusAreas: ["Learn", "Apply", "Projects", "Assessment"],
        flexibility: "STRICT",
      },
      hoursPerWeek: 8,
      sessionCount: 9,
      sessionDuration: 55,
      targetAudience: ["Senior Secondary", "ImpactUni"],
      successRate: 83,
    },
    {
      id: "quick-cycle",
      name: "Quick Cycle",
      description: "Short, consistent sessions optimized for busy schedules.",
      pattern: {
        pattern: {
          MON: "Learn",
          TUE: "Practice",
          WED: "Live quick check-in",
          THU: "Practice and feedback",
          FRI: "Assess",
          SAT: "Optional challenge",
          SUN: "Light reinforcement",
        },
        totalWeeklyHours: 4,
        focusAreas: ["Consistency", "Practice", "Short assessments"],
        flexibility: "FLEXIBLE",
      },
      hoursPerWeek: 4,
      sessionCount: 7,
      sessionDuration: 30,
      targetAudience: ["Primary", "Junior Secondary", "Parents"],
      successRate: 79,
    },
  ];

  for (const template of templates) {
    await upsertTemplate(template);
  }
}

async function getOrCreateUserRhythmState(userId: string) {
  const existing = await prisma.contentMetadata.findFirst({
    where: {
      resourceType: "RHYTHM_PROGRESS",
      resourceId: userId,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.contentMetadata.create({
    data: {
      title: `Rhythm progress for ${userId}`,
      resourceType: "RHYTHM_PROGRESS",
      resourceId: userId,
      contentType: "RHYTHM_PROGRESS",
      longDescription: JSON.stringify({
        currentTemplateId: DEFAULT_TEMPLATE_ID,
        sessions: {},
        streakDays: 0,
      } satisfies RhythmState),
      isPublished: false,
    },
  });
}

async function saveRhythmState(userId: string, state: RhythmState) {
  const record = await getOrCreateUserRhythmState(userId);
  await prisma.contentMetadata.update({
    where: { id: record.id },
    data: {
      longDescription: JSON.stringify(state),
      updatedAt: new Date(),
    },
  });
}

async function readRhythmState(userId: string): Promise<RhythmState> {
  const record = await getOrCreateUserRhythmState(userId);
  return parseJson<RhythmState>(record.longDescription, {
    currentTemplateId: DEFAULT_TEMPLATE_ID,
    sessions: {},
    streakDays: 0,
  });
}

function getDayScheduleSkeleton(weekStartDate: Date) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  return days.map((day, index) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + index);
    return {
      dayOfWeek: day,
      date: toIsoDate(date),
      focusArea: "Reinforce",
      sessions: [] as Array<{
        id: string;
        sessionType: "CONCEPT_STUDY" | "PRACTICE" | "PROJECT_WORK" | "DISCUSSION" | "REVIEW";
        title: string;
        courseId: string;
        courseName: string;
        duration: number;
        resources: Array<{ id: string; type: "VIDEO" | "ARTICLE" | "INTERACTIVE" | "ASSIGNMENT" | "DISCUSSION"; title: string; duration?: number; url: string }>;
        objectives: string[];
        status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
        startedAt?: string;
        completedAt?: string;
      }>,
      suggestedDuration: 20,
      completionRate: 0,
      status: "PLANNED" as "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED",
    };
  });
}

export async function getWeeklyRhythmData(userId: string, weekOffset: number) {
  await seedRhythmCmsData();

  const now = new Date();
  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);

  const [enrollments, scheduleRecords, templateRecords, state] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
      take: 3,
    }),
    prisma.weeklyLearningSchedule.findMany({
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
      orderBy: [{ moduleId: "asc" }, { weekNumber: "asc" }],
      take: 30,
    }),
    prisma.contentMetadata.findMany({
      where: { resourceType: "RHYTHM_TEMPLATE", isPublished: true },
      orderBy: { title: "asc" },
    }),
    readRhythmState(userId),
  ]);

  const templates = templateRecords
    .map((entry) => parseJson<RhythmTemplate>(entry.longDescription))
    .filter(Boolean) as RhythmTemplate[];

  const currentTemplate = templates.find((t) => t.id === state.currentTemplateId) ?? templates[0];

  const schedule = getDayScheduleSkeleton(weekStartDate);

  const activeModules = enrollments
    .map((enrollment) => enrollment.course.modules[0])
    .filter(Boolean)
    .slice(0, 1);

  const activeModule = activeModules[0];
  const relevantWeekNumber = Math.max(1, weekOffset + 1);
  const weeklyRecord = scheduleRecords.find(
    (record) => record.moduleId === activeModule?.id && record.weekNumber === relevantWeekNumber
  );

  const courseId = activeModule?.courseId ?? "course-impact-101";
  const courseName = enrollments[0]?.course.title ?? "Impact Learning Track";

  if (weeklyRecord) {
    schedule[0].focusArea = "Learn";
    schedule[0].sessions = weeklyRecord.mondayLessonTitle
      ? [
          {
            id: `${weeklyRecord.id}-mon`,
            sessionType: "CONCEPT_STUDY",
            title: weeklyRecord.mondayLessonTitle,
            courseId,
            courseName,
            duration: 35,
            resources: [
              {
                id: `${weeklyRecord.id}-mon-res`,
                type: "VIDEO",
                title: "Lesson resource",
                duration: 35,
                url: weeklyRecord.mondayLessonUrl ?? "/dashboard/learn",
              },
            ],
            objectives: ["Understand core concept", "Prepare practical tasks"],
            status: "NOT_STARTED",
          },
        ]
      : [];
    schedule[0].suggestedDuration = 60;

    const tuesdayActivities = weeklyRecord.tuesdayActivityIds;
    schedule[1].focusArea = "Practice";
    schedule[1].sessions = tuesdayActivities.map((activityId, index) => ({
      id: `${weeklyRecord.id}-tue-${index + 1}`,
      sessionType: "PRACTICE",
      title: `Activity ${index + 1}`,
      courseId,
      courseName,
      duration: 25,
      resources: [
        {
          id: `${activityId}-res`,
          type: "ASSIGNMENT",
          title: "Worksheet",
          duration: 25,
          url: "/dashboard/assignments",
        },
      ],
      objectives: ["Apply current concept", "Submit progress evidence"],
      status: "NOT_STARTED",
    }));
    schedule[1].suggestedDuration = 50;

    schedule[2].focusArea = "Engage Live";
    schedule[2].sessions = weeklyRecord.liveSessionTitle
      ? [
          {
            id: `${weeklyRecord.id}-wed-live`,
            sessionType: "DISCUSSION",
            title: weeklyRecord.liveSessionTitle,
            courseId,
            courseName,
            duration: 60,
            resources: [
              {
                id: `${weeklyRecord.liveSessionId ?? weeklyRecord.id}-live-res`,
                type: "DISCUSSION",
                title: "Live classroom",
                duration: 60,
                url: "/dashboard/my-events",
              },
            ],
            objectives: ["Engage facilitator", "Resolve blockers"],
            status: "NOT_STARTED",
          },
        ]
      : [];
    schedule[2].suggestedDuration = 60;

    schedule[4].focusArea = "Assess";
    schedule[4].sessions = [
      {
        id: `${weeklyRecord.id}-fri-assess`,
        sessionType: "REVIEW",
        title: "Weekly assessment",
        courseId,
        courseName,
        duration: 40,
        resources: [
          {
            id: `${weeklyRecord.fridayQuizId ?? weeklyRecord.id}-quiz`,
            type: "ASSIGNMENT",
            title: "Quiz and rubric challenge",
            duration: 40,
            url: "/dashboard/progress",
          },
        ],
        objectives: ["Measure understanding", "Update progress score"],
        status: "NOT_STARTED",
      },
    ];
    schedule[4].suggestedDuration = 45;

    schedule[5].focusArea = "Reinforce";
    schedule[5].sessions = weeklyRecord.weekendActivityIds.map((activityId, index) => ({
      id: `${weeklyRecord.id}-sat-${index + 1}`,
      sessionType: "PROJECT_WORK",
      title: weeklyRecord.weekendChallengeTitle ?? `Weekend challenge ${index + 1}`,
      courseId,
      courseName,
      duration: 30,
      resources: [
        {
          id: `${activityId}-reinforce`,
          type: "INTERACTIVE",
          title: "Reinforcement activity",
          duration: 30,
          url: weeklyRecord.weekendReplayUrl ?? "/dashboard/challenges",
        },
      ],
      objectives: ["Retain the week outcomes", "Produce project evidence"],
      status: "NOT_STARTED",
    }));
    schedule[5].suggestedDuration = 35;
  }

  for (const day of schedule) {
    let completed = 0;
    let inProgress = 0;
    for (const session of day.sessions) {
      const stateSession = state.sessions[session.id];
      if (stateSession) {
        session.status = stateSession.status;
        session.startedAt = stateSession.startedAt;
        session.completedAt = stateSession.completedAt;
      }
      if (session.status === "COMPLETED") {
        completed += 1;
      } else if (session.status === "IN_PROGRESS") {
        inProgress += 1;
      }
    }

    day.completionRate = day.sessions.length > 0 ? Math.round((completed / day.sessions.length) * 100) : 0;
    day.status = completed === day.sessions.length && day.sessions.length > 0 ? "COMPLETED" : inProgress > 0 ? "IN_PROGRESS" : "PLANNED";
  }

  const flattened = schedule.flatMap((day) => day.sessions);
  const completedSessions = flattened.filter((session) => session.status === "COMPLETED").length;
  const inProgressSessions = flattened.filter((session) => session.status === "IN_PROGRESS").length;

  return {
    success: true,
    data: {
      rhythm: {
        studentId: userId,
        currentTemplate,
        weekStartDate: toIsoDate(weekStartDate),
        weekEndDate: toIsoDate(new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)),
        schedule,
        streakDays: state.streakDays,
        completedSessionsThisWeek: completedSessions,
        totalSessionsThisWeek: flattened.length,
        adaptations: [
          {
            timestamp: new Date().toISOString(),
            type: "DURATION_CHANGE",
            reason: "Rhythm adjusted based on completion density",
            impact: `${Math.max(0, completedSessions - inProgressSessions)} sessions stabilized this week`,
          },
        ],
        insights: [
          {
            id: "insight-peak-time",
            type: "PEAK_TIME",
            title: "Best engagement window",
            description: "Weekday evening blocks continue to show your highest completion rate.",
            actionable: true,
            suggestedAction: "Schedule Wednesday and Friday sessions between 5:00 PM and 6:30 PM.",
          },
          {
            id: "insight-assess-consistency",
            type: "RECOMMENDATION",
            title: "Improve assessment consistency",
            description: "Assessment tasks perform better when prep happens one day earlier.",
            actionable: true,
            suggestedAction: "Set Thursday review reminder before Friday assessment.",
          },
        ],
      },
      templates,
      userStats: {
        bestDay: schedule.reduce((best, current) => (current.completionRate > best.completionRate ? current : best), schedule[0]).dayOfWeek,
        averageSessionDuration: flattened.length > 0 ? Math.round(flattened.reduce((sum, item) => sum + item.duration, 0) / flattened.length) : 0,
        consistencyScore: flattened.length > 0 ? Math.round((completedSessions / flattened.length) * 100) : 0,
        weeklyTarget: flattened.length,
        weeklyCompleted: completedSessions,
      },
    },
  };
}

export async function switchRhythmTemplate(userId: string, templateId: string) {
  const state = await readRhythmState(userId);
  const nextState: RhythmState = {
    ...state,
    currentTemplateId: templateId,
    updatedAt: new Date().toISOString(),
  };

  await saveRhythmState(userId, nextState);
  return nextState;
}

export async function updateRhythmSessionState(userId: string, sessionId: string, status: "IN_PROGRESS" | "COMPLETED") {
  const state = await readRhythmState(userId);
  const previous = state.sessions[sessionId] ?? { status: "NOT_STARTED" as const };

  const updated = {
    ...previous,
    status,
    startedAt: previous.startedAt ?? new Date().toISOString(),
    completedAt: status === "COMPLETED" ? new Date().toISOString() : undefined,
  };

  const nextState: RhythmState = {
    ...state,
    sessions: {
      ...state.sessions,
      [sessionId]: updated,
    },
    streakDays: status === "COMPLETED" ? Math.max(state.streakDays, 1) : state.streakDays,
    updatedAt: new Date().toISOString(),
  };

  await saveRhythmState(userId, nextState);
  return updated;
}
