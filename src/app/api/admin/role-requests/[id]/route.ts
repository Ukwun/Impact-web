import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { authenticateUser } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";
import { logActivity } from "@/lib/firestore-utils";
import { prisma } from "@/lib/prisma";

const PRIVILEGED_ROLES = new Set(["ADMIN", "FACILITATOR", "SCHOOL_ADMIN"]);
const VALID_ACTIONS = new Set(["APPROVE", "REJECT"]);

/**
 * PATCH /api/admin/role-requests/:id
 * Review pending role request with explicit approve/reject action and audit metadata.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateUser(req);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const actor = authResult.user;
    const actorRole = String(actor.role || "").toUpperCase();
    const actorApprovalStatus = String(actor.approvalStatus || "APPROVED").toUpperCase();

    if (actorRole !== "ADMIN" || actorApprovalStatus !== "APPROVED") {
      return NextResponse.json(
        { success: false, error: "Only admin can review role requests" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = String(body.action || "").toUpperCase();
    const note = String(body.note || "").trim();
    const setVerified = body.setVerified !== false;
    const reviewerMetadata = {
      reviewerUserId: actor.id,
      reviewerRole: actor.role,
      reviewerEmail: actor.email,
      reviewedAt: new Date().toISOString(),
      note,
      action,
    };

    if (!VALID_ACTIONS.has(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be APPROVE or REJECT" },
        { status: 400 }
      );
    }

    const userId = params.id;
    const db = getFirestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as any;
    const requestedRole = String(userData.requestedRole || "").toUpperCase();

    if (actor.id === userId) {
      return NextResponse.json(
        { success: false, error: "You cannot review your own role request" },
        { status: 400 }
      );
    }

    if (!PRIVILEGED_ROLES.has(requestedRole)) {
      return NextResponse.json(
        { success: false, error: "No privileged role request found for this user" },
        { status: 400 }
      );
    }

    if (requestedRole === "ADMIN") {
      const ownerApprovers = (process.env.OWNER_EMAIL_ALLOWLIST || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

      if (ownerApprovers.length === 0) {
        return NextResponse.json(
          { success: false, error: "Owner approver list is not configured" },
          { status: 500 }
        );
      }

      const actorEmail = String(actor.email || "").toLowerCase();
      if (!ownerApprovers.includes(actorEmail)) {
        return NextResponse.json(
          { success: false, error: "Only product owner can approve ADMIN role requests" },
          { status: 403 }
        );
      }
    }

    if (String(userData.approvalStatus || "").toUpperCase() !== "PENDING_ROLE_APPROVAL") {
      return NextResponse.json(
        { success: false, error: "Role request is not pending review" },
        { status: 409 }
      );
    }

    const approved = action === "APPROVE";
    const assignedRole = approved ? requestedRole : String(userData.role || "STUDENT").toUpperCase();
    const approvalStatus = approved ? "APPROVED" : "REJECTED";

    const updatePayload: Record<string, unknown> = {
      role: assignedRole,
      approvalStatus,
      tokenInvalidBefore: reviewerMetadata.reviewedAt,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      roleRequest: {
        ...(userData.roleRequest || {}),
        requestedRole,
        status: approvalStatus,
        reviewedAt: reviewerMetadata.reviewedAt,
        reviewedBy: reviewerMetadata.reviewerUserId,
        reviewerRole: reviewerMetadata.reviewerRole,
        reviewNote: reviewerMetadata.note,
        reviewAction: reviewerMetadata.action,
      },
      roleApprovalHistory: admin.firestore.FieldValue.arrayUnion({
        action,
        requestedRole,
        assignedRole,
        status: approvalStatus,
        performedBy: reviewerMetadata.reviewerUserId,
        reviewerRole: reviewerMetadata.reviewerRole,
        performedAt: reviewerMetadata.reviewedAt,
        note,
      }),
    };

    if (approved && setVerified) {
      updatePayload.verified = true;
    }

    await userRef.update(updatePayload);

    // Keep PostgreSQL role/auth flags in sync with Firestore decision.
    try {
      const prismaUpdate: Record<string, unknown> = {
        role: assignedRole as any,
      };

      if (approved && setVerified) {
        prismaUpdate.verified = true;
      }

      await prisma.user.update({
        where: { id: userId },
        data: prismaUpdate,
      });
    } catch (error) {
      console.error("Failed to sync role decision to PostgreSQL:", error);
    }

    await logActivity(payload.sub, {
      type: approved ? "role_request_approved" : "role_request_rejected",
      description: `${approved ? "Approved" : "Rejected"} ${requestedRole} role request for ${userData.email || userId}`,
      targetUserId: userId,
      metadata: {
        requestedRole,
        assignedRole,
        approvalStatus,
        note,
        reviewedBy: actor.id,
      },
      timestamp: new Date(),
    });

    const updatedUserDoc = await userRef.get();

    return NextResponse.json({
      success: true,
      message: approved
        ? `Role request approved. User is now ${assignedRole}.`
        : "Role request rejected.",
      data: {
        userId,
        requestedRole,
        assignedRole,
        approvalStatus,
        reviewerMetadata,
        user: updatedUserDoc.data(),
      },
    });
  } catch (error) {
    console.error("Role request review error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to review role request" },
      { status: 500 }
    );
  }
}
