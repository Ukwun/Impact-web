import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * GET /api/parent/children/[childId]/progress
 * Fetch child's course enrollments and progress
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

    // Get child info
    const child = await prisma.user.findUnique({
      where: { id: params.childId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Get child's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: params.childId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
            facilitatorId: true,
            createdAt: true,
          },
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Calculate progress for each course
    const courseProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const lessons = await prisma.lesson.findMany({
          where: { courseId: enrollment.courseId },
          select: { id: true },
        });

        const assignments = await prisma.assignment.findMany({
          where: {
            lesson: {
              courseId: enrollment.courseId,
            },
          },
          select: { id: true, maxPoints: true },
        });

        const submissions = await prisma.submission.findMany({
          where: {
            studentId: params.childId,
            assignment: {
              lesson: {
                courseId: enrollment.courseId,
              },
            },
          },
          select: { grade: true, submittedAt: true },
        });

        const grades = submissions.filter((s) => s.grade !== null);
        const averageGrade =
          grades.length > 0
            ? grades.reduce((sum, s) => sum + (s.grade || 0), 0) / grades.length
            : 0;

        // Calculate completion % (based on submitted assignments)
        const completionPercent =
          assignments.length > 0
            ? Math.round((submissions.length / assignments.length) * 100)
            : 0;

        // Count due assignments
        const dueAssignments = assignments.filter((a) => {
          // Check if submitted
          const submitted = submissions.find((s) => s.submittedAt && true);
          return !submitted;
        }).length;

        return {
          childId: params.childId,
          childName: `${child?.firstName} ${child?.lastName}`,
          courseId: enrollment.courseId,
          courseName: enrollment.course.name,
          description: enrollment.course.description,
          facilitatorName: `${enrollment.course.createdBy?.firstName} ${enrollment.course.createdBy?.lastName}`,
          facilitatorEmail: enrollment.course.createdBy?.email,
          completionPercent,
          gradesCount: grades.length,
          averageGrade: Math.round(averageGrade),
          status: completionPercent === 100 ? "completed" : completionPercent > 0 ? "active" : "pending",
          enrolledDate: enrollment.createdAt.toISOString(),
          dueAssignments,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        child: {
          id: params.childId,
          name: `${child?.firstName} ${child?.lastName}`,
          email: child?.email,
        },
        courses: courseProgress,
      },
    });
  } catch (error) {
    console.error("Error fetching child progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch child progress" },
      { status: 500 }
    );
  }
}
