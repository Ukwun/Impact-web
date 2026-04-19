import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * GET /api/parent/children/[childId]/assignments
 * Fetch all assignments for a child across all courses
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await verifyToken(token)) as JWTPayload;
    if (!payload || payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify parent owns this child
    const parentChild = await prisma.parentChild.findFirst({
      where: {
        parentId: payload.userId,
        childId: params.childId,
      },
    });

    if (!parentChild) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get child's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: params.childId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    // Get all assignments from those courses
    const assignments = await prisma.assignment.findMany({
      where: {
        lesson: {
          courseId: {
            in: courseIds,
          },
        },
      },
      include: {
        lesson: {
          select: {
            courseId: true,
            course: {
              select: {
                name: true,
              },
            },
          },
        },
        submissions: {
          where: { studentId: params.childId },
          select: {
            id: true,
            submittedAt: true,
            grade: true,
            feedback: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const formattedAssignments = assignments.map((assignment) => {
      const submission = assignment.submissions[0];

      return {
        id: assignment.id,
        courseId: assignment.lesson.courseId,
        courseName: assignment.lesson.course.name,
        title: assignment.title,
        dueDate: assignment.dueDate.toISOString(),
        status: submission
          ? submission.grade !== null
            ? "graded"
            : "submitted"
          : "pending",
        submittedDate: submission?.submittedAt?.toISOString(),
        grade: submission?.grade,
        feedback: submission?.feedback,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedAssignments,
      count: formattedAssignments.length,
    });
  } catch (error) {
    console.error("Error fetching child assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
