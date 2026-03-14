import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import crypto from "crypto";
import { getEmailService } from "@/lib/email-service";

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

    console.log(`🔄 Webhook received: ${event}`, { paymentId: data.meta?.paymentId });

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
            metadata: data, // Store full webhook data for auditing
          },
          include: {
            enrollment: {
              include: {
                course: true,
                user: true,
              },
            },
            user: true,
          },
        });

        // If enrollment exists, update it and send notifications
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
              title: "Payment Successful 🎉",
              message: `Your payment of ${payment.currency} ${payment.amount} has been processed successfully. You now have full access to "${payment.enrollment.course.title}".`,
              type: "PAYMENT_SUCCESS",
              link: `/dashboard/courses/${payment.enrollment.courseId}`,
            },
          });

          // Send email confirmation
          try {
            const emailService = getEmailService();
            await emailService.sendEmail({
              to: payment.user.email,
              subject: `Payment Confirmed - ${payment.enrollment.course.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1FA774;">Payment Successful! 🎉</h2>
                  <p>Dear ${payment.user.firstName},</p>
                  <p>Your payment has been processed successfully. Here are the details:</p>
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Course:</strong> ${payment.enrollment.course.title}</p>
                    <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
                    <p><strong>Transaction ID:</strong> ${data.id}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  </div>
                  <p>You now have full access to your course materials. Start learning today!</p>
                  <a href="${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/courses/${payment.enrollment.courseId}"
                     style="background: #1FA774; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                    Start Learning
                  </a>
                  <p>Best regards,<br>The ImpactEdu Team</p>
                </div>
              `,
            });
          } catch (emailError) {
            console.error("Error sending payment confirmation email:", emailError);
          }
        }

        console.log(`✅ Payment ${paymentId} completed successfully`);
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
            failureReason: data.reason || data.message || "Payment declined",
            metadata: data, // Store failure details
          },
          include: { user: true },
        });

        // Create failure notification
        await prisma.notification.create({
          data: {
            userId: payment.userId,
            title: "Payment Failed",
            message: `Your payment could not be processed. Reason: ${data.reason || "Payment declined"}. Please try again or contact support.`,
            type: "PAYMENT_FAILED",
            link: "/payments",
          },
        });

        console.log(`❌ Payment ${paymentId} failed: ${data.reason || "Unknown reason"}`);
      }
    } else if (event === "transfer.completed") {
      // Bank transfer completed (for manual bank transfers)
      console.log(`🏦 Bank transfer completed: ${data.id}`);
      // Handle bank transfer completion if needed
    } else if (event === "subscription.created") {
      // Subscription created
      console.log(`📅 Subscription created: ${data.id}`);
      // Handle subscription logic if implemented
    }

    // Always return success to acknowledge webhook
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      event,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Still return 200 to prevent webhook retries for transient errors
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
