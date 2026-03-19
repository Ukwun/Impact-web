import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/tiers/[tierId]/users - Get all users in a specific tier
 * Admin only endpoint
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { tierId: string } }
) {
  try {
    // TODO: Add admin role verification middleware
    
    const { tierId } = params;

    const users = await prisma.user.findMany({
      where: {
        membershipTierId: tierId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        membershipStatus: true,
        membershipJoinedAt: true,
        institution: true,
        state: true,
        createdAt: true,
      },
      orderBy: {
        membershipJoinedAt: "desc",
      },
      take: 100, // Limit to 100 for now
    });

    const tierInfo = await prisma.membershipTier.findUnique({
      where: { id: tierId },
      select: {
        name: true,
        description: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        tier: tierInfo,
        users,
        count: users.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching tier users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tier users",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tiers/[tierId]/users - Bulk update users' tier
 * Admin only endpoint
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { tierId: string } }
) {
  try {
    // TODO: Add admin role verification middleware
    
    const { tierId } = params;
    const body = await req.json();
    const { userIds, action } = body; // action: 'add', 'remove', 'move'

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        {
          success: false,
          error: "User IDs array is required",
        },
        { status: 400 }
      );
    }

    let result;

    if (action === "add") {
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: {
          membershipTierId: tierId,
          membershipStatus: "ACTIVE",
          membershipJoinedAt: new Date(),
        },
      });
      console.log(`✅ Added ${result.count} users to tier ${tierId}`);
    } else if (action === "remove") {
      result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: {
          membershipTierId: null,
          membershipStatus: "INACTIVE",
        },
      });
      console.log(`✅ Removed ${result.count} users from tier ${tierId}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: `${action} operation completed`,
        updatedCount: result?.count || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error managing tier users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to manage tier users",
      },
      { status: 500 }
    );
  }
}
