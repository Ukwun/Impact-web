import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";
import { initializePayment } from "@/lib/flutterwave-service";

/**
 * POST /api/payments/checkout
 * Initialize payment with Flutterwave
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const actor = authResult.user;

    const body = await request.json();
    const { paymentId, courseId, amount, currency = "NGN" } = body;

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.userId !== actor.id) {
      return NextResponse.json(
        { success: false, error: "You can only checkout your own payment" },
        { status: 403 }
      );
    }

    const paymentMetadata = (payment.metadata || {}) as any;
    const metadataCourseId = String(paymentMetadata.courseId || "");
    if (metadataCourseId && metadataCourseId !== String(courseId || "")) {
      return NextResponse.json(
        { success: false, error: "Payment course mismatch" },
        { status: 400 }
      );
    }

    // Get course info for description
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    // Initialize Flutterwave payment
    const result = await initializePayment({
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      email: payment.user.email,
      firstName: payment.user.firstName,
      lastName: payment.user.lastName,
      phone: payment.user.phone || "",
      orderId: payment.id,
      redirectUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}/payments/callback?paymentId=${payment.id}`,
      meta: {
        paymentId: payment.id,
        userId: payment.userId,
        courseId,
        courseName: course?.title,
      },
    });

    if (result.success && result.data) {
      // Update payment with Flutterwave reference
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          flutterWaveRef: result.data.reference,
          authorizationUrl: result.data.authorization_url,
          status: "INITIATED",
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          authorizationUrl: result.data.authorization_url,
          reference: result.data.reference,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to initialize payment",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error initializing Flutterwave payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
