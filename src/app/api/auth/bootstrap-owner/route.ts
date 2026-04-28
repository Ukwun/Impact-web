import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { prisma } from "@/lib/prisma";
import { getFirebaseAuth, getFirestore } from "@/lib/firebase-admin";
import { generateToken, hashPassword } from "@/lib/auth";

/**
 * POST /api/auth/bootstrap-owner
 * One-time owner bootstrap endpoint to create the first ADMIN account.
 */
export async function POST(req: NextRequest) {
  try {
    const bootstrapSecret = req.headers.get("x-owner-bootstrap-secret");
    const expectedSecret = process.env.OWNER_BOOTSTRAP_SECRET;

    if (!expectedSecret || bootstrapSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Invalid bootstrap secret" },
        { status: 401 }
      );
    }

    const ownerAllowlist = (process.env.OWNER_EMAIL_ALLOWLIST || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (ownerAllowlist.length === 0) {
      return NextResponse.json(
        { success: false, error: "OWNER_EMAIL_ALLOWLIST is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const firstName = String(body.firstName || "Owner");
    const lastName = String(body.lastName || "Admin");
    const phone = String(body.phone || "");
    const state = String(body.state || "");
    const institution = String(body.institution || "");

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!ownerAllowlist.includes(email)) {
      return NextResponse.json(
        { success: false, error: "Email is not authorized for owner bootstrap" },
        { status: 403 }
      );
    }

    const existingAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (existingAdmins > 0) {
      return NextResponse.json(
        { success: false, error: "Owner bootstrap is disabled after first admin creation" },
        { status: 409 }
      );
    }

    const auth = getFirebaseAuth();
    const db = getFirestore();

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        userRecord = await auth.getUserByEmail(email);
      } else {
        throw error;
      }
    }

    const nowIso = new Date().toISOString();
    await db.collection("users").doc(userRecord.uid).set(
      {
        uid: userRecord.uid,
        email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        role: "ADMIN",
        requestedRole: "ADMIN",
        approvalStatus: "APPROVED",
        verified: true,
        emailVerified: true,
        isActive: true,
        tokenInvalidBefore: nowIso,
        roleRequest: {
          requestedRole: "ADMIN",
          status: "APPROVED",
          requestedAt: nowIso,
          reviewedAt: nowIso,
          reviewedBy: "OWNER_BOOTSTRAP",
          reviewAction: "APPROVE",
          reviewNote: "First admin account bootstrapped by product owner",
        },
        roleApprovalHistory: [
          {
            action: "OWNER_BOOTSTRAP",
            requestedRole: "ADMIN",
            assignedRole: "ADMIN",
            status: "APPROVED",
            performedBy: "OWNER_BOOTSTRAP",
            performedAt: nowIso,
            note: "First admin account bootstrapped by product owner",
          },
        ],
        phone,
        state,
        institution,
        membershipStatus: "ACTIVE",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    const passwordHash = await hashPassword(password);
    await prisma.user.upsert({
      where: { id: userRecord.uid },
      update: {
        email,
        firstName,
        lastName,
        phone,
        state: state || "Unknown",
        institution,
        passwordHash,
        role: "ADMIN",
        verified: true,
        isActive: true,
        emailVerified: true,
      },
      create: {
        id: userRecord.uid,
        email,
        firstName,
        lastName,
        phone,
        state: state || "Unknown",
        institution,
        passwordHash,
        role: "ADMIN",
        verified: true,
        isActive: true,
        emailVerified: true,
      },
    });

    const token = generateToken({
      sub: userRecord.uid,
      email,
      role: "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Owner bootstrap completed. First admin created.",
      user: {
        id: userRecord.uid,
        email,
        firstName,
        lastName,
        role: "ADMIN",
        verified: true,
      },
      token,
    });
  } catch (error) {
    console.error("Owner bootstrap error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to bootstrap owner admin" },
      { status: 500 }
    );
  }
}
