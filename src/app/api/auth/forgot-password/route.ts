import { NextRequest, NextResponse } from "next/server";
import { getEmailService, emailTemplates } from "@/lib/email-service";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import {
  checkRateLimit,
  getClientIp,
  validateInput,
  APIValidationSchemas,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security";

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // RATE LIMITING - Prevent password reset spam
    // ========================================================================

    const clientIp = getClientIp(request.headers as any);
    const rateLimitResult = await checkRateLimit(clientIp, RATE_LIMIT_CONFIGS.AUTH_PASSWORD_RESET);

    if (!rateLimitResult.allowed) {
      console.warn(`⚠️ Rate limit exceeded for password reset IP: ${clientIp}`);
      const response = NextResponse.json(
        {
          success: false,
          error: RATE_LIMIT_CONFIGS.AUTH_PASSWORD_RESET.message,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
      response.headers.set(
        "Retry-After",
        Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
      );
      return response;
    }

    const body = await request.json();

    // ========================================================================
    // INPUT VALIDATION
    // ========================================================================

    const validationResult = validateInput(APIValidationSchemas.requestPasswordReset, {
      email: body.email?.trim().toLowerCase(),
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: (validationResult as any).errors },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    console.log(`\n🔑 Password Reset Requested for: ${email}`);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      console.log(`ℹ️ No user found for email: ${email} (returning generic success)`);
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset email will be sent",
      });
    }

    console.log(`✓ User found: ${user.id}`);

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { sub: user.id, type: "password_reset" },
      process.env.JWT_SECRET || "",
      { expiresIn: "1h" }
    );

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    console.log(`✓ Reset token generated and saved to database`);

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Send email
    const emailService = getEmailService();
    const template = emailTemplates.resetPassword(user.firstName, resetLink);

    const result = await emailService.send({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) {
      console.error("Failed to send password reset email:", result.error);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset email will be sent",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
