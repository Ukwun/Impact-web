import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getEmailService, emailTemplates } from "@/lib/email-service";
import prisma from "@/lib/db";
import { generateCertificatePDF } from "@/lib/certificate-generator";

/**
 * GET /api/certificates
 * Get user's certificates
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = payload.sub as string;

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      select: {
        id: true,
        courseId: true,
        certificateNumber: true,
        title: true,
        issuedDate: true,
        expiryDate: true,
        qrCode: true,
        certificateUrl: true,
        createdAt: true,
      },
      orderBy: { issuedDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certificates/generate
 * Generate certificate for course completion
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = payload.sub as string;
    const body = await request.json();
    const { courseId, enrollmentId } = body;

    if (!courseId || !enrollmentId) {
      return NextResponse.json(
        { error: "courseId and enrollmentId are required" },
        { status: 400 }
      );
    }

    // Verify enrollment and completion
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          select: {
            title: true,
            instructor: true,
          },
        },
        user: true,
        quizAttempts: {
          where: { isPassed: true },
        },
        assignmentSubmissions: {
          where: { isGraded: true },
        },
      },
    });

    if (!enrollment || enrollment.userId !== userId) {
      return NextResponse.json(
        { error: "Enrollment not found or access denied" },
        { status: 404 }
      );
    }

    if (!enrollment.isCompleted) {
      return NextResponse.json(
        { error: "Course not completed yet" },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existingCertificate) {
      return NextResponse.json(
        { error: "Certificate already exists for this course" },
        { status: 409 }
      );
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate final grade
    const quizScore = enrollment.quizAttempts.length > 0
      ? enrollment.quizAttempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / enrollment.quizAttempts.length
      : 0;

    const assignmentScore = enrollment.assignmentSubmissions.length > 0
      ? enrollment.assignmentSubmissions.reduce((sum, sub) => sum + (sub.score ?? 0), 0) / enrollment.assignmentSubmissions.length
      : 0;

    const finalGrade = Math.round((quizScore + assignmentScore) / 2);

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        title: enrollment.course.title,
        certificateNumber,
        issuedDate: new Date(),
        qrCode: `https://impactedu.ng/verify/${certificateNumber}`,
      },
      include: {
        user: true,
      },
    });

    // Enrich certificate for downstream use (emails/PDF)
    const certificateWithCourse = {
      ...certificate,
      course: {
        title: enrollment.course.title,
        instructor: enrollment.course.instructor,
      },
    };

    // Generate PDF certificate
    try {
      const pdfBuffer = await generateCertificatePDF(certificateWithCourse);

      // Send email with certificate
      const emailService = getEmailService();
      const template = emailTemplates.certificateIssued(certificateWithCourse);

      await emailService.send({
        to: certificate.user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      console.error("Error generating/sending certificate:", error);
      // Don't fail the request if email/PDF generation fails
    }

    return NextResponse.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}