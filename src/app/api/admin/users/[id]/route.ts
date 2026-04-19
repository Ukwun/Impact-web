import { NextRequest, NextResponse } from "next/server";
import { getUserWithDetails, updateUserProfile, deactivateUser, updateUserRole, logActivity } from "@/lib/firestore-utils";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin/users/[id]
 * Get user details (admin only) from Firestore
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload || payload.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = params.id;
    const targetUser = await getUserWithDetails(userId);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: targetUser,
    });
  } catch (error) {
    console.error("❌ Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload || payload.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = params.id;

    // Verify user exists
    const targetUser = await getUserWithDetails(userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, role, isActive, state } = body;

    // Prepare updates
    const updates: any = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (role) updates.role = role.toUpperCase();
    if (isActive !== undefined) updates.isActive = isActive;
    if (state) updates.state = state;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No updates provided" },
        { status: 400 }
      );
    }

    // Update user in Firestore
    const updatedUser = await updateUserProfile(userId, updates);

    // Log activity
    await logActivity(payload.sub, {
      type: 'user_updated_admin',
      description: `Updated user: ${targetUser.firstName} ${targetUser.lastName}`,
      targetUserId: userId,
      changes: Object.keys(updates),
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Deactivate user (admin only)
 * Soft delete - sets isActive = false, keeps data for records
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload || payload.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = params.id;

    // Verify user exists
    const targetUser = await getUserWithDetails(userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-deactivation
    if (payload.sub === userId) {
      return NextResponse.json(
        { success: false, error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Soft deactivate user
    const deactivatedUser = await deactivateUser(userId);

    // Log activity
    await logActivity(payload.sub, {
      type: 'user_deactivated_admin',
      description: `Deactivated user: ${targetUser.firstName} ${targetUser.lastName}`,
      targetUserId: userId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `User "${targetUser.firstName}" has been deactivated`,
      data: deactivatedUser,
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
