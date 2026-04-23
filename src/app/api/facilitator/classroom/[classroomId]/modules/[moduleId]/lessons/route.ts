import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/facilitator/classroom/[classroomId]/modules/[moduleId]/lessons
 * Create a lesson for a specific learning layer (LEARN, APPLY, etc)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { classroomId: string; moduleId: string } }
) {
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
    const classroomId = params.classroomId;
    const moduleId = params.moduleId;
    const body = await request.json();

    // Verify classroom ownership
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: { createdById: true },
    });

    if (!classroom || classroom.createdById !== facilitatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify module belongs to classroom
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true },
    });

    if (!module || module.courseId !== classroomId) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    const {
      title,
      description,
      content,
      learningLayer,
      videoUrl,
      duration,
      instructions,
      learningObjectives,
      facilitatorNotes,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the next lesson order
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const lessonOrder = (lastLesson?.order || 0) + 1;

    // Create lesson with learning layer metadata
    const lesson = await prisma.lesson.create({
      data: {
        courseId: classroomId,
        moduleId,
        title,
        description: description || "",
        content: content || "",
        videoUrl: videoUrl || null,
        videoThumbnail: null,
        duration: duration || 30,
        order: lessonOrder,
        learningLayer: learningLayer || "LEARN",
        instructions: instructions || null,
        learningObjectives: learningObjectives || [],
        facilitatorNotes: facilitatorNotes || null,
        prerequisites: [],
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${learningLayer || "LEARN"} layer lesson created successfully`,
        data: {
          id: lesson.id,
          title: lesson.title,
          learningLayer: lesson.learningLayer,
          duration: lesson.duration,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/facilitator/classroom/[classroomId]/modules/[moduleId]/lessons
 * Get all lessons for a module, grouped by learning layer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { classroomId: string; moduleId: string } }
) {
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
    const classroomId = params.classroomId;
    const moduleId = params.moduleId;

    // Verify classroom ownership
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: { createdById: true },
    });

    if (!classroom || classroom.createdById !== facilitatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all lessons for the module
    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      select: {
        id: true,
        title: true,
        description: true,
        learningLayer: true,
        duration: true,
        videoUrl: true,
        order: true,
        learningObjectives: true,
        content: true,
      },
      orderBy: { order: "asc" },
    });

    // Group by learning layer
    const groupedByLayer = {
      LEARN: [] as typeof lessons,
      APPLY: [] as typeof lessons,
      ENGAGE_LIVE: [] as typeof lessons,
      SHOW_PROGRESS: [] as typeof lessons,
    };

    lessons.forEach((lesson) => {
      const layer = lesson.learningLayer as keyof typeof groupedByLayer;
      if (groupedByLayer[layer]) {
        groupedByLayer[layer].push(lesson);
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          total: lessons.length,
          byLayer: groupedByLayer,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
