import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";

/**
 * GET /api/admin/dashboard
 * Fetch admin dashboard data - simplified version for Firebase
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated and has admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("❌ No authorization header");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      console.error("❌ Invalid token");
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    console.log("🔍 Admin request from user:", payload.sub, "role:", payload.role);

    // Verify admin role from token
    if (payload.role !== "ADMIN") {
      console.error("❌ User is not admin. Role:", payload.role);
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Fetch user count from Firestore
    const db = getFirestore();
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    console.log("✅ Admin dashboard data retrieved");

    // Return basic admin dashboard data
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers,
        activeCourses: 0,
        completionRate: 0,
        avgScore: 0,
        usersChange: "+0%",
        coursesChange: "+0%",
        completionChange: "+0%",
        scoreChange: "+0%",
        topInstitutions: [],
        states: [],
        recentEnrollments: [],
      },
    });
  } catch (error) {
    console.error("❌ Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
