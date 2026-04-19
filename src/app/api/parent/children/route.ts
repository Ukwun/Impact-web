import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * GET /api/parent/children
 * Fetch all children/dependents of the parent
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all children/dependents for this parent
    const parentChild = await prisma.parentChild.findMany({
      where: { parentId: payload.userId },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    const children = parentChild.map((pc) => ({
      id: pc.child.id,
      name: `${pc.child.firstName} ${pc.child.lastName}`,
      email: pc.child.email,
      createdAt: pc.child.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: children,
      count: children.length,
    });
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}
