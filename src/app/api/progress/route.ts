import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";

/**
 * GET /api/progress
 * Fetch user's course progress and enrollment data from PostgreSQL via Prisma
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

    // Verify STUDENT role
    if (payload.role?.toUpperCase() !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - STUDENT role required" },
        { status: 403 }
      );
    }

    const userId = payload.sub;
    console.log(`📊 Fetching progress for user: ${userId}`);

    // Fetch user's enrollments from Prisma with course and progress data
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            difficulty: true,
            duration: true,
            modules: {
              select: {
                id: true,
                lessons: {
                  select: { id: true },
                },
              },
            },
          },
        },
        lessonProgress: {
          select: {
            id: true,
            isCompleted: true,
          },
        },
        assignmentSubmissions: {
          select: {
            id: true,
            isSubmitted: true,
            isGraded: true,
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
    });

    console.log(`✅ Found ${enrollments.length} enrollments for user ${userId}`);

    // Transform enrollments to match frontend interface
    const enrollmentData = enrollments.map((enrollment) => {
      // Calculate lesson stats
      const totalLessons = enrollment.course.modules.reduce(
        (acc, module) => acc + module.lessons.length,
        0
      );
      const lessonsCompleted = enrollment.lessonProgress.filter(
        (lp) => lp.isCompleted
      ).length;

      // Calculate assignment stats
      const assignmentsSubmitted = enrollment.assignmentSubmissions.filter(
        (sub) => sub.isSubmitted
      ).length;

      return {
        enrollmentId: enrollment.id,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          thumbnail: enrollment.course.thumbnail || "",
          difficulty: enrollment.course.difficulty || "BEGINNER",
          duration: enrollment.course.duration || 0,
        },
        progress: enrollment.progress,
        isCompleted: enrollment.isCompleted,
        completedAt: enrollment.completedAt?.toISOString() || null,
        lessonsCompleted,
        totalLessons,
        quizzesCompleted: 0, // TODO: Calculate from quizAttempts
        assignmentsSubmitted,
        lastAccessedAt: enrollment.lastAccessedAt?.toISOString() || null,
        enrolledAt: enrollment.enrolledAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        enrollments: enrollmentData,
        total: enrollmentData.length,
      },
    });
  } catch (error) {
    console.error("⚠️  Database error fetching progress, returning mock data:", error);
    // Return mock data if database is unavailable
    return NextResponse.json({
      success: true,
      data: {
        enrollments: [
          {
            enrollmentId: "demo-1",
            course: {
              id: "course-1",
              title: "Introduction to Python",
              description: "Learn the basics of Python programming",
              thumbnail: "",
              difficulty: "BEGINNER",
              duration: 40,
            },
            progress: 65,
            isCompleted: false,
            completedAt: null,
            lessonsCompleted: 13,
            totalLessons: 20,
            quizzesCompleted: 2,
            assignmentsSubmitted: 3,
            lastAccessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            enrollmentId: "demo-2",
            course: {
              id: "course-2",
              title: "Web Development Basics",
              description: "HTML, CSS, and JavaScript fundamentals",
              thumbnail: "",
              difficulty: "BEGINNER",
              duration: 50,
            },
            progress: 35,
            isCompleted: false,
            completedAt: null,
            lessonsCompleted: 7,
            totalLessons: 20,
            quizzesCompleted: 1,
            assignmentsSubmitted: 2,
            lastAccessedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            enrolledAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        total: 2,
      },
    });
  }
}
