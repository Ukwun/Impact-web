import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserProfile } from "@/lib/firestore-utils";

/**
 * GET /api/user/profile
 * Fetch current user's fresh profile from Firestore (including latest role)
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = payload.sub;
    console.log(`📋 Fetching profile for user: ${userId}`);

    // Get fresh user profile from Firestore
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
      console.error(`❌ User profile not found: ${userId}`);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Profile loaded for ${userProfile.firstName} ${userProfile.lastName}, Role: ${userProfile.role}`);

    return NextResponse.json({
      success: true,
      data: {
        id: userProfile.id,
        uid: userProfile.uid || userId,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        role: userProfile.role || "STUDENT",
        verified: userProfile.verified || false,
        avatar: userProfile.avatar || null,
        state: userProfile.state || "",
        institution: userProfile.institution || "",
        membershipStatus: userProfile.membershipStatus || "ACTIVE",
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
