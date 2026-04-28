import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { logActivity } from "@/lib/firestore-utils";
import { createAdminInviteCode, listAdminInviteCodes } from "@/lib/adminInviteCodes";

function isOwnerEmail(email?: string): boolean {
  const ownerAllowlist = (process.env.OWNER_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const actorEmail = String(email || "").trim().toLowerCase();
  return ownerAllowlist.includes(actorEmail);
}

/**
 * GET /api/admin/invite-codes
 * Owner-only list of admin invite code records (without raw codes).
 */
export async function GET(req: NextRequest) {
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
        { success: false, error: "Only product owner can view invite code records" },
        { status: 403 }
      );
    }

    const limit = Math.min(parseInt(new URL(req.url).searchParams.get("limit") || "30", 10), 100);
    const records = await listAdminInviteCodes(limit);

    return NextResponse.json({
      success: true,
      data: {
        total: records.length,
        records,
      },
    });
  } catch (error) {
    console.error("Invite code list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invite codes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/invite-codes
 * Owner-only endpoint to issue one-time ADMIN invite code.
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
    const actorRole = String(actor.role || "").toUpperCase();
    const actorApprovalStatus = String(actor.approvalStatus || "APPROVED").toUpperCase();

    if (actorRole !== "ADMIN" || actorApprovalStatus !== "APPROVED" || !isOwnerEmail(actor.email)) {
      return NextResponse.json(
        { success: false, error: "Only product owner can issue admin invite codes" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const targetEmail = String(body.targetEmail || "").trim().toLowerCase() || undefined;
    const expiresInMinutes = Number(body.expiresInMinutes || 30);
    const note = String(body.note || "").trim();

    const invite = await createAdminInviteCode({
      createdByUserId: actor.id,
      createdByEmail: actor.email,
      targetEmail,
      expiresInMinutes,
      note,
    });

    await logActivity(actor.id, {
      type: "admin_invite_code_issued",
      description: `Issued ADMIN invite code${targetEmail ? ` for ${targetEmail}` : ""}`,
      metadata: {
        inviteId: invite.inviteId,
        targetEmail: invite.targetEmail,
        expiresAt: invite.expiresAt,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "One-time admin invitation code issued",
      data: invite,
    });
  } catch (error) {
    console.error("Invite code creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invite code" },
      { status: 500 }
    );
  }
}
