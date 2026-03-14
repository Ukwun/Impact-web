import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  validatePassword,
  validateInput,
  APIValidationSchemas,
} from "@/lib/security";

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token as string;
    const newPassword = body.newPassword as string;
    const confirmPassword = body.confirmPassword || body.confirmNewPassword as string;

    console.log(`\n🔑 Password Reset Attempt`);
    console.log(`Token provided: ${token ? '✓' : '✗'}`);

    // ========================================================================
    // INPUT VALIDATION
    // ========================================================================

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (newPassword.trim() !== (confirmPassword || newPassword).trim()) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // ========================================================================
    // VALIDATE PASSWORD STRENGTH
    // ========================================================================

    const passwordStrengthCheck = validatePassword(newPassword);

    if (!passwordStrengthCheck.isValid) {
      console.warn(`⚠️ Password reset: New password too weak`);
      return NextResponse.json(
        {
          success: false,
          error: "Password is too weak",
          passwordFeedback: passwordStrengthCheck.feedback,
          passwordStrength: passwordStrengthCheck.strength,
        },
        { status: 400 }
      );
    }

    console.log(`✓ Password strength check passed`);

    // ========================================================================
    // VERIFY TOKEN
    // ========================================================================

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "") as any;
      console.log(`✓ Token verified for user: ${payload.sub}`);
    } catch (error) {
      console.warn(`⚠️ Invalid or expired token`);
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (payload.type !== "password_reset") {
      console.warn(`⚠️ Invalid token type: ${payload.type}`);
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    console.log(`✓ Password reset successfully for user: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
