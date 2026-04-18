import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// Validation schemas
const CreateTierSchema = z.object({
  tierType: z.string().optional(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  canAccessLearning: z.boolean().default(true),
  canParticipateEvents: z.boolean().default(false),
  canAccessCommunity: z.boolean().default(false),
  canAccessMentorship: z.boolean().default(false),
  canCreateContent: z.boolean().default(false),
  canManageChapter: z.boolean().default(false),
  maxCoursesAccess: z.number().min(1).default(999),
  maxEventsAccess: z.number().min(1).default(999),
});

// Helper to verify admin role
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  console.log("🔑 Admin tiers endpoint - Token received:", !!token);
  if (!token) {
    console.error("❌ No token provided");
    return null;
  }
  const decoded = verifyToken(token);
  console.log("🔍 Decoded token:", decoded);
  return decoded;
}

/**
 * GET /api/admin/tiers - Get all membership tiers
 * Admin only endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    console.log("👤 User from token:", user);
    console.log("📊 User role:", user?.role);

    if (!user || (user.role !== "ADMIN" && user.role !== "Admin")) {
      console.error("❌ Unauthorized - user role:", user?.role);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const tiers = await prisma.membershipTier.findMany({
      select: {
        id: true,
        tierType: true,
        name: true,
        description: true,
        canAccessLearning: true,
        canParticipateEvents: true,
        canAccessCommunity: true,
        canAccessMentorship: true,
        canCreateContent: true,
        canManageChapter: true,
        maxCoursesAccess: true,
        maxEventsAccess: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: tiers,
        count: tiers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching tiers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch membership tiers",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tiers - Create a new membership tier
 * Admin only endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = CreateTierSchema.parse(body);

    // Check for duplicate tier name
    const existingTier = await prisma.membershipTier.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: "insensitive",
        },
      },
    });

    if (existingTier) {
      return NextResponse.json(
        { success: false, error: "Tier with this name already exists" },
        { status: 400 }
      );
    }

    // Create tier
    const tier = await prisma.membershipTier.create({
      data: validatedData as any,
      select: {
        id: true,
        tierType: true,
        name: true,
        description: true,
        canAccessLearning: true,
        canParticipateEvents: true,
        canAccessCommunity: true,
        canAccessMentorship: true,
        canCreateContent: true,
        canManageChapter: true,
        maxCoursesAccess: true,
        maxEventsAccess: true,
        createdAt: true,
      },
    });

    console.log(`✅ Tier created: ${tier.name}`);

    return NextResponse.json(
      {
        success: true,
        message: `Membership tier "${tier.name}" created successfully`,
        data: tier,
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

    console.error("❌ Error creating tier:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create membership tier",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tiers - Update a membership tier
 * Admin only endpoint
 */
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { tierId, ...updateData } = body;

    if (!tierId) {
      return NextResponse.json(
        {
          success: false,
          error: "Tier ID is required",
        },
        { status: 400 }
      );
    }

    const updatedTier = await prisma.membershipTier.update({
      where: { id: tierId },
      data: updateData,
      select: {
        id: true,
        tierType: true,
        name: true,
        description: true,
        canAccessLearning: true,
        canParticipateEvents: true,
        canAccessCommunity: true,
        canAccessMentorship: true,
        canCreateContent: true,
        canManageChapter: true,
      },
    });

    console.log(`✅ Tier updated: ${updatedTier.name}`);

    return NextResponse.json(
      {
        success: true,
        data: updatedTier,
        message: "Tier updated successfully",
      },
      { status: 200 }
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

    console.error("❌ Error updating tier:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update membership tier",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tiers/[id] - Delete a membership tier
 * Admin only endpoint
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tierId } = body;

    if (!tierId) {
      return NextResponse.json(
        {
          success: false,
          error: "Tier ID is required",
        },
        { status: 400 }
      );
    }

    // Verify tier exists
    const tier = await prisma.membershipTier.findUnique({
      where: { id: tierId },
      select: { id: true, name: true, _count: { select: { users: true } } },
    });

    if (!tier) {
      return NextResponse.json(
        { success: false, error: "Tier not found" },
        { status: 404 }
      );
    }

    // Check if tier has subscribers
    if (tier._count.users > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete tier with ${tier._count.users} active subscribers. Please reassign members first.`,
        },
        { status: 400 }
      );
    }

    // Delete tier
    await prisma.membershipTier.delete({
      where: { id: tierId },
    });

    console.log(`✅ Tier deleted: ${tier.name}`);

    return NextResponse.json(
      {
        success: true,
        message: `Membership tier "${tier.name}" deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting tier:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete membership tier",
      },
      { status: 500 }
    );
  }
}
