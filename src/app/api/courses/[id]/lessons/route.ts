import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating lesson
const CreateLessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters").optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  videoThumbnail: z.string().url().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional(),
  estimatedHours: z.number().min(1).optional(),
  order: z.number().min(1, "Order must be at least 1").optional(),
  moduleId: z.string().optional(),
  learningLayer: z.string().optional(),
  instructions: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
  facilitatorNotes: z.string().optional(),
});

const UpdateLessonSchema = CreateLessonSchema.partial();

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/courses/[id]/lessons
 * Get all lessons for a course
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Fetch all lessons from PostgreSQL
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: {
        materials: true,
      },
      orderBy: { order: "asc" },
    });

    console.log(`✅ Fetched ${lessons.length} lessons for course ${courseId}`);

    return NextResponse.json({
      success: true,
      data: {
        lessons: lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          duration: lesson.duration,
          videoUrl: lesson.videoUrl,
          videoThumbnail: lesson.videoThumbnail,
          order: lesson.order,
          moduleId: lesson.moduleId,
          materialsCount: lesson.materials.length,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
        })),
        total: lessons.length,
      },
    });
  } catch (error) {
    console.error("❌ Get lessons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/lessons
 * Create a new lesson (facilitator/admin only)
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

    // Verify course exists and user has permission
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

    // Check authorization
    const isAuthorized = ["FACILITATOR", "ADMIN"].includes(user.role?.toUpperCase());
    const isCreator = course.createdById === user.sub;

    if (!isAuthorized || (!["ADMIN"].includes(user.role?.toUpperCase()) && !isCreator)) {
      return NextResponse.json(
        { success: false, error: "You can only add lessons to your own courses" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = CreateLessonSchema.parse(body);

    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const createData = {
      title: validatedData.title,
      description: validatedData.description || "Lesson content",
      content: validatedData.content,
      videoUrl: validatedData.videoUrl,
      videoThumbnail: validatedData.videoThumbnail,
      duration:
        typeof validatedData.estimatedHours === "number"
          ? validatedData.estimatedHours * 60
          : validatedData.duration || 15,
      order: validatedData.order || (lastLesson?.order || 0) + 1,
      moduleId: validatedData.moduleId,
      learningLayer: validatedData.learningLayer,
      instructions: validatedData.instructions,
      learningObjectives: validatedData.learningObjectives,
      facilitatorNotes: validatedData.facilitatorNotes,
    };

    // Create lesson in PostgreSQL
    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        ...createData,
      },
    });

    console.log(`✅ Lesson created: ${lesson.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
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

    console.error("❌ Create lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
