/**
 * Weekly Rhythm API Route
 * /api/rhythm/weekly - Get student's real weekly learning schedule
 *
 * Builds the schedule from:
 *   - Active enrollments with their module/lesson/activity/live-session data
 *   - WeeklyLearningSchedule rows (if configured by the facilitator)
 *   - LessonProgress + ModuleProgress for completion rates
 *   - LiveSessions scheduled this week
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = request.nextUrl;
    const weekOffset = parseInt(searchParams.get("weekOffset") || "0", 10);

    // Students may only view their own schedule; facilitators/admins may query any user
    const requestedStudentId = searchParams.get("studentId");
    let studentId = authResult.user.userId;

    if (requestedStudentId && requestedStudentId !== studentId) {
      if (!["ADMIN", "FACILITATOR", "SCHOOL_ADMIN", "PARENT"].includes(authResult.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      studentId = requestedStudentId;
    }

    // ---------- Week boundaries ----------
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7); // Monday
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const toIsoDate = (d: Date) => d.toISOString().split("T")[0];
    const dayDate = (offset: number) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + offset);
      return toIsoDate(d);
    };

    // ---------- Load enrollments with progress ----------
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            modules: {
              orderBy: { order: "asc" },
              take: 3,
              select: {
                id: true,
                title: true,
                order: true,
                estimatedWeeks: true,
                weeklySchedules: {
                  orderBy: { weekNumber: "asc" },
                  take: 1,
                },
                lessons: {
                  orderBy: { order: "asc" },
                  take: 5,
                  select: {
                    id: true,
                    title: true,
                    learningLayer: true,
                    duration: true,
                    videoUrl: true,
                  },
                },
                activities: {
                  where: { isPublished: true },
                  orderBy: { order: "asc" },
                  take: 3,
                  select: { id: true, title: true, activityType: true, dueDate: true, maxPoints: true },
                },
              },
            },
          },
        },
        moduleProgress: {
          select: {
            moduleId: true,
            progressPercentage: true,
            learnLayerCompleted: true,
            applyLayerCompleted: true,
            engageLiveLayerCompleted: true,
          },
        },
        lessonProgress: {
          select: { lessonId: true, isCompleted: true, secondsWatched: true },
        },
      },
      orderBy: { enrolledAt: "asc" },
      take: 5,
    });

    // ---------- Live sessions this week ----------
    const liveSessions = await prisma.liveSession.findMany({
      where: {
        courseId: { in: enrollments.map((e) => e.courseId) },
        startTime: { gte: weekStart, lt: weekEnd },
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      select: {
        id: true,
        title: true,
        courseId: true,
        course: { select: { title: true } },
        startTime: true,
        endTime: true,
        meetingUrl: true,
        status: true,
        hasPolls: true,
        hasQandA: true,
        breakoutGroups: true,
      },
      orderBy: { startTime: "asc" },
    });

    // ---------- Map of completed lessons ----------
    const completedLessonIds = new Set(
      enrollments.flatMap((e) =>
        e.lessonProgress.filter((lp) => lp.isCompleted).map((lp) => lp.lessonId)
      )
    );

    // ---------- Module progress lookup ----------
    const modProgressMap = new Map(
      enrollments.flatMap((e) =>
        e.moduleProgress.map((mp) => [mp.moduleId, mp])
      )
    );

    // ---------- Build per-day schedule ----------
    // Strategy: use the first enrolled course's modules as the source of truth.
    // Map layers to days: Mon=LEARN, Tue=APPLY, Wed+Thu=ENGAGE_LIVE, Fri=ASSESS, Sat=REINFORCE
    const primaryEnrollment = enrollments[0] ?? null;
    const primaryCourse = primaryEnrollment?.course ?? null;
    const primaryModule = primaryCourse?.modules[0] ?? null;

    // Helper: determine status of a set of lesson IDs
    const layerStatus = (lessonIds: string[]): string => {
      if (!lessonIds.length) return "PLANNED";
      const done = lessonIds.filter((id) => completedLessonIds.has(id)).length;
      if (done === lessonIds.length) return "COMPLETED";
      if (done > 0) return "IN_PROGRESS";
      return "NOT_STARTED";
    };

    const learnLessons = primaryModule?.lessons.filter((l) => l.learningLayer === "LEARN") ?? [];
    const applyLessons = primaryModule?.lessons.filter((l) => l.learningLayer === "APPLY") ?? [];
    const applyActivities = primaryModule?.activities ?? [];
    const modProgress = primaryModule ? modProgressMap.get(primaryModule.id) : null;

    // Live sessions indexed by day
    const sessionsByDay: Record<number, typeof liveSessions> = {};
    liveSessions.forEach((ls) => {
      const day = ((new Date(ls.startTime).getDay() + 6) % 7); // 0=Mon...6=Sun
      if (!sessionsByDay[day]) sessionsByDay[day] = [];
      sessionsByDay[day].push(ls);
    });

    const buildSession = (ls: (typeof liveSessions)[0]) => ({
      id: ls.id,
      sessionType: "LIVE_CLASS",
      title: ls.title,
      courseId: ls.courseId,
      courseName: ls.course.title,
      duration: Math.round((new Date(ls.endTime ?? ls.startTime).getTime() - new Date(ls.startTime).getTime()) / 60_000),
      resources: [
        {
          id: `live-${ls.id}`,
          type: "LIVE_SESSION",
          title: `Join: ${ls.title}`,
          duration: 0,
          url: `/dashboard/live-session/${ls.id}`,
        },
        ...(ls.meetingUrl
          ? [{ id: `zoom-${ls.id}`, type: "ZOOM", title: "Open in Zoom", duration: 0, url: ls.meetingUrl }]
          : []),
      ],
      objectives: [
        ls.hasPolls ? "Participate in live polls" : null,
        ls.hasQandA ? "Ask questions in Q&A" : null,
        ls.breakoutGroups > 0 ? `Join breakout group discussion` : null,
      ].filter(Boolean) as string[],
      status: ls.status === "LIVE" ? "IN_PROGRESS" : "NOT_STARTED",
      meetingUrl: ls.meetingUrl,
      startTime: ls.startTime,
    });

    const schedule = [
      {
        dayOfWeek: "MON",
        date: dayDate(0),
        focusArea: "Learn",
        suggestedDuration: 60,
        completionRate: modProgress?.learnLayerCompleted ? 100 : learnLessons.filter(l => completedLessonIds.has(l.id)).length > 0 ? 50 : 0,
        status: modProgress?.learnLayerCompleted ? "COMPLETED" : layerStatus(learnLessons.map(l => l.id)),
        sessions: learnLessons.length > 0
          ? learnLessons.slice(0, 2).map((l) => ({
              id: `learn-${l.id}`,
              sessionType: "CONCEPT_STUDY",
              title: l.title,
              courseId: primaryCourse!.id,
              courseName: primaryCourse!.title,
              duration: l.duration,
              resources: [
                ...(l.videoUrl ? [{ id: `vid-${l.id}`, type: "VIDEO", title: l.title, duration: l.duration, url: `/dashboard/learning-journey` }] : []),
                { id: `notes-${l.id}`, type: "ARTICLE", title: "Guided notes", duration: 15, url: `/dashboard/learning-journey` },
              ],
              objectives: ["Understand the concept", "Complete guided notes"],
              status: completedLessonIds.has(l.id) ? "COMPLETED" : "NOT_STARTED",
            }))
          : [],
      },
      {
        dayOfWeek: "TUE",
        date: dayDate(1),
        focusArea: "Practice",
        suggestedDuration: 50,
        completionRate: modProgress?.applyLayerCompleted ? 100 : 0,
        status: modProgress?.applyLayerCompleted ? "COMPLETED" : "NOT_STARTED",
        sessions: applyActivities.slice(0, 2).map((a) => ({
          id: `apply-${a.id}`,
          sessionType: "PRACTICE",
          title: a.title,
          courseId: primaryCourse!.id,
          courseName: primaryCourse!.title,
          duration: 45,
          resources: [{ id: `act-${a.id}`, type: "ASSIGNMENT", title: a.title, duration: 45, url: `/dashboard/assignments` }],
          objectives: ["Apply concept to task", "Submit work"],
          status: "NOT_STARTED",
          dueDate: a.dueDate,
        })),
      },
      {
        dayOfWeek: "WED",
        date: dayDate(2),
        focusArea: "Engage Live",
        suggestedDuration: 60,
        completionRate: modProgress?.engageLiveLayerCompleted ? 100 : sessionsByDay[2]?.some((s) => s.status === "LIVE") ? 50 : 0,
        status: modProgress?.engageLiveLayerCompleted ? "COMPLETED" : sessionsByDay[2]?.length ? "PLANNED" : "NOT_STARTED",
        sessions: (sessionsByDay[2] ?? []).map(buildSession),
      },
      {
        dayOfWeek: "THU",
        date: dayDate(3),
        focusArea: "Engage Live",
        suggestedDuration: 40,
        completionRate: 0,
        status: sessionsByDay[3]?.length ? "PLANNED" : "NOT_STARTED",
        sessions: (sessionsByDay[3] ?? []).map(buildSession),
      },
      {
        dayOfWeek: "FRI",
        date: dayDate(4),
        focusArea: "Assess",
        suggestedDuration: 45,
        completionRate: 0,
        status: "NOT_STARTED",
        sessions:
          primaryModule
            ? [
                {
                  id: `fri-assess-${primaryModule.id}`,
                  sessionType: "REVIEW",
                  title: "Weekly assessment",
                  courseId: primaryCourse!.id,
                  courseName: primaryCourse!.title,
                  duration: 45,
                  resources: [{ id: `quiz-${primaryModule.id}`, type: "ASSIGNMENT", title: "Submit assessment", duration: 45, url: `/dashboard/assignments` }],
                  objectives: ["Validate understanding", "Update progress score"],
                  status: "NOT_STARTED",
                },
              ]
            : [],
      },
      {
        dayOfWeek: "SAT",
        date: dayDate(5),
        focusArea: "Reinforce",
        suggestedDuration: 35,
        completionRate: 0,
        status: "NOT_STARTED",
        sessions: (sessionsByDay[5] ?? []).length > 0
          ? (sessionsByDay[5] ?? []).map(buildSession)
          : primaryCourse
          ? [
              {
                id: `sat-reinforce-${primaryCourse.id}`,
                sessionType: "PROJECT_WORK",
                title: "Replay and peer challenge",
                courseId: primaryCourse.id,
                courseName: primaryCourse.title,
                duration: 35,
                resources: [{ id: `replay-${primaryCourse.id}`, type: "INTERACTIVE", title: "Community challenge", duration: 35, url: `/dashboard/challenges` }],
                objectives: ["Reinforce weekly learning", "Share outcomes"],
                status: "NOT_STARTED",
              },
            ]
          : [],
      },
      {
        dayOfWeek: "SUN",
        date: dayDate(6),
        focusArea: "Reflect",
        suggestedDuration: 20,
        completionRate: 0,
        status: "NOT_STARTED",
        sessions: [],
      },
    ];

    // ---------- Aggregate stats ----------
    const completedSessions = schedule.flatMap((d) => d.sessions).filter((s) => s.status === "COMPLETED").length;
    const totalSessions = schedule.flatMap((d) => d.sessions).length;

    return NextResponse.json({
      success: true,
      data: {
        rhythm: {
          studentId,
          weekStartDate: dayDate(0),
          weekEndDate: dayDate(6),
          schedule,
          enrolledCourses: enrollments.map((e) => ({
            courseId: e.courseId,
            courseName: e.course.title,
            progress: e.progress,
          })),
          upcomingLiveSessions: liveSessions.map((ls) => ({
            id: ls.id,
            title: ls.title,
            courseTitle: ls.course.title,
            startTime: ls.startTime,
            meetingUrl: ls.meetingUrl,
            joinUrl: `/dashboard/live-session/${ls.id}`,
          })),
          streakDays: 0, // TODO: derive from LessonProgress timestamps
          completedSessionsThisWeek: completedSessions,
          totalSessionsThisWeek: totalSessions,
          adaptations: [],
          insights:
            enrollments.length === 0
              ? [
                  {
                    category: "Onboarding",
                    title: "No active enrolments",
                    description: "Enrol in a course to see your personalised weekly schedule.",
                    actionable: true,
                    suggestedAction: "Browse courses",
                  },
                ]
              : [
                  {
                    category: "Progress",
                    title: `${enrollments.length} active course${enrollments.length > 1 ? "s" : ""}`,
                    description: `You are enrolled in ${enrollments.map((e) => e.course.title).join(", ")}.`,
                    actionable: false,
                  },
                ],
        },
      },
    });
  } catch (error) {
    console.error("Weekly Rhythm API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


