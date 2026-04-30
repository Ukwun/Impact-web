import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleCheckoutSessionCompleted } from '@/lib/stripe-service';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

/**
 * POST /api/payments/stripe/webhook
 * Handle Stripe webhook events (payment confirmations, refunds, etc.)
 * 
 * This endpoint is called directly by Stripe and should NOT require authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
      console.log('✅ Valid Stripe webhook signature');
    } catch (error) {
      console.error('Invalid Stripe webhook signature:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log(`📦 Processing Stripe event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`💳 Checkout session completed: ${session.id}`);

        // Get payment from database using session ID
        const payment = await prisma.payment.findFirst({
          where: { stripeSessionId: session.id },
          include: { user: true },
        });

        if (!payment) {
          console.warn(`Payment not found for session: ${session.id}`);
          return NextResponse.json({
            success: true, // Return 200 to acknowledge webhook
            message: 'Payment updated',
          });
        }

        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            stripePaymentIntentId: session.payment_intent as string,
            paidAt: new Date(),
          },
        });

        // Create enrollment for the user
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId: payment.userId,
            courseId: payment.courseId,
            enrollmentDate: new Date(),
            progress: 0,
            completionPercentage: 0,
            status: 'ACTIVE',
          },
        });

        console.log(`✅ Enrollment created: ${enrollment.id}`);

        // Send confirmation email
        try {
          const course = await prisma.course.findUnique({ where: { id: payment.courseId } });
          const { sendStripePaymentConfirmation } = await import('./email-confirmation');
          await sendStripePaymentConfirmation({
            user: payment.user,
            course,
            amount: payment.amount,
            currency: payment.currency,
            paymentId: payment.id,
          });
          console.log(`📧 Sent Stripe payment confirmation to ${payment.user.email}`);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Don't fail the webhook if email fails
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`💰 Charge refunded: ${charge.id}`);

        // Find payment by Stripe charge ID
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: charge.payment_intent as string },
        });

        if (payment) {
          // Update payment status to refunded
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'REFUNDED',
              refundedAt: new Date(),
            },
          });

          // Cancel enrollment if refund is full
          if (charge.amount_refunded === charge.amount) {
            await prisma.enrollment.deleteMany({
              where: {
                studentId: payment.userId,
                courseId: payment.courseId,
              },
            });
            console.log(`❌ Enrollment cancelled due to refund`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);

        // Find and update payment
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
            },
          });
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`⚠️  Chargeback/dispute created: ${dispute.id}`);

        // Log dispute for manual review
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: dispute.payment_intent as string },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'DISPUTED',
            },
          });
        }
        break;
      }

      default:
        console.log(`⏭️  Unhandled event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('❌ Error processing Stripe webhook:', error);
    // Return 200 anyway to prevent Stripe from retrying
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}

/**
 * OPTIONS /api/payments/stripe/webhook
 * Handle CORS preflight for webhook
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  });
}
