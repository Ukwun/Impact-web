// User Profile API - Real database integration
// GET /api/users/[id] - Get user profile
// PUT /api/users/[id] - Update user profile

import { NextRequest, NextResponse } from "next/server";
import { UserService, ProgressService, AchievementService } from "@/lib/database-service";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

// GET user profile with complete session data
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      const response = NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.sub !== params.id) {
      const response = NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Fetch from database
    const user = await UserService.getProfile(params.id);

    if (!user) {
      const response = NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    // Get learning stats
    const stats = await ProgressService.getLearningStats(params.id);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user,
          stats,
        },
      },
      { status: 200 }
    );

    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("Error fetching user profile:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}

// PUT update user profile
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      const response = NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.sub !== params.id) {
      const response = NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
      return addCorsHeaders(response, req.headers.get("origin"));
    }

    const body = await req.json();
    const allowedFields = ['firstName', 'lastName', 'avatar', 'location'];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    const updatedUser = await UserService.updateProfile(params.id, updateData);

    const response = NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: "Profile updated successfully",
      },
      { status: 200 }
    );

    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("Error updating user profile:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
