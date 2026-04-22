import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe-service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/payments/stripe/checkout
 * Create a Stripe checkout session for course enrollment
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, amount, currency = 'usd' } = body;

    // Validate required fields
    if (!courseId || !amount) {
      return NextResponse.json(
        { success: false, error: 'courseId and amount are required' },
        { status: 400 }
      );
    }

    // Validate currency
    if (!['usd', 'gbp'].includes(currency)) {
      return NextResponse.json(
        { success: false, error: 'Currency must be usd or gbp' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, price: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: payload.userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: payload.userId,
        courseId,
        amount: amount / 100, // Convert from cents to dollars for storage
        currency,
        status: 'PENDING',
        paymentMethod: 'STRIPE',
      },
    });

    // Get the Stripe redirect URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const successUrl = `${apiBaseUrl}/payments/stripe/success?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment.id}`;
    const cancelUrl = `${apiBaseUrl}/payments/stripe/cancel?paymentId=${payment.id}`;

    // Create Stripe checkout session
    const { sessionId, url } = await createCheckoutSession({
      courseId,
      courseName: course.title,
      amount, // Already in cents
      currency: currency as 'usd' | 'gbp',
      userEmail: user.email,
      userId: payload.userId,
      userName: `${user.firstName} ${user.lastName}`,
      successUrl,
      cancelUrl,
    });

    // Update payment with Stripe session ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripeSessionId: sessionId,
        status: 'INITIATED',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: url,
        sessionId,
        paymentId: payment.id,
      },
    });
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
