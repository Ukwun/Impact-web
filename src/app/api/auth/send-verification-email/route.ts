import { NextRequest, NextResponse } from "next/server";
import { getEmailService, emailTemplates } from "@/lib/email-service";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/send-verification-email
 * Send verification email to user after registration
 */
export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate verification token (expires in 24 hours)
    const verificationToken = jwt.sign(
      { sub: userId, type: "email_verification" },
      process.env.JWT_SECRET || "",
      { expiresIn: "24h" }
    );

    // Save token to database
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: verificationToken,
      },
    });

    // Generate verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

    // Send email
    const emailService = getEmailService();
    const template = emailTemplates.verifyEmail(user.firstName, verificationLink);

    const result = await emailService.send({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
