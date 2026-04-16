import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional().default("BEGINNER"),
  duration: z.number().min(1).optional().default(0),
  language: z.string().optional().default("English"),
  thumbnail: z.string().url().optional(),
  isPublished: z.boolean().optional().default(false),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

// Helper to verify authentication
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

// Helper to check authorization
function isAuthorized(userRole: string) {
  return ["ADMIN", "FACILITATOR", "TEACHER"].includes(userRole);
}

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
        { success: false, error: "Only facilitators and admins can create courses" },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validatedData = CreateCourseSchema.parse(body);

    // Create course in database
    const course = await prisma.course.create({
      data: {
        ...validatedData,
        createdById: user.sub,
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          instructor: `${course.createdBy.firstName} ${course.createdBy.lastName}`,
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

    console.error("Create course error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}
