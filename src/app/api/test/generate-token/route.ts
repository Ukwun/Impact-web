import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";

/**
 * POST /api/test/generate-token
 * Generate a test JWT token for any role (development only)
 * 
 * Body: { role: "STUDENT" | "MENTOR" | "FACILITATOR" | etc }
 */
export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const role = (body.role || "STUDENT").toUpperCase();

    // Generate a test token
    const token = generateToken({
      sub: `test-user-${role}`,
      email: `test-${role.toLowerCase()}@example.com`,
      role: role,
    });

    return NextResponse.json({
      success: true,
      token: token,
      role: role,
      userId: `test-user-${role}`,
      email: `test-${role.toLowerCase()}@example.com`,
      message: `Test token generated for ${role} role. Use in Authorization header: Bearer ${token.substring(0, 20)}...`,
    });
  } catch (error) {
    console.error("Error generating test token:", error);
    return NextResponse.json(
      { error: "Failed to generate test token" },
      { status: 500 }
    );
  }
}
