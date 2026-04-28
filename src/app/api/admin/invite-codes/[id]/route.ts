import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { authenticateUser } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";
import { logActivity } from "@/lib/firestore-utils";

const INVITE_COLLECTION = "admin_invite_codes";

function isOwnerEmail(email?: string): boolean {
  const ownerAllowlist = (process.env.OWNER_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const actorEmail = String(email || "").trim().toLowerCase();
  return ownerAllowlist.includes(actorEmail);
}

/**
 * PATCH /api/admin/invite-codes/:id
 * Owner-only action endpoint for invite code lifecycle operations.
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

    if (actorRole !== "ADMIN" || actorApprovalStatus !== "APPROVED" || !isOwnerEmail(actor.email)) {
      return NextResponse.json(
        { success: false, error: "Only product owner can manage admin invite codes" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = String(body.action || "").toUpperCase();

    if (action !== "REVOKE") {
      return NextResponse.json(
        { success: false, error: "Unsupported action" },
        { status: 400 }
      );
    }

    const inviteId = params.id;
    const db = getFirestore();
    const inviteRef = db.collection(INVITE_COLLECTION).doc(inviteId);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Invite code record not found" },
        { status: 404 }
      );
    }

    const inviteData = inviteDoc.data() as any;
    const currentStatus = String(inviteData.status || "").toUpperCase();

    if (currentStatus !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: `Cannot revoke invite in ${currentStatus} state` },
        { status: 409 }
      );
    }

    await inviteRef.update({
      status: "REVOKED",
      revokedAt: new Date().toISOString(),
      revokedByUserId: actor.id,
      revokedByEmail: actor.email,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logActivity(actor.id, {
      type: "admin_invite_code_revoked",
      description: `Revoked ADMIN invite code ${inviteId}`,
      metadata: {
        inviteId,
        targetEmail: inviteData.targetEmail || null,
      },
      timestamp: new Date(),
    });

    const updatedDoc = await inviteRef.get();

    return NextResponse.json({
      success: true,
      message: "Invite code revoked successfully",
      data: {
        id: updatedDoc.id,
        ...(updatedDoc.data() || {}),
      },
    });
  } catch (error) {
    console.error("Invite code action error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update invite code" },
      { status: 500 }
    );
  }
}
