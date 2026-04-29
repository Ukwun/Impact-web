import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/facilitator/classroom/[classroomId]
 * Get detailed classroom information with all modules and lessons
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

    // Get classroom with all content
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        language: true,
        thumbnail: true,
        isPublished: true,
        isArchived: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        modules: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            learningLayers: true,
            ageGroup: true,
            subjectStrand: true,
            lessons: {
              select: {
                id: true,
                title: true,
                learningLayer: true,
                duration: true,
                order: true,
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
                status: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            progress: true,
            isCompleted: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (classroom.createdById !== facilitatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        success: true,
        data: classroom,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/facilitator/classroom/[classroomId]
 * Update classroom details
 */
export async function PUT(
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
    const resolvedDuration =
      typeof body.duration === "number"
        ? body.duration
        : typeof body.estimatedDuration === "number"
          ? body.estimatedDuration
          : undefined;

    // Verify ownership
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: { createdById: true },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    if (classroom.createdById !== facilitatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update classroom
    const updated = await prisma.course.update({
      where: { id: classroomId },
      data: {
        title: body.title,
        description: body.description,
        difficulty: body.difficulty,
        language: body.language,
        duration: resolvedDuration,
        isPublished: body.isPublished ?? false,
        thumbnail: body.thumbnail,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Classroom updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating classroom:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/facilitator/classroom/[classroomId]
 * Delete classroom (archive it)
 */
export async function DELETE(
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

    // Verify ownership
    const classroom = await prisma.course.findUnique({
      where: { id: classroomId },
      select: { createdById: true },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    if (classroom.createdById !== facilitatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Archive instead of deleting
    await prisma.course.update({
      where: { id: classroomId },
      data: { isArchived: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Classroom archived successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
