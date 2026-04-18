import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/progress
 * Fetch user's course progress and enrollment data
 * NOTE: Courses and enrollments are currently not implemented in Firestore.
 * Returning empty progress for now to unblock dashboard loading.
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // TODO: Once courses and enrollments are set up in Firestore,
    // fetch actual enrollment data from Firestore collections.
    // For now, return empty progress to unblock dashboard loading.

    console.log(`📊 Fetching progress for user: ${payload.sub}`);

    return NextResponse.json({
      success: true,
      data: {
        enrollments: [],
        total: 0,
      },
    });
  } catch (error) {
    console.error("❌ Fetch progress error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
