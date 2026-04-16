import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken, verifyToken } from "@/lib/auth";
import { z } from "zod";

// Validation schema for creating lesson
const CreateLessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().optional().default(""),
  videoUrl: z.string().url().optional(),
  videoThumbnail: z.string().url().optional(),
  duration: z.number().min(0).optional().default(0),
  order: z.number().min(0).optional().default(0),
  moduleId: z.string().optional(),
});

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/courses/[id]/lessons
 * Get all lessons for a course with user's progress
 * 
 * Response:
 * - 200: { success: true, lessons: [...] }
 * - 404: Course not found or not enrolled
 * - 401: Not authenticated
 * - 500: Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Verify user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId: courseId,
          userId: user.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Get all lessons with user's progress
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: {
        progress: {
          where: {
            enrollmentId: enrollment.id,
          },
          select: {
            isCompleted: true,
            completedAt: true,
            secondsWatched: true,
          },
        },
        materials: {
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            fileSize: true,
          },
        },
        _count: {
          select: {
            notes: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const transformedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      videoThumbnail: lesson.videoThumbnail,
      duration: lesson.duration,
      order: lesson.order,
      moduleId: lesson.moduleId,
      materials: lesson.materials,
      progress: lesson.progress && lesson.progress.length > 0 ? lesson.progress[0] : null,
      notesCount: lesson._count.notes,
    }));

    return NextResponse.json({
      success: true,
      courseId,
      enrollmentId: enrollment.id,
      lessons: transformedLessons,
    });
  } catch (error) {
    console.error("Get lessons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/lessons
 * Create a new lesson in course (creator or admin only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const user = getAuthUser(req);

    // Verify authentication
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get course and verify creator/admin
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { createdById: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Verify authorization
    if (
      course.createdById !== user.sub &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to add lessons to this course" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = CreateLessonSchema.parse(body);

    // Get the next order number
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastLesson?.order ?? -1) + 1;

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        ...validatedData,
        order: validatedData.order > 0 ? validatedData.order : nextOrder,
        courseId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          createdAt: lesson.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Create lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
