import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = payload.schoolId;

    // Get all school users
    const users = await prisma.user.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status || "active",
      joinedDate: u.createdAt,
      lastActive: u.lastLoginAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      count: formattedUsers.length,
    });
  } catch (error) {
    console.error("Error fetching school users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = payload.schoolId;
    const body = await request.json();
    const { userId, newRole, newStatus } = body;

    // Verify user belongs to school
    const user = await prisma.user.findFirst({
      where: { id: userId, schoolId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole || undefined,
        status: newStatus || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
