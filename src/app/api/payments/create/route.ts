import { NextRequest, NextResponse } from "next/server";
import { default as prisma } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";

/**
 * POST /api/payments/create
 * Create a payment record
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
    const metadata = body.metadata || {};
    const courseId = body.courseId || metadata.courseId;

    // Validate input
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!body.currency) {
      return NextResponse.json(
        { success: false, error: "Currency is required" },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method is required" },
        { status: 400 }
      );
    }

    if ((body.purpose || "course_enrollment") === "course_enrollment" && !courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required for course enrollment payments" },
        { status: 400 }
      );
    }

    if (body.userId && body.userId !== actor.id) {
      return NextResponse.json(
        { success: false, error: "Cannot create payment for another user" },
        { status: 403 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: actor.id,
        enrollmentId: body.enrollmentId,
        amount: body.amount,
        currency: body.currency,
        purpose: body.purpose || "course_enrollment",
        description: body.description,
        paymentMethod: body.paymentMethod,
        status: "PENDING",
        metadata: {
          ...metadata,
          courseId: courseId || metadata.courseId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      data: payment,
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

