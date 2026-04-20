import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/parent/children/:childId/grades
 * Get a specific child's grades (with permission check)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    // Verify parent authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parentId = payload.userId;
    const childId = params.childId;

    // ============================================================================
    // VERIFY PARENT HAS PERMISSION TO VIEW THIS CHILD'S GRADES
    // ============================================================================
    const parentChild = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId,
          childId,
        },
      },
    });

    if (!parentChild || !parentChild.isActive) {
      return NextResponse.json(
        { error: "Child not found or access denied" },
        { status: 404 }
      );
    }

    if (!parentChild.canViewGrades) {
      return NextResponse.json(
        { error: "Permission denied - cannot view grades" },
        { status: 403 }
      );
    }

    // ============================================================================
    // GET CHILD'S GRADES FROM ALL SUBMISSIONS
    // ============================================================================
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        userId: childId,
        isGraded: true,
        score: { not: null },
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { gradedAt: "desc" },
    });

    // Group grades by course
    const gradesByCourse = new Map<
      string,
      {
        courseId: string;
        courseName: string;
        grades: Array<{
          assignmentId: string;
          assignmentName: string;
          score: number;
          feedback?: string;
          gradedAt: Date;
        }>;
      }
    >();

    submissions.forEach((sub) => {
      const courseId = sub.assignment.course.id;
      if (!gradesByCourse.has(courseId)) {
        gradesByCourse.set(courseId, {
          courseId,
          courseName: sub.assignment.course.title,
          grades: [],
        });
      }
      gradesByCourse.get(courseId)!.grades.push({
        assignmentId: sub.assignment.id,
        assignmentName: sub.assignment.title,
        score: sub.score || 0,
        feedback: sub.feedback || undefined,
        gradedAt: sub.gradedAt || new Date(),
      });
    });

    const courseGrades = Array.from(gradesByCourseMa.values());

    // Calculate course averages
    const courseAverages = courseGrades.map((course) => {
      const avgScore = Math.round(
        course.grades.reduce((sum, g) => sum + g.score, 0) /
          course.grades.length
      );
      return {
        ...course,
        averageScore: avgScore,
      };
    });

    // Get child's basic info
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Calculate overall GPA
    const overallGPA =
      courseAverages.length > 0
        ? Math.round(
            courseAverages.reduce((sum, c) => sum + c.averageScore, 0) /
              courseAverages.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      child: {
        id: childId,
        name: `${child?.firstName} ${child?.lastName}`,
        email: child?.email,
      },
      courses: courseAverages,
      overallGPA,
      totalGraded: submissions.length,
      lastGradedAt: submissions.length > 0 ? submissions[0].gradedAt : null,
    });
  } catch (error) {
    console.error("Error fetching child grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}
