import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * PUT /api/payments/[id]/status
 * Update payment status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, transactionId, flutterWaveRef, failureReason } = body;

    // Verify payment exists and belongs to user or user is admin
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.userId !== payload.sub && payload.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status,
        transactionId: transactionId || payment.transactionId,
        flutterWaveRef: flutterWaveRef || payment.flutterWaveRef,
        failureReason: failureReason || payment.failureReason,
        completedAt: ["COMPLETED", "REFUNDED"].includes(status)
          ? new Date()
          : payment.completedAt,
        failedAt:
          status === "FAILED" ? new Date() : payment.failedAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPayment,
    });
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
