import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/profile
 * Fetch current user's profile from PostgreSQL
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

    // Get user profile from PostgreSQL
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        avatar: true,
        state: true,
        institution: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      console.error(`❌ User profile not found in PostgreSQL: ${userId}`);
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
        uid: userId,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        role: userProfile.role || "STUDENT",
        verified: userProfile.verified || false,
        avatar: userProfile.avatar || null,
        state: userProfile.state || "",
        institution: userProfile.institution || "",
        phone: userProfile.phone || "",
        membershipStatus: "ACTIVE",
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
