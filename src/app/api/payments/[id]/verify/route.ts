import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { verifyPayment } from "@/lib/flutterwave-service";

/**
 * GET /api/payments/[id]/verify
 * Verify payment status with Flutterwave
 */
export async function GET(
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

    const paymentId = params.id;

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify payment with Flutterwave
    if (payment.flutterWaveRef) {
      const result = await verifyPayment(payment.flutterWaveRef);

      if (result.success && result.data) {
        const isCompleted = result.data.status === "successful";

        // Update payment status
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: isCompleted ? "COMPLETED" : "FAILED",
            transactionId: isCompleted ? result.data.flw_ref : undefined,
            completedAt: isCompleted ? new Date() : undefined,
            paidAt: isCompleted ? new Date() : undefined,
          },
        });

        // If payment is completed, update enrollment
        if (isCompleted && payment.enrollmentId) {
          await prisma.enrollment.update({
            where: { id: payment.enrollmentId },
            data: {
              // Mark as active if payment is successful
            },
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            status: result.data.status,
            amount: result.data.amount,
            currency: result.data.currency,
            customer: result.data.customer,
          },
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error || "Payment verification failed",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
