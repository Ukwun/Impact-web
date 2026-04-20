import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
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

    // Get all assignments for courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            assignments: {
              include: {
                submissions: {
                  where: { studentId },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Flatten assignments and add course context
    const assignments = enrollments
      .flatMap((enrollment) =>
        enrollment.course.assignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          courseId: enrollment.course.id,
          courseName: enrollment.course.name,
          dueDate: assignment.dueDate,
          description: assignment.description,
          pointsTotal: assignment.pointsTotal || 0,
          createdAt: assignment.createdAt,
          submission: assignment.submissions[0]
            ? {
                submittedAt: assignment.submissions[0].submittedAt,
                grade: assignment.submissions[0].grade,
                feedback: assignment.submissions[0].feedback,
              }
            : null,
          status:
            !assignment.submissions[0]
              ? "pending"
              : assignment.submissions[0].grade !== null
              ? "graded"
              : "submitted",
        }))
      )
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    return NextResponse.json({
      success: true,
      data: assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
