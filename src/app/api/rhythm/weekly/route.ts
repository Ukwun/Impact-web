/**
 * Weekly Rhythm API Route
 * /api/rhythm/weekly - Get student's weekly learning schedule
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId") || authResult.user.userId;
    const weekOffset = parseInt(searchParams.get("weekOffset") || "0");

    // Verify access
    if (authResult.user.role === "STUDENT" && authResult.user.id !== studentId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // TODO: Fetch from database
    // const rhythm = await prisma.weeklyRhythm.findFirst({ where: { studentId } });

    const now = new Date();
    const weekStartDate = new Date(now);
    weekStartDate.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);

    const toIsoDate = (date: Date) => date.toISOString().split("T")[0];

    const day = (offset: number) => {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + offset);
      return toIsoDate(d);
    };

    const rhythmData = {
      success: true,
      data: {
        rhythm: {
          studentId,
          currentTemplate: {
            id: "balanced-learner",
            name: "Balanced Learner",
            description: "A practical weekly blend of learn, apply, live, and review.",
            pattern: {
              pattern: {
                MON: "Learn: concept lessons and guided notes",
                TUE: "Practice: worksheet and reflection task",
                WED: "Live: facilitator-led session",
                THU: "Live: clinics and Q&A",
                FRI: "Assess: quiz and rubric-based challenge",
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
            targetAudience: ["Primary", "Junior Secondary", "Senior Secondary"],
            successRate: 86,
          },
          weekStartDate: day(0),
          weekEndDate: day(6),
          schedule: [
            {
              dayOfWeek: "MON",
              date: day(0),
              focusArea: "Learn",
              suggestedDuration: 60,
              completionRate: 100,
              status: "COMPLETED",
              sessions: [
                {
                  id: "session-mon-learn-1",
                  sessionType: "CONCEPT_STUDY",
                  title: "New lesson release and explainer walkthrough",
                  courseId: "course-impact-101",
                  courseName: "Money and Enterprise Basics",
                  duration: 30,
                  resources: [
                    { id: "res-mon-1", type: "VIDEO", title: "Core lesson video", duration: 12, url: "/dashboard/learning-journey" },
                    { id: "res-mon-2", type: "ARTICLE", title: "Guided notes", duration: 18, url: "/dashboard/resources" },
                  ],
                  objectives: ["Understand the weekly concept", "Identify key terms"],
                  status: "COMPLETED",
                },
              ],
            },
            {
              dayOfWeek: "TUE",
              date: day(1),
              focusArea: "Practice",
              suggestedDuration: 50,
              completionRate: 80,
              status: "IN_PROGRESS",
              sessions: [
                {
                  id: "session-tue-apply-1",
                  sessionType: "PRACTICE",
                  title: "Worksheet and reflection prompt",
                  courseId: "course-impact-101",
                  courseName: "Money and Enterprise Basics",
                  duration: 50,
                  resources: [
                    { id: "res-tue-1", type: "ASSIGNMENT", title: "Worksheet pack", duration: 30, url: "/dashboard/assignments" },
                    { id: "res-tue-2", type: "ARTICLE", title: "Reflection journal template", duration: 20, url: "/dashboard/resources/guides" },
                  ],
                  objectives: ["Apply concept to task", "Submit draft work"],
                  status: "IN_PROGRESS",
                },
              ],
            },
            {
              dayOfWeek: "WED",
              date: day(2),
              focusArea: "Engage Live",
              suggestedDuration: 60,
              completionRate: 0,
              status: "PLANNED",
              sessions: [
                {
                  id: "session-wed-live-1",
                  sessionType: "DISCUSSION",
                  title: "Facilitator live class and breakout discussion",
                  courseId: "course-impact-101",
                  courseName: "Money and Enterprise Basics",
                  duration: 60,
                  resources: [
                    { id: "res-wed-1", type: "DISCUSSION", title: "Live classroom", duration: 60, url: "/dashboard/my-events" },
                  ],
                  objectives: ["Ask questions", "Participate in simulation"],
                  status: "NOT_STARTED",
                },
              ],
            },
            {
              dayOfWeek: "THU",
              date: day(3),
              focusArea: "Engage Live",
              suggestedDuration: 40,
              completionRate: 0,
              status: "PLANNED",
              sessions: [
                {
                  id: "session-thu-live-1",
                  sessionType: "DISCUSSION",
                  title: "Clinic and Q&A",
                  courseId: "course-impact-101",
                  courseName: "Money and Enterprise Basics",
                  duration: 40,
                  resources: [
                    { id: "res-thu-1", type: "DISCUSSION", title: "Breakout clinic", duration: 40, url: "/dashboard/my-events" },
                  ],
                  objectives: ["Resolve blockers", "Get facilitator feedback"],
                  status: "NOT_STARTED",
                },
              ],
            },
            {
              dayOfWeek: "FRI",
              date: day(4),
              focusArea: "Assess",
              suggestedDuration: 45,
              completionRate: 0,
              status: "PLANNED",
              sessions: [
                {
                  id: "session-fri-assess-1",
                  sessionType: "REVIEW",
                  title: "Quiz and rubric challenge",
                  courseId: "course-impact-101",
                  courseName: "Money and Enterprise Basics",
                  duration: 45,
                  resources: [
                    { id: "res-fri-1", type: "ASSIGNMENT", title: "Weekly quiz", duration: 20, url: "/dashboard/progress" },
                    { id: "res-fri-2", type: "ARTICLE", title: "Journal reflection", duration: 25, url: "/dashboard/assignments" },
                  ],
                  objectives: ["Validate understanding", "Update progress score"],
                  status: "NOT_STARTED",
                },
              ],
            },
            {
              dayOfWeek: "SAT",
              date: day(5),
              focusArea: "Reinforce",
              suggestedDuration: 35,
              completionRate: 0,
              status: "PLANNED",
              sessions: [
                {
                  id: "session-sat-reinforce-1",
                  sessionType: "PROJECT_WORK",
                  title: "Peer challenge and project extension",
                  courseId: "course-impact-101",
                  courseName: "Money and Enterprise Basics",
                  duration: 35,
                  resources: [
                    { id: "res-sat-1", type: "INTERACTIVE", title: "Community challenge", duration: 35, url: "/dashboard/challenges" },
                  ],
                  objectives: ["Reinforce weekly learning", "Share outcomes"],
                  status: "NOT_STARTED",
                },
              ],
            },
            {
              dayOfWeek: "SUN",
              date: day(6),
              focusArea: "Reinforce",
              suggestedDuration: 20,
              completionRate: 0,
              status: "PLANNED",
              sessions: [],
            },
          ],
          streakDays: 12,
          completedSessionsThisWeek: 2,
          totalSessionsThisWeek: 8,
          adaptations: [],
          insights: [
            {
              category: "Performance",
              title: "Peak learning hours",
              description: "You perform best between 5:00 PM and 6:00 PM on weekdays.",
              actionable: true,
              suggestedAction: "Schedule challenging tasks during this window",
            },
            {
              category: "Progress",
              title: "Consistent completion streak",
              description: "You've completed tasks 12 days in a row. Keep it up!",
              actionable: false,
            },
          ],
        },
      },
    };

    return NextResponse.json(rhythmData);
  } catch (error) {
    console.error("Weekly Rhythm API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
