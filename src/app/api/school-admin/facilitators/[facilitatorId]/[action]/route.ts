import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { facilitatorId: string; action: "approve" | "reject" } }
) {
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
    const { facilitatorId, action } = params;
    const body = await request.json();
    const { feedback } = body;

    // Verify facilitator belongs to school
    const facilitator = await prisma.user.findFirst({
      where: {
        id: facilitatorId,
        schoolId,
        role: "FACILITATOR",
      },
      include: { facilitator: true },
    });

    if (!facilitator) {
      return NextResponse.json(
        { error: "Facilitator not found" },
        { status: 404 }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update facilitator status
    const updated = await prisma.facilitator.update({
      where: { userId: facilitatorId },
      data: {
        status: newStatus,
        approvalFeedback: feedback,
        approvedAt: action === "approve" ? new Date() : null,
      },
    });

    // Create notification for facilitator
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === "true") {
      console.log(
        `Email notification: ${facilitator.email} - Application ${newStatus}`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        facilitatorId,
        action,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Error updating facilitator:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
