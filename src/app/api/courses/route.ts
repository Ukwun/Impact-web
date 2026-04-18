import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createCourse, listCourses, getCourse, updateCourse, deleteCourse } from "@/lib/firestore-utils";
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

    // Fetch courses from Firestore
    const filters: any = {};
    if (difficulty && difficulty !== "all") {
      filters.difficulty = difficulty.toUpperCase();
    }

    const courses = await listCourses(filters);

    console.log(`✅ Fetched ${courses.length} published courses`);

    return NextResponse.json({
      success: true,
      data: {
        courses: courses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          difficulty: course.difficulty,
          duration: course.duration,
          enrollmentCount: course.enrollmentCount || 0,
          ratingAverage: course.ratingAverage || 0,
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
        { success: false, error: "Only facilitators and admins can create courses" },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validatedData = CreateCourseSchema.parse(body);

    // Create course in Firestore
    const course = await createCourse({
      ...validatedData,
      createdBy: user.sub,
    });

    console.log(`✅ Course created: ${course.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
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
