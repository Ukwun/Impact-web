import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// Validation schemas
const UpdateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["STUDENT", "FACILITATOR", "MENTOR", "PARENT", "SCHOOL_ADMIN", "UNI_MEMBER", "CIRCLE_MEMBER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  state: z.string().optional(),
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["STUDENT", "FACILITATOR", "MENTOR", "PARENT", "SCHOOL_ADMIN", "UNI_MEMBER", "CIRCLE_MEMBER", "ADMIN"]),
});

// Helper to verify admin role
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/admin/users
 * List all users with pagination and filtering (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    // Verify authentication and admin role
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admin can access this endpoint" },
        { status: 403 }
      );
    }

    // Get pagination and filter parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (role) where.role = role;
    if (isActive !== null) where.isActive = isActive === "true";
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Get total count
    const total = await prisma.user.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          isActive: u.isActive,
          enrollmentCount: u._count.enrollments,
          createdAt: u.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    // Verify authentication and admin role
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admin can create users" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = CreateUserSchema.parse(body);

    // Check email doesn't already exist
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash password
    const bcryptjs = require("bcryptjs");
    const passwordHash = await bcryptjs.hash(validatedData.password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        passwordHash,
        role: validatedData.role,
        state: "Lagos", // Default state
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newUser,
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

    console.error("Create user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
