import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/tiers - Get all membership tiers
 * Admin only endpoint
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin role verification middleware
    
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
 * PUT /api/admin/tiers - Update a membership tier
 * Admin only endpoint
 */
export async function PUT(req: NextRequest) {
  try {
    // TODO: Add admin role verification middleware
    
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
