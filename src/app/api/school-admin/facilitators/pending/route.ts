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

    // Get pending facilitators
    const facilitators = await prisma.user.findMany({
      where: {
        schoolId,
        role: "FACILITATOR",
      },
      include: {
        facilitator: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const pending = facilitators
      .filter((f) => f.facilitator?.status === "pending")
      .map((f) => ({
        id: f.id,
        name: f.name,
        email: f.email,
        qualification: f.facilitator?.qualification || "Not provided",
        experience: f.facilitator?.experience || 0,
        bio: f.facilitator?.bio,
        submittedAt: f.createdAt,
        status: "pending",
      }));

    return NextResponse.json({
      success: true,
      data: pending,
      count: pending.length,
    });
  } catch (error) {
    console.error("Error fetching pending facilitators:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
