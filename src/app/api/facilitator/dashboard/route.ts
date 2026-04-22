import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload || payload.role !== "FACILITATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const facilitatorId = payload.sub;

    // ============================================================================
    // GET ALL COURSES TAUGHT BY THIS FACILITATOR
    // ============================================================================
    const courses = await prisma.course.findMany({
      where: { createdById: facilitatorId },
      include: {
        enrollments: {
          select: { userId: true },
        },
        assignments: {
          include: {
            submissions: {
              select: { score: true, isGraded: true },
            },
          },
        },
      },
    });

    // ============================================================================
    // PROCESS COURSE DATA
    // ============================================================================
    const coursesTaught = courses.map((course) => {
      const enrolledStudents = course.enrollments.length;

      // Count submissions and calculate average grade
      const allSubmissions = course.assignments.flatMap((a) => a.submissions);
      const gradedSubmissions = allSubmissions.filter((s) => s.isGraded && s.score !== null);
      const pendingSubmissions = allSubmissions.filter((s) => !s.isGraded).length;

      const averageGrade =
        gradedSubmissions.length > 0
          ? Math.round(
              gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                gradedSubmissions.length
            )
          : 0;

      return {
        id: course.id,
        title: course.title,
        enrolledStudents,
        pendingSubmissions,
        averageGrade,
      };
    });

    // ============================================================================
    // GET PENDING SUBMISSIONS TO GRADE
    // ============================================================================
    const pendingSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        isGraded: false,
        isSubmitted: true,
        assignment: {
          course: {
            createdById: facilitatorId,
          },
        },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
        assignment: {
          select: {
            title: true,
            course: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    });

    const formattedPendingSubmissions = pendingSubmissions.map((sub) => ({
      id: sub.id,
      studentName: `${sub.user.firstName} ${sub.user.lastName}`,
      courseTitle: sub.assignment.course.title,
      assignmentTitle: sub.assignment.title,
      submittedAt: sub.submittedAt?.toISOString() || new Date().toISOString(),
    }));

    // ============================================================================
    // CALCULATE OVERALL METRICS
    // ============================================================================
    const totalStudents = new Set(
      courses.flatMap((c) => c.enrollments.map((e) => e.userId))
    ).size;

    const allGradedSubmissions = courses
      .flatMap((c) => c.assignments)
      .flatMap((a) => a.submissions)
      .filter((s) => s.isGraded && s.score !== null);

    const averageClassGrade =
      allGradedSubmissions.length > 0
        ? Math.round(
            allGradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
              allGradedSubmissions.length
          )
        : 0;

    // Calculate completion rate (completed enrollments / total enrollments)
    const completedEnrollments = await prisma.enrollment.count({
      where: {
        course: { createdById: facilitatorId },
        isCompleted: true,
      },
    });

    const totalEnrollments = await prisma.enrollment.count({
      where: {
        course: { createdById: facilitatorId },
      },
    });

    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    // ============================================================================
    // RETURN DATA
    // ============================================================================
    return NextResponse.json({
      success: true,
      data: {
        coursesTaught,
        pendingSubmissions: formattedPendingSubmissions,
        totalStudents,
        averageClassGrade,
        completionRate,
      },
    });
  } catch (error) {
    console.error("Error in facilitator dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
