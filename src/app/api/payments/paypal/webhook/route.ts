import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEmailService } from '@/lib/email-service';

/**
 * POST /api/payments/paypal/webhook
 * Handle PayPal webhook events (payment confirmations, refunds, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;
    const resource = body.resource;

    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      // Find payment by PayPal order ID
      const payment = await prisma.payment.findFirst({
        where: { paypalOrderId: resource.id },
        include: { user: true, course: true },
      });
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            paypalRef: resource.id,
          },
        });
        // Send email to student and admin
        const emailService = getEmailService();
        await emailService.send({
          to: payment.user.email,
          subject: `Payment Confirmed - ${payment.course.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0070ba;">Payment Successful! 🎉</h2>
              <p>Dear ${payment.user.firstName},</p>
              <p>Your PayPal payment has been processed successfully. Here are the details:</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Course:</strong> ${payment.course.title}</p>
                <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
                <p><strong>Payment ID:</strong> ${payment.id}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <p>You now have full access to your course materials. Start learning today!</p>
              <a href="/dashboard/courses/${payment.course.id}"
                 style="background: #0070ba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                Start Learning
              </a>
              <p>Best regards,<br>The ImpactEdu Team</p>
            </div>
          `,
        });
        // Admin/owner notification
        const adminEmail = process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await emailService.send({
            to: adminEmail,
            subject: `New PayPal Payment Received - ${payment.course.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0070ba;">New PayPal Payment Received</h2>
                <p><strong>Student:</strong> ${payment.user.firstName} ${payment.user.lastName} (${payment.user.email})</p>
                <p><strong>Course:</strong> ${payment.course.title}</p>
                <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
                <p><strong>Payment ID:</strong> ${payment.id}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
            `,
          });
        }
      }
    }
    // Always return success to acknowledge webhook
    return NextResponse.json({ success: true, message: 'Webhook processed successfully', eventType });
  } catch (error) {
    console.error('PayPal Webhook error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
