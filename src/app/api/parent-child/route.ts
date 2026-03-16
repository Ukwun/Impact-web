import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/parent-child - Get children for a parent
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
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

    const userId = payload.sub;

    // TODO: Implement when database is available
    // For now, return empty array
    return NextResponse.json({ children: [] });
  } catch (error) {
    console.error('Error fetching parent children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children data' },
      { status: 500 }
    );
  }
}

// POST /api/parent-child - Link a child to a parent
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
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

    // TODO: Implement when database is available
    return NextResponse.json({
      message: 'Child linked successfully (demo mode)',
      relation: { id: 'demo' }
    });
  } catch (error) {
    console.error('Error linking child:', error);
    return NextResponse.json(
      { error: 'Failed to link child' },
      { status: 500 }
    );
  }
}

// DELETE /api/parent-child - Remove parent-child link
export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
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

    // TODO: Implement when database is available
    return NextResponse.json({ message: 'Child unlinked successfully (demo mode)' });
  } catch (error) {
    console.error('Error unlinking child:', error);
    return NextResponse.json(
      { error: 'Failed to unlink child' },
      { status: 500 }
    );
  }
}