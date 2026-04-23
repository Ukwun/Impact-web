import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/facilitator/classroom/[classroomId]/modules
 * Create a new module (weekly learning unit with 4 layers)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { classroomId: string } }
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
    const body = await request.json();

    // Verify classroom ownership
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: { createdById: true },
    });

    if (!classroom || classroom.createdById !== facilitatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, order, ageGroup, subjectStrand, estimatedWeeks } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the next order if not provided
    let moduleOrder = order;
    if (!moduleOrder) {
      const lastModule = await prisma.module.findFirst({
        where: { courseId: classroomId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      moduleOrder = (lastModule?.order || 0) + 1;
    }

    // Create module with learning layers
    const module = await prisma.module.create({
      data: {
        courseId: classroomId,
        title,
        description: description || "",
        order: moduleOrder,
        learningLayers: ["LEARN", "APPLY", "ENGAGE_LIVE", "SHOW_PROGRESS"],
        ageGroup: ageGroup || null,
        subjectStrand: subjectStrand || null,
        estimatedWeeks: estimatedWeeks || 1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Module created successfully",
        data: {
          id: module.id,
          title: module.title,
          description: module.description,
          order: module.order,
          learningLayers: module.learningLayers,
          estimatedWeeks: module.estimatedWeeks,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/facilitator/classroom/[classroomId]/modules
 * Get all modules for a classroom
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { classroomId: string } }
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

    // Verify classroom ownership
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: { createdById: true },
    });

    if (!classroom || classroom.createdById !== facilitatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get modules with lesson count
    const modules = await prisma.module.findMany({
      where: { courseId: classroomId },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        learningLayers: true,
        ageGroup: true,
        subjectStrand: true,
        estimatedWeeks: true,
        createdAt: true,
        lessons: {
          select: {
            id: true,
            title: true,
            learningLayer: true,
          },
        },
        activities: {
          select: {
            id: true,
            title: true,
            activityType: true,
          },
        },
        liveSessions: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: modules.map((m) => ({
          ...m,
          lessonCount: m.lessons.length,
          activityCount: m.activities.length,
          liveSessionCount: m.liveSessions.length,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
