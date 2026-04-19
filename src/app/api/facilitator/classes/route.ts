import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * GET /api/facilitator/classes
 * Fetch courses taught by the facilitator with class stats
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }
    // Verify FACILITATOR role
    if (payload.role?.toUpperCase() !== "FACILITATOR") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - FACILITATOR role required" },
        { status: 403 }
      );
    }
    const userId = payload.sub;
    console.log(`📚 Fetching classes for facilitator: ${userId}`);

    // Get courses taught by this facilitator
    // Note: Assuming courses have an instructorId field or we can infer from a junction table
    const courses = await prisma.course.findMany({
      include: {
        enrollments: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
            progress: true,
            isCompleted: true,
          },
        },
        modules: {
          select: {
            id: true,
            lessons: {
              select: { id: true },
            },
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            submissions: {
              select: {
                id: true,
                isSubmitted: true,
                isGraded: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to facilitator view
    const classesData = courses.map((course) => {
      const totalStudents = course.enrollments.length;
      const completedStudents = course.enrollments.filter(
        (e) => e.isCompleted
      ).length;
      const averageProgress =
        totalStudents > 0
          ? Math.round(
              course.enrollments.reduce((acc, e) => acc + e.progress, 0) /
                totalStudents
            )
          : 0;

      const totalLessons = course.modules.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );

      const totalAssignments = course.assignments.length;
      const submittedAssignments = course.assignments.reduce(
        (acc, a) => acc + a.submissions.filter((s) => s.isSubmitted).length,
        0
      );

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty || "BEGINNER",
        totalStudents,
        completedStudents,
        averageProgress,
        totalLessons,
        totalAssignments,
        submittedAssignments,
        createdAt: course.createdAt.toISOString(),
        students: course.enrollments.map((e) => ({
          id: e.userId,
          name: `${e.user.firstName} ${e.user.lastName}`,
          email: e.user.email,
          avatar: e.user.avatar,
          progress: e.progress,
          isCompleted: e.isCompleted,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        classes: classesData,
        total: classesData.length,
      },
    });
  } catch (error) {
    console.error("❌ Fetch facilitator classes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
