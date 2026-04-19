import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/university/programs
 * Get university programs with enrollment status
 * Requires authentication
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const filter = req.nextUrl.searchParams.get("filter") || "all";

    // Get all published courses (treating them as programs)
    const allCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        instructor: true,
        enrollments: {
          where: {
            userId: user.sub,
          },
          select: {
            progress: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format programs
    const programs = allCourses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      difficulty: (course.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")?.toLowerCase() || "beginner" as "beginner" | "intermediate" | "advanced",
      duration: Math.ceil(course.duration / 60 / 4), // Convert minutes to weeks (4 hours per week)
      enrolled: course.enrollments.length > 0,
      progress: course.enrollments.length > 0 ? course.enrollments[0].progress : undefined,
      students: course._count.enrollments,
      rating: 4.5 + Math.random() * 0.5, // Mock rating
      modules: course._count.lessons,
    }));

    // Apply filter
    let filtered = programs;
    if (filter === "enrolled") {
      filtered = programs.filter((p) => p.enrolled);
    } else if (filter === "available") {
      filtered = programs.filter((p) => !p.enrolled);
    }

    // Calculate statistics
    const completedPrograms = filtered.filter(
      (p) => p.enrolled && p.progress === 100
    ).length;
    const totalProgress =
      filtered.length > 0
        ? Math.round(
            filtered.reduce((sum, p) => sum + (p.progress || 0), 0) /
              filtered.filter((p) => p.enrolled).length || 0
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        programs: filtered,
        completedPrograms,
        totalProgress,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching university programs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}
