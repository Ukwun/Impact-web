import { NextRequest, NextResponse } from "next/server";
import { getEmailService, emailTemplates } from "@/lib/email-service";
import { prisma } from "@/lib/prisma";
import { getFirestore } from "@/lib/firebase-admin";

/**
 * POST /api/auth/send-verification-email
 * Send verification email to user after registration
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Generate new 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { email },
      data: { emailVerificationToken: code },
    });
    // Update Firestore if present
    try {
      const db = getFirestore();
      const snapshot = await db.collection("users").where("email", "==", email).get();
      snapshot.forEach(async (doc) => {
        await doc.ref.update({ emailVerificationToken: code });
      });
    } catch {}

    // Send code email
    const emailService = getEmailService();
    await emailService.send(emailTemplates.verificationCode(user.firstName || "User", code));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
