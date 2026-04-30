import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFirestore } from "@/lib/firebase-admin";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code, token } = await request.json();

    // 1. If code and email are provided, verify via code
    if (email && code) {
      // Try to verify in PostgreSQL first
      let user = await prisma.user.findUnique({ where: { email } });
      if (user && user.emailVerificationToken === code) {
        await prisma.user.update({
          where: { email },
          data: { verified: true, emailVerificationToken: null, emailVerified: true },
        });
        // Also update in Firestore
        try {
          const db = getFirestore();
          const snapshot = await db.collection("users").where("email", "==", email).get();
          snapshot.forEach(async (doc) => {
            await doc.ref.update({ emailVerified: true, emailVerificationToken: null });
          });
        } catch {}
        return NextResponse.json({ success: true, message: "Email verified" });
      }

      // Try to verify in Firestore if not found in SQL
      try {
        const db = getFirestore();
        const snapshot = await db.collection("users").where("email", "==", email).get();
        let found = false;
        snapshot.forEach(async (doc) => {
          const data = doc.data();
          if (data.emailVerificationToken === code) {
            await doc.ref.update({ emailVerified: true, emailVerificationToken: null });
            found = true;
          }
        });
        if (found) {
          return NextResponse.json({ success: true, message: "Email verified" });
        }
      } catch {}

      return NextResponse.json({ success: false, error: "Invalid code or email" }, { status: 400 });
    }

    // 2. Fallback: legacy token-based verification
    if (token) {
      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET || "") as any;
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid or expired verification token" },
          { status: 400 }
        );
      }

      if (payload.type !== "email_verification") {
        return NextResponse.json(
          { error: "Invalid token type" },
          { status: 400 }
        );
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: payload.sub },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      });
    }

    return NextResponse.json(
      { error: "Email and code or token required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
