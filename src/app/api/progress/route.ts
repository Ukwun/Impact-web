import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/progress
 * Fetch user's course progress and enrollment data
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch user enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: payload.sub },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            difficulty: true,
            duration: true,
          },
        },
        lessonProgress: true,
        quizAttempts: true,
        assignmentSubmissions: true,
      },
    });

    const progressData = enrollments.map((enrollment: any) => ({
      enrollmentId: enrollment.id,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnail: enrollment.course.thumbnail,
        difficulty: enrollment.course.difficulty,
        duration: enrollment.course.duration,
      },
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
      completedAt: enrollment.completedAt,
      lessonsCompleted: enrollment.lessonProgress.filter((lp: any) => lp.isCompleted)
        .length,
      totalLessons: enrollment.lessonProgress.length,
      quizzesCompleted: enrollment.quizAttempts.filter((qa: any) => qa.isPassed)
        .length,
      assignmentsSubmitted: enrollment.assignmentSubmissions.filter(
        (as: any) => as.isSubmitted
      ).length,
      lastAccessedAt: enrollment.lastAccessedAt,
      enrolledAt: enrollment.enrolledAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        enrollments: progressData,
        total: progressData.length,
      },
    });
  } catch (error) {
    console.error("Fetch progress error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
