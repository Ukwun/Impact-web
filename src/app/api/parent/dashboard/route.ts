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
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parentId = payload.userId;

    // ============================================================================
    // GET THIS PARENT'S LINKED CHILDREN (real data from ParentChild model)
    // ============================================================================
    const parentChildLinks = await prisma.parentChild.findMany({
      where: {
        parentId: parentId,
        isActive: true,
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Get detailed progress and grades for each child
    const children = await Promise.all(
      parentChildLinks.map(async (link) => {
        // Get enrollments
        const enrollments = await prisma.enrollment.findMany({
          where: { userId: link.child.id },
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });

        // Get assignment submissions for grades
        const submissions = await prisma.assignmentSubmission.findMany({
          where: { userId: link.child.id, isGraded: true },
          select: { score: true },
        });

        const completedCourses = enrollments.filter((e) => e.isCompleted).length;
        const averageGrade =
          submissions.length > 0
            ? Math.round(
                submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                  submissions.length
              )
            : 0;

        // Calculate overall completion rate
        const completionRate =
          enrollments.length > 0
            ? Math.round(
                (completedCourses / enrollments.length) * 100
              )
            : 0;

        return {
          id: link.child.id,
          name: `${link.child.firstName} ${link.child.lastName}`,
          email: link.child.email,
          avatar: link.child.avatar,
          enrolledCourses: enrollments.length,
          averageGrade,
          completionRate,
          relationship: link.relationship,
          canViewProgress: link.canViewProgress,
          canViewGrades: link.canViewGrades,
        };
      })
    );

    // ============================================================================
    // GET PERFORMANCE ALERTS FOR THIS PARENT'S CHILDREN
    // ============================================================================
    const alerts = await Promise.all(
      parentChildLinks.map(async (link) => {
        if (!link.canReceiveAlerts) {
          return null;
        }

        const submissions = await prisma.assignmentSubmission.findMany({
          where: { userId: link.child.id, isGraded: true },
          orderBy: { gradedAt: "desc" },
          take: 5,
          select: { score: true, feedback: true, assignment: { select: { title: true } } },
        });

        // Identify low scores
        const lowScores = submissions.filter((s) => (s.score || 0) < 70);
        if (lowScores.length > 0) {
          return {
            childId: link.child.id,
            childName: `${link.child.firstName} ${link.child.lastName}`,
            message: `${link.child.firstName} needs support with ${lowScores[0].assignment.title} (Score: ${lowScores[0].score}%)`,
            type: "warning",
            severity: "high",
          };
        }

        // Identify excellent work
        const highScores = submissions.filter((s) => (s.score || 0) >= 90);
        if (highScores.length > 0) {
          return {
            childId: link.child.id,
            childName: `${link.child.firstName} ${link.child.lastName}`,
            message: `Excellent work on ${highScores[0].assignment.title}! (Score: ${highScores[0].score}%)`,
            type: "success",
            severity: "low",
          };
        }

        return null;
      })
    );

    // Filter out null alerts and return
    const filteredAlerts = alerts.filter((a) => a !== null);

    return NextResponse.json({
      success: true,
      data: {
        children,
        alerts: filteredAlerts,
        totalChildren: children.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in parent dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
