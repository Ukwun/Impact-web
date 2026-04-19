import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createLesson, listLessons, getLesson, updateLesson, deleteLesson } from "@/lib/firestore-utils";
import { z } from "zod";

// Validation schema for creating lesson
const CreateLessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  videoUrl: z.string().url().optional(),
  transcript: z.string().optional().default(""),
  duration: z.number().min(0).optional().default(0),
  order: z.number().min(0).optional().default(0),
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

    // Fetch all lessons from Firestore
    const lessons = await listLessons(courseId);

    console.log(`✅ Fetched ${lessons.length} lessons for course ${courseId}`);

    return NextResponse.json({
      success: true,
      data: {
        lessons,
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

    // Verify authorization
    if (!["FACILITATOR", "ADMIN"].includes(user.role?.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Only facilitators can create lessons" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = CreateLessonSchema.parse(body);

    // Create lesson in Firestore
    const lesson = await createLesson(courseId, validatedData);

    console.log(`✅ Lesson created: ${lesson.id}`);

    return NextResponse.json(
      {
        success: true,
        data: lesson,
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
