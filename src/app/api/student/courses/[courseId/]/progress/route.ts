import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = payload.userId;
    const courseId = params.courseId;

    // Verify student is enrolled in course
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, courseId },
      include: {
        course: {
          include: {
            lessons: true,
            assignments: {
              include: {
                submissions: {
                  where: { studentId },
                  take: 1,
                },
              },
            },
            facilitator: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    const course = enrollment.course;

    // Calculate completion percent
    const lessonsTotal = course.lessons.length;
    const lessonsCompleted = course.lessons.filter(
      (lesson) => lesson.completedAt !== null
    ).length;
    const completionPercent = lessonsTotal > 0 
      ? Math.round((lessonsCompleted / lessonsTotal) * 100)
      : 0;

    // Calculate assignment stats
    const assignmentsTotal = course.assignments.length;
    const assignmentsSubmitted = course.assignments.filter(
      (a) => a.submissions.length > 0
    ).length;

    // Calculate average grade
    const gradesData = course.assignments
      .map((a) => a.submissions[0]?.grade)
      .filter((g) => g !== null && g !== undefined);
    const averageGrade =
      gradesData.length > 0
        ? Math.round(gradesData.reduce((a, b) => a + b, 0) / gradesData.length)
        : undefined;

    return NextResponse.json({
      success: true,
      data: {
        courseId: course.id,
        courseName: course.name,
        facilitatorName: course.facilitator?.user?.name || "Unknown",
        facilitatorEmail: course.facilitator?.user?.email,
        completionPercent,
        lessonsCompleted,
        lessonsTotal,
        assignmentsSubmitted,
        assignmentsTotal,
        averageGrade,
        status: enrollment.status,
        enrolledDate: enrollment.enrolledDate,
      },
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
