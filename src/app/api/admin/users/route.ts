import { NextRequest, NextResponse } from "next/server";
import { listUsers, updateUserProfile, logActivity } from "@/lib/firestore-utils";
import { authenticateUser } from "@/lib/auth";
import * as admin from "firebase-admin";

/**
 * GET /api/admin/users
 * List all users with pagination and filtering (admin only)
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
        { success: false, error: "Only admin can access this endpoint" },
        { status: 403 }
      );
    }

    // Get pagination and filter parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");

    // Build filters
    const filters: any = {};
    if (role) filters.role = role;
    if (isActive !== null) filters.isActive = isActive === "true";

    // Fetch users using Firestore
    const result = await listUsers(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ List users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user (admin only) via Firebase Auth
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

    if (actorRole !== "ADMIN" || actorApprovalStatus !== "APPROVED") {
      return NextResponse.json(
        { success: false, error: "Only admin can create users" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, firstName, lastName, password, role } = body;
    const normalizedRole = String(role || "").toUpperCase();

    if (!email || !firstName || !lastName || !password || !normalizedRole) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (normalizedRole === "ADMIN") {
      const ownerApprovers = (process.env.OWNER_EMAIL_ALLOWLIST || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      const actorEmail = String(actor.email || "").toLowerCase();

      if (!ownerApprovers.includes(actorEmail)) {
        return NextResponse.json(
          { success: false, error: "Only product owner can create ADMIN accounts" },
          { status: 403 }
        );
      }
    }

    // Create user in Firebase Auth
    const auth = admin.auth();
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Create user profile in Firestore
    const userData = {
      email,
      firstName,
      lastName,
      role: normalizedRole,
    };

    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      role: normalizedRole,
      approvalStatus: "APPROVED",
      tokenInvalidBefore: new Date().toISOString(),
      isActive: true,
      verified: false,
      membershipStatus: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(actor.id, {
      type: 'user_created_admin',
      description: `Created user: ${firstName} ${lastName} (${email})`,
      targetUserId: userRecord.uid,
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: userRecord.uid,
          email,
          firstName,
          lastName,
          role: normalizedRole,
          createdAt: new Date(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Create user error:", error);
    
    // Handle Firebase specific errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
