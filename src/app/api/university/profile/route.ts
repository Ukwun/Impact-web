import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * GET /api/university/profile
 * Fetch university member profile, programs, and learning stats
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

    const userId = payload.sub;
    console.log(`🎓 Fetching university profile for member: ${userId}`);

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        institution: true,
        enrollments: {
          select: {
            id: true,
            courseId: true,
            progress: true,
            isCompleted: true,
            course: {
              select: {
                id: true,
                title: true,
                difficulty: true,
              },
            },
          },
        },
        achievements: {
          select: {
            id: true,
            badge: true,
            title: true,
            unlockedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get all university programs/courses
    const programs = await prisma.course.findMany({
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      take: 20,
    });

    // Calculate stats
    const enrolledPrograms = user.enrollments.length;
    const completedPrograms = user.enrollments.filter((e) => e.isCompleted).length;
    const averageProgress =
      user.enrollments.length > 0
        ? Math.round(
            user.enrollments.reduce((acc, e) => acc + e.progress, 0) /
              user.enrollments.length
          )
        : 0;

    const achievements = user.achievements;
    const certificatesEarned = achievements.filter((a) =>
      a.badge?.includes("CERTIFICATE")
    ).length;

    // Calculate learning time estimate (based on course difficulty and progress)
    const totalLearningHours = user.enrollments.reduce((acc, e) => {
      const difficultyMultiplier =
        e.course.difficulty === "ADVANCED"
          ? 3
          : e.course.difficulty === "INTERMEDIATE"
            ? 2
            : 1;
      return acc + difficultyMultiplier * 10;
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatar: user.avatar,
          institution: user.institution || "Not specified",
        },
        stats: {
          enrolledPrograms,
          completedPrograms,
          averageProgress,
          totalAchievements: achievements.length,
          certificatesEarned,
          totalLearningHours,
        },
        enrolledPrograms: user.enrollments.map((e) => ({
          id: e.courseId,
          title: e.course.title,
          difficulty: e.course.difficulty,
          progress: e.progress,
          isCompleted: e.isCompleted,
        })),
        availablePrograms: programs.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          enrollmentCount: p._count.enrollments,
        })),
        recentAchievements: achievements.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("❌ Fetch university profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch university profile" },
      { status: 500 }
    );
  }
}
