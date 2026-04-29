import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// Validation schema for updates
const UpdateTierSchema = z.object({
  tierType: z.string().optional(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  canAccessLearning: z.boolean().optional(),
  canParticipateEvents: z.boolean().optional(),
  canAccessCommunity: z.boolean().optional(),
  canAccessMentorship: z.boolean().optional(),
  canCreateContent: z.boolean().optional(),
  canManageChapter: z.boolean().optional(),
  maxCoursesAccess: z.number().min(1).optional(),
  maxEventsAccess: z.number().min(1).optional(),
  maxCourses: z.number().min(1).optional(),
  maxStudents: z.number().min(1).optional(),
});

// Helper to verify admin role
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/admin/tiers/[id]
 * Get individual tier details (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tierId = params.id;

    const tier = await prisma.membershipTier.findUnique({
      where: { id: tierId },
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
        _count: {
          select: { users: true },
        },
      },
    });

    if (!tier) {
      return NextResponse.json(
        { success: false, error: "Tier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tier,
    });
  } catch (error) {
    console.error("❌ Error fetching tier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tier" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tiers/[id]
 * Update individual tier (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tierId = params.id;

    // Verify tier exists
    const tier = await prisma.membershipTier.findUnique({
      where: { id: tierId },
      select: { id: true, name: true },
    });

    if (!tier) {
      return NextResponse.json(
        { success: false, error: "Tier not found" },
        { status: 404 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = UpdateTierSchema.parse(body);
    const normalizedData = {
      tierType: validatedData.tierType,
      name: validatedData.name,
      description: validatedData.description,
      canAccessLearning: validatedData.canAccessLearning,
      canParticipateEvents: validatedData.canParticipateEvents,
      canAccessCommunity: validatedData.canAccessCommunity,
      canAccessMentorship: validatedData.canAccessMentorship,
      canCreateContent: validatedData.canCreateContent,
      canManageChapter: validatedData.canManageChapter,
      maxCoursesAccess: validatedData.maxCoursesAccess ?? validatedData.maxCourses,
      maxEventsAccess: validatedData.maxEventsAccess ?? validatedData.maxStudents,
    };

    // If name is being updated, check for duplicates
    if (normalizedData.name && normalizedData.name !== tier.name) {
      const existingTier = await prisma.membershipTier.findFirst({
        where: {
          name: {
            equals: normalizedData.name,
            mode: "insensitive",
          },
          id: { not: tierId },
        },
      });

      if (existingTier) {
        return NextResponse.json(
          { success: false, error: "Tier with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update tier
    const updatedTier = await prisma.membershipTier.update({
      where: { id: tierId },
      data: normalizedData as any,
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
        updatedAt: true,
      },
    });

    console.log(`✅ Tier updated: ${updatedTier.name}`);

    return NextResponse.json({
      success: true,
      message: `Tier "${updatedTier.name}" updated successfully`,
      data: updatedTier,
    });
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
      { success: false, error: "Failed to update tier" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tiers/[id]
 * Delete individual tier (admin only)
 * Cannot delete if tier has active subscribers
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tierId = params.id;

    // Verify tier exists and check subscriber count
    const tier = await prisma.membershipTier.findUnique({
      where: { id: tierId },
      select: {
        id: true,
        name: true,
        _count: { select: { users: true } },
      },
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

    return NextResponse.json({
      success: true,
      message: `Tier "${tier.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("❌ Error deleting tier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete tier" },
      { status: 500 }
    );
  }
}
