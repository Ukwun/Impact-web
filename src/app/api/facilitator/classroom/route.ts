import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/facilitator/classroom
 * Create a new classroom (which is a Course with learning layers)
 * Only FACILITATOR role allowed
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload || payload.role !== "FACILITATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const facilitatorId = payload.sub;
    const body = await request.json();

    const { title, description, difficulty, language, ageGroup, subjectStrand, estimatedDuration } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create classroom (Course) with learning layer support
    const classroom = await prisma.course.create({
      data: {
        title,
        description: description || "",
        thumbnail: null,
        difficulty: difficulty || "BEGINNER",
        duration: estimatedDuration || 600, // Default 10 hours
        language: language || "English",
        instructor: payload.email || "Unknown",
        createdById: facilitatorId,
        isPublished: false,
        isArchived: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Classroom created successfully",
        data: {
          id: classroom.id,
          title: classroom.title,
          description: classroom.description,
          difficulty: classroom.difficulty,
          language: classroom.language,
          createdAt: classroom.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/facilitator/classroom
 * Get all classrooms created by the facilitator
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload || payload.role !== "FACILITATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const facilitatorId = payload.sub;

    // Get all classrooms created by this facilitator with enrollment stats
    const classrooms = await prisma.course.findMany({
      where: {
        createdById: facilitatorId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        thumbnail: true,
        isPublished: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        modules: {
          select: {
            id: true,
            title: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            isCompleted: true,
            progress: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to add enrollment stats
    const classroomsWithStats = classrooms.map((classroom) => ({
      ...classroom,
      enrollmentCount: classroom.enrollments.length,
      completedCount: classroom.enrollments.filter((e) => e.isCompleted).length,
      averageProgress: classroom.enrollments.length > 0
        ? Math.round(
            classroom.enrollments.reduce((sum, e) => sum + e.progress, 0) /
              classroom.enrollments.length
          )
        : 0,
    }));

    return NextResponse.json(
      {
        success: true,
        data: classroomsWithStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
