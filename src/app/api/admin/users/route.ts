import { NextRequest, NextResponse } from "next/server";
import { listUsers, updateUserProfile, logActivity } from "@/lib/firestore-utils";
import { verifyToken } from "@/lib/auth";
import * as admin from "firebase-admin";

/**
 * GET /api/admin/users
 * List all users with pagination and filtering (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (payload.role?.toUpperCase() !== "ADMIN") {
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
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (payload.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admin can create users" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, firstName, lastName, password, role } = body;

    if (!email || !firstName || !lastName || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
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
      role: role.toUpperCase(),
    };

    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      role: role.toUpperCase(),
      isActive: true,
      verified: false,
      membershipStatus: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await logActivity(payload.sub, {
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
          role: role.toUpperCase(),
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
