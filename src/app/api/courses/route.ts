import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().default("BEGINNER"),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional().default(60),
  language: z.string().optional().default("English"),
  thumbnail: z.string().url().optional(),
  instructor: z.string().optional().default("Unknown Instructor"),
  isPublished: z.boolean().optional().default(false),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

// Helper to verify authentication and get user
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

// Helper to check authorization
function isAuthorized(userRole: string) {
  return ["ADMIN", "FACILITATOR"].includes(userRole?.toUpperCase());
}
/**
 * GET /api/courses
 * Fetch all published courses with optional filtering by difficulty
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty");

    // Build filter
    const where: any = { isPublished: true };
    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty.toUpperCase();
    }

    // Fetch courses from PostgreSQL using Prisma
    const courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        difficulty: true,
        duration: true,
        instructor: true,
        createdAt: true,
        enrollments: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Fetched ${courses.length} published courses`);

    return NextResponse.json({
      success: true,
      data: {
        courses: courses.map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          difficulty: course.difficulty,
          duration: course.duration,
          instructor: course.instructor,
          enrollmentCount: course.enrollments.length,
          createdAt: course.createdAt,
        })),
        total: courses.length,
      },
    });
  } catch (error) {
    console.error("❌ Fetch courses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Create a new course (facilitator/admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify authorization
    if (!isAuthorized(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only facilitators and admins can create courses",
        },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validatedData = CreateCourseSchema.parse(body);

    // Create course in PostgreSQL using Prisma
    const course = await prisma.course.create({
      data: {
        ...validatedData,
        createdById: user.sub,
      },
    });

    console.log(`✅ Course created: ${course.id} by ${user.sub}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          duration: course.duration,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
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

    console.error("❌ Create course error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}
