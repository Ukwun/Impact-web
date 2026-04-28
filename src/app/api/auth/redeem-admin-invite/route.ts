import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { authenticateUser, generateToken } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";
import { consumeAdminInviteCode } from "@/lib/adminInviteCodes";
import { logActivity } from "@/lib/firestore-utils";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/redeem-admin-invite
 * Redeem a one-time owner-issued code to approve and activate ADMIN role.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const actor = authResult.user;
    const body = await req.json();
    const inviteCode = String(body.inviteCode || "").trim().toUpperCase();
    const note = String(body.note || "").trim();

    if (!inviteCode) {
      return NextResponse.json(
        { success: false, error: "inviteCode is required" },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const userRef = db.collection("users").doc(actor.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as any;
    const approvalStatus = String(userData.approvalStatus || "").toUpperCase();
    const requestedRole = String(userData.requestedRole || "").toUpperCase();

    if (requestedRole !== "ADMIN" || approvalStatus !== "PENDING_ROLE_APPROVAL") {
      return NextResponse.json(
        { success: false, error: "No pending ADMIN request found for this account" },
        { status: 409 }
      );
    }

    const consumeResult = await consumeAdminInviteCode({
      inviteCode,
      claimantUserId: actor.id,
      claimantEmail: actor.email,
    });

    if (!consumeResult.success) {
      return NextResponse.json(
        { success: false, error: consumeResult.reason },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    await userRef.update({
      role: "ADMIN",
      approvalStatus: "APPROVED",
      verified: true,
      tokenInvalidBefore: nowIso,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      roleRequest: {
        ...(userData.roleRequest || {}),
        requestedRole: "ADMIN",
        status: "APPROVED",
        reviewedAt: nowIso,
        reviewedBy: "OWNER_INVITE_CODE",
        reviewAction: "APPROVE",
        reviewNote: note || "Approved via owner-issued admin invite code",
      },
      roleApprovalHistory: admin.firestore.FieldValue.arrayUnion({
        action: "OWNER_INVITE_CODE_REDEEMED",
        requestedRole: "ADMIN",
        assignedRole: "ADMIN",
        status: "APPROVED",
        performedBy: actor.id,
        performedAt: nowIso,
        note: note || "Approved via owner-issued admin invite code",
      }),
    });

    try {
      await prisma.user.update({
        where: { id: actor.id },
        data: {
          role: "ADMIN",
          verified: true,
        },
      });
    } catch (error) {
      console.warn("Failed to sync redeemed admin role to PostgreSQL:", error);
    }

    await logActivity(actor.id, {
      type: "admin_invite_code_redeemed",
      description: "Redeemed owner-issued ADMIN invite code",
      metadata: {
        inviteId: consumeResult.inviteId,
        targetRole: consumeResult.targetRole,
      },
      timestamp: new Date(),
    });

    const refreshedToken = generateToken({
      sub: actor.id,
      email: actor.email,
      role: "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Admin role approved successfully",
      data: {
        role: "ADMIN",
        approvalStatus: "APPROVED",
        token: refreshedToken,
      },
    });
  } catch (error) {
    console.error("Redeem admin invite error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to redeem admin invite code" },
      { status: 500 }
    );
  }
}
