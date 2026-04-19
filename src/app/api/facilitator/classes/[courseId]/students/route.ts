import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * GET /api/facilitator/classes/[courseId]/students
 * Get all students enrolled in a course/class
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await verifyToken(token)) as JWTPayload;
    if (payload.role !== "FACILITATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify facilitator owns the course
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { facilitatorId: true },
    });

    if (!course || course.facilitatorId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get all enrolled students in this course
    const students = await prisma.enrollment.findMany({
      where: { courseId: params.courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get student stats (submissions, grades)
    const studentsWithStats = await Promise.all(
      students.map(async (enrollment) => {
        const submissions = await prisma.submission.findMany({
          where: {
            studentId: enrollment.student.id,
            assignment: {
              lesson: {
                courseId: params.courseId,
              },
            },
          },
        });

        const grades = submissions.filter((s) => s.grade !== null);
        const averageGrade =
          grades.length > 0
            ? grades.reduce((sum, s) => sum + (s.grade || 0), 0) / grades.length
            : 0;

        return {
          id: enrollment.student.id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          enrollmentDate: enrollment.createdAt.toISOString(),
          lastActivity: enrollment.student.createdAt.toISOString(),
          submissionsCount: submissions.length,
          gradedCount: grades.length,
          averageGrade: Math.round(averageGrade),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: studentsWithStats,
      count: studentsWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
