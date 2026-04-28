import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";

const PRIVILEGED_ROLES = new Set(["ADMIN", "FACILITATOR", "SCHOOL_ADMIN"]);

/**
 * GET /api/admin/role-requests
 * Returns pending/approved/rejected privileged role requests for admin review.
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

    const actorRole = String(authResult.user.role || "").toUpperCase();
    const actorApprovalStatus = String(authResult.user.approvalStatus || "APPROVED").toUpperCase();

    if (actorRole !== "ADMIN" || actorApprovalStatus !== "APPROVED") {
      return NextResponse.json(
        { success: false, error: "Only admin can access role requests" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "PENDING_ROLE_APPROVAL").toUpperCase();
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const db = getFirestore();
    const snapshot = await db
      .collection("users")
      .where("approvalStatus", "==", status)
      .limit(limit)
      .get();

    const requests = snapshot.docs
      .map((doc) => {
        const user = doc.data() as any;
        const requestedRole = String(user.requestedRole || "").toUpperCase();
        return {
          userId: doc.id,
          email: user.email || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          currentRole: String(user.role || "STUDENT").toUpperCase(),
          requestedRole,
          approvalStatus: String(user.approvalStatus || "PENDING_ROLE_APPROVAL").toUpperCase(),
          roleRequest: user.roleRequest || null,
          roleApprovalHistory: Array.isArray(user.roleApprovalHistory)
            ? user.roleApprovalHistory
            : [],
          verified: Boolean(user.verified),
          isActive: user.isActive !== false,
          createdAt: user.createdAt || null,
          updatedAt: user.updatedAt || null,
        };
      })
      .filter((item) => PRIVILEGED_ROLES.has(item.requestedRole));

    return NextResponse.json({
      success: true,
      data: {
        total: requests.length,
        status,
        requests,
      },
    });
  } catch (error) {
    console.error("Role request queue fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch role requests" },
      { status: 500 }
    );
  }
}
