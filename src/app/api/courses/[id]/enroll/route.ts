import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { getSocketServer } from "@/lib/socket-server";

/**
 * POST /api/courses/[id]/enroll
 * Enroll user in a course
 * 
 * Request Body: (none required)
 * Headers: Authorization: Bearer <token>
 * 
 * Response:
 * - 200: { success: true, enrollment: {...} }
 * - 400: User already enrolled
 * - 401: Not authenticated
 * - 404: Course not found
 * - 500: Server error
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from token
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const courseId = params.id;
    const body = await req.json().catch(() => ({}));
    const paymentId = String(body.paymentId || "").trim();

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment is required before enrollment. Provide a valid paymentId.",
        },
        { status: 402 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId: courseId,
          userId: user.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Payment not found for this user" },
        { status: 404 }
      );
    }

    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Payment is not completed yet" },
        { status: 400 }
      );
    }

    if (payment.enrollmentId) {
      return NextResponse.json(
        { success: false, error: "Payment has already been used for enrollment" },
        { status: 409 }
      );
    }

    const paymentMetadata = (payment.metadata || {}) as any;
    const paidCourseId = String(paymentMetadata.courseId || "");
    if (paidCourseId && paidCourseId !== courseId) {
      return NextResponse.json(
        { success: false, error: "Payment is tied to a different course" },
        { status: 400 }
      );
    }

    // Create enrollment and bind payment in one transaction.
    const enrollment = await prisma.$transaction(async (tx) => {
      const createdEnrollment = await tx.enrollment.create({
        data: {
          courseId: courseId,
          userId: user.id,
          progress: 0,
          isCompleted: false,
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              difficulty: true,
              duration: true,
            },
          },
        },
      });

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          enrollmentId: createdEnrollment.id,
          purpose: "course_enrollment",
        },
      });

      return createdEnrollment;
    });

    console.log(`✅ User ${user.id} enrolled in course ${courseId}`);

    // ========================================================================
    // EMIT WEBSOCKET EVENT FOR REAL-TIME NOTIFICATION
    // ========================================================================
    try {
      const io = getSocketServer();
      if (io) {
        // Notify student of successful enrollment
        io.to(`user:${user.id}`).emit('course:enrolled', {
          courseId: enrollment.courseId,
          courseName: enrollment.course.title,
          message: `🎉 You're now enrolled in ${enrollment.course.title}!`,
          timestamp: new Date(),
        });

        // Emit event that can trigger teacher notifications (if needed)
        io.emit('student:enrolled', {
          studentId: user.id,
          courseId: enrollment.courseId,
          courseName: enrollment.course.title,
          timestamp: new Date(),
        });

        console.log(`📡 WebSocket event emitted: course:enrolled`);
      }
    } catch (wsError) {
      // WebSocket not available, but enrollment still succeeded
      console.warn('⚠️ Failed to emit WebSocket event, but enrollment succeeded:', wsError);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in course",
      enrollment: {
        id: enrollment.id,
        courseId: enrollment.courseId,
        userId: enrollment.userId,
        progress: enrollment.progress,
        isCompleted: enrollment.isCompleted,
        enrolledAt: enrollment.enrolledAt,
        course: enrollment.course,
      },
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
