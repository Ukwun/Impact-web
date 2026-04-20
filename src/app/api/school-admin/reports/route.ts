import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = payload.schoolId;
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "enrollment";

    // Get all courses for school
    const courses = await prisma.course.findMany({
      where: { schoolId },
      include: {
        enrollments: true,
        assignments: {
          include: {
            submissions: {
              where: {
                grade: { not: null },
              },
            },
          },
        },
      },
    });

    // Build report data
    const courseStats = courses.map((course) => {
      const totalEnrolled = course.enrollments.length;
      const completed = course.enrollments.filter(
        (e) => e.status === "completed"
      ).length;
      const completionPercent =
        totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0;

      // Calculate average grade
      const grades = course.assignments
        .flatMap((a) => a.submissions.map((s) => s.grade))
        .filter((g) => g !== null);
      const avgGrade =
        grades.length > 0
          ? Math.round(grades.reduce((a, b) => a + (b || 0), 0) / grades.length)
          : undefined;

      return {
        courseId: course.id,
        courseName: course.name,
        totalEnrolled,
        completed,
        completionPercent,
        avgGrade: reportType === "completion" ? avgGrade : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        reportType,
        generatedAt: new Date(),
        courses: courseStats,
        summary: {
          totalCourses: courseStats.length,
          totalEnrolled: courseStats.reduce((sum, c) => sum + c.totalEnrolled, 0),
          totalCompleted: courseStats.reduce((sum, c) => sum + c.completed, 0),
          avgCompletionPercent:
            courseStats.length > 0
              ? Math.round(
                  courseStats.reduce((sum, c) => sum + c.completionPercent, 0) /
                    courseStats.length
                )
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
