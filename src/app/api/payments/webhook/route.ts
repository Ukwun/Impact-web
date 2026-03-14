import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * POST /api/payments/webhook
 * Flutterwave webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature
    const signature = request.headers.get("verif-hash");
    const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.warn("Missing webhook signature or secret");
      return NextResponse.json(
        { success: false, message: "No signature or secret" },
        { status: 400 }
      );
    }

    // Verify signature
    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      console.warn("Invalid webhook signature");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    // Process webhook event
    const { event, data } = body;

    if (event === "charge.completed") {
      // Payment successful
      const paymentId = data.meta?.paymentId;

      if (paymentId) {
        // Update payment record
        const payment = await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "COMPLETED",
            transactionId: data.id,
            flutterWaveRef: data.tx_ref || data.flw_ref,
            completedAt: new Date(),
            paidAt: new Date(),
          },
          include: { enrollment: true },
        });

        // If enrollment exists, update it
        if (payment.enrollmentId && payment.enrollment) {
          await prisma.enrollment.update({
            where: { id: payment.enrollmentId },
            data: {
              lastAccessedAt: new Date(),
            },
          });

          // Create notification for user
          await prisma.notification.create({
            data: {
              userId: payment.userId,
              title: "Payment Successful",
              message: `Your payment of ${payment.currency} ${payment.amount} has been processed successfully. You now have access to the course.`,
              type: "COURSE_ENROLLMENT",
              link: `/dashboard/courses/${payment.enrollment.courseId}`,
            },
          });
        }

        console.log(`✓ Payment ${paymentId} completed`);
      }
    } else if (event === "charge.failed") {
      // Payment failed
      const paymentId = data.meta?.paymentId;

      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            failureReason: data.reason || "Payment declined",
          },
        });

        console.log(`⚠️ Payment ${paymentId} failed`);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
