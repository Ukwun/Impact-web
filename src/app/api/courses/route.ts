import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/courses
 * Fetch all published courses with pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const difficulty = searchParams.get("difficulty");
    const skip = (page - 1) * limit;

    // Build filter query
    const where: any = {
      isPublished: true,
      isArchived: false,
    };

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty.toUpperCase();
    }

    // Fetch courses
    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            modules: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Get total count
    const total = await prisma.course.count({ where });

    // Transform data
    const coursesResponse = courses.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      difficulty: course.difficulty,
      duration: course.duration,
      language: course.language,
      instructor: `${course.createdBy.firstName} ${course.createdBy.lastName}`,
      lessonCount: course._count.lessons,
      moduleCount: course._count.modules,
      enrollmentCount: course._count.enrollments,
      createdAt: course.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        courses: coursesResponse,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Fetch courses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
