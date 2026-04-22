/**
 * Stripe Payment Service
 * Handles all Stripe payment operations: checkout sessions, webhooks, verification
 */

import Stripe from 'stripe';

let stripe: Stripe | null = null;

/**
 * Get Stripe instance (lazy initialization)
 */
function getStripe(): Stripe {
  if (!stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }
  return stripe;
}

/**
 * Create a payment checkout session for course enrollment
 * @param options - Configuration for the checkout session
 */
export async function createCheckoutSession(options: {
  courseId: string;
  courseName: string;
  amount: number; // in cents (e.g., 9999 for $99.99)
  currency: 'usd' | 'gbp';
  userEmail: string;
  userId: string;
  userName: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: options.currency,
            product_data: {
              name: options.courseName,
              description: `Enrollment in ${options.courseName} course`,
              metadata: {
                courseId: options.courseId,
              },
            },
            unit_amount: options.amount,
          },
          quantity: 1,
        },
      ],
      customer_email: options.userEmail,
      client_reference_id: options.userId,
      metadata: {
        userId: options.userId,
        courseId: options.courseId,
        userName: options.userName,
      },
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'GB', 'CA', 'AU', 'NG', 'KE', 'ZA'],
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw new Error(`Failed to create payment session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieve checkout session details
 * @param sessionId - The Stripe checkout session ID
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw new Error('Failed to retrieve checkout session');
  }
}

/**
 * Process webhook event from Stripe
 * @param event - The Stripe webhook event
 */
export async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed');
  }

  return {
    sessionId: session.id,
    paymentIntentId: session.payment_intent as string,
    userId: session.client_reference_id,
    email: session.customer_email,
    amount: session.amount_total,
    currency: session.currency,
    metadata: session.metadata,
  };
}

/**
 * Verify webhook signature (for security)
 * @param body - Raw request body
 * @param signature - Stripe signature header
 */
export function verifyWebhookSignature(
  body: Buffer | string,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    const event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error(`Webhook verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Refund a payment
 * @param paymentIntentId - The Stripe Payment Intent ID
 * @param amountToRefund - Optional amount to refund (in cents). If not provided, full refund is issued
 */
export async function refundPayment(
  paymentIntentId: string,
  amountToRefund?: number
) {
  try {
    const refund = await getStripe().refunds.create({
      payment_intent: paymentIntentId,
      amount: amountToRefund, // undefined means full refund
    });

    return {
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
      created: refund.created,
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw new Error(`Failed to refund payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get payment intent details
 * @param paymentIntentId - The Stripe Payment Intent ID
 */
export async function getPaymentIntentDetails(paymentIntentId: string) {
  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      amountReceived: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      receiptEmail: paymentIntent.receipt_email,
      created: paymentIntent.created,
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

/**
 * Create a Customer for future payments
 * @param options - Customer configuration
 */
export async function createStripeCustomer(options: {
  email: string;
  name: string;
  description?: string;
}) {
  try {
    const customer = await stripe.customers.create({
      email: options.email,
      name: options.name,
      description: options.description,
    });

    return {
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
    };
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

export default stripe;
