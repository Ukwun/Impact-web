import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/facilitator/classroom/[classroomId]/activities
 * Create an activity (worksheet, task, reflection, challenge) for the APPLY layer
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

    const {
      moduleId,
      lessonId,
      title,
      description,
      instructions,
      activityType,
      dueDate,
      maxPoints,
      rubric,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        courseId: classroomId,
        moduleId: moduleId || null,
        lessonId: lessonId || null,
        title,
        description: description || "",
        instructions: instructions || "",
        activityType: activityType || "TASK",
        dueDate: dueDate ? new Date(dueDate) : null,
        maxPoints: maxPoints || 100,
        rubric: rubric ? JSON.stringify(rubric) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Activity created successfully",
        data: {
          id: activity.id,
          title: activity.title,
          activityType: activity.activityType,
          maxPoints: activity.maxPoints,
          dueDate: activity.dueDate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/facilitator/classroom/[classroomId]/activities
 * Get all activities for a classroom
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

    // Get activities with submission stats
    const activities = await prisma.activity.findMany({
      where: { courseId: classroomId },
      select: {
        id: true,
        title: true,
        description: true,
        activityType: true,
        dueDate: true,
        maxPoints: true,
        createdAt: true,
        submissions: {
          select: {
            id: true,
            isSubmitted: true,
            score: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add submission stats
    const activitiesWithStats = activities.map((activity) => ({
      ...activity,
      totalSubmissions: activity.submissions.filter((s) => s.isSubmitted).length,
      gradedSubmissions: activity.submissions.filter((s) => s.score !== null)
        .length,
      dueStatus:
        activity.dueDate && new Date(activity.dueDate) < new Date()
          ? "OVERDUE"
          : "ACTIVE",
    }));

    return NextResponse.json(
      {
        success: true,
        data: activitiesWithStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
