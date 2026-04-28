import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";
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
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const actor = authResult.user;

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

    const requesterRole = String(actor.role || "").toUpperCase();
    if (payment.userId !== actor.id && requesterRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
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

        // If payment is completed and not yet linked to enrollment, auto-link.
        if (isCompleted && !payment.enrollmentId) {
          const metadata = (payment.metadata || {}) as any;
          const courseId = String(metadata.courseId || "");
          if (courseId) {
            const enrollment = await prisma.enrollment.upsert({
              where: {
                courseId_userId: {
                  courseId,
                  userId: payment.userId,
                },
              },
              update: {},
              create: {
                courseId,
                userId: payment.userId,
                progress: 0,
                isCompleted: false,
              },
            });

            await prisma.payment.update({
              where: { id: paymentId },
              data: { enrollmentId: enrollment.id },
            });
          }
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
