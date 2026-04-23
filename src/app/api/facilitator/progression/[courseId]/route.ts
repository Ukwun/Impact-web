import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import {
  computeParticipationScore,
  evaluateProgression,
  PROGRESSION_THRESHOLDS,
} from "@/lib/live-classroom-framework";

const FACILITATOR_ROLES: UserRole[] = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"];
type CourseParams = { params: Promise<{ courseId: string }> };

export async function GET(request: NextRequest, { params }: CourseParams) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          quizAttempts: {
            where: { isPassed: true },
            select: { percentageScore: true },
          },
          activitySubmissions: {
            where: { isSubmitted: true },
            select: { id: true },
          },
        },
      },
      liveSessions: {
        include: {
          attendance: {
            select: {
              userId: true,
              attendanceMinutes: true,
              attended: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
  }

  if (auth.user.role === "FACILITATOR" && course.createdById !== auth.user.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const totalActivitySubmissions = Math.max(
    1,
    course.enrollments.reduce((sum, enrollment) => sum + enrollment.activitySubmissions.length, 0)
  );

  const learnerProgression = course.enrollments.map((enrollment) => {
    const quizScores = enrollment.quizAttempts.map((attempt) => attempt.percentageScore || 0);
    const assessmentAverage =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((sum, value) => sum + value, 0) / quizScores.length)
        : 0;

    const learnerAttendance = course.liveSessions.flatMap((session) =>
      session.attendance.filter((item) => item.userId === enrollment.userId)
    );

    const attendedSessions = learnerAttendance.filter((item) => item.attended).length;
    const totalAttendanceMinutes = learnerAttendance.reduce(
      (sum, item) => sum + item.attendanceMinutes,
      0
    );

    const expectedMinutes = Math.max(
      1,
      course.liveSessions.reduce(
        (sum, session) => sum + Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)),
        0
      )
    );

    const projectSubmissionRate = Math.round(
      (enrollment.activitySubmissions.length / totalActivitySubmissions) * 100
    );

    const liveParticipationScore = computeParticipationScore({
      attendanceMinutes: totalAttendanceMinutes,
      expectedMinutes,
      quizAverage: assessmentAverage,
      submissionRate: projectSubmissionRate,
    });

    const outcome = evaluateProgression({
      completionPercentage: Math.round(enrollment.progress),
      assessmentAverage,
      projectSubmissionRate,
      liveParticipationScore,
    });

    return {
      userId: enrollment.user.id,
      learnerName: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
      learnerEmail: enrollment.user.email,
      completionPercentage: Math.round(enrollment.progress),
      assessmentAverage,
      projectSubmissionRate,
      liveParticipationScore,
      attendanceStats: {
        attendedSessions,
        totalSessions: course.liveSessions.length,
      },
      ...outcome,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      course: {
        id: course.id,
        title: course.title,
      },
      thresholds: PROGRESSION_THRESHOLDS,
      learners: learnerProgression,
      summary: {
        totalLearners: learnerProgression.length,
        eligibleForProgression: learnerProgression.filter((item) => item.eligibleForProgression).length,
      },
    },
  });
}

export async function POST(request: NextRequest, { params }: CourseParams) {
  const auth = await roleMiddleware(request, FACILITATOR_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { courseId } = await params;
  const body = await request.json();

  if (!body.userId || !body.badge) {
    return NextResponse.json({ success: false, error: "userId and badge are required" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId: body.userId,
      },
    },
    include: {
      course: { select: { createdById: true } },
    },
  });

  if (!enrollment) {
    return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 });
  }

  if (auth.user.role === "FACILITATOR" && enrollment.course.createdById !== auth.user.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  await prisma.userAchievement.upsert({
    where: {
      userId_badge: {
        userId: body.userId,
        badge: body.badge,
      },
    },
    update: {
      title: body.title || body.badge,
      description: body.description || "Awarded by facilitator progression review",
      icon: body.icon || "star",
    },
    create: {
      userId: body.userId,
      badge: body.badge,
      title: body.title || body.badge,
      description: body.description || "Awarded by facilitator progression review",
      icon: body.icon || "star",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Recognition marker awarded",
  });
}
