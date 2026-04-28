import { NextRequest, NextResponse } from "next/server";
import { validatePassword } from "@/lib/security/passwordValidator";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security";
import { getFirebaseAuth, getFirestore } from "@/lib/firebase-admin";
import { generateToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEmailService } from "@/lib/email-service";

const PRIVILEGED_SELF_SIGNUP_ROLES = new Set(["ADMIN", "FACILITATOR", "SCHOOL_ADMIN"]);
const ALLOWED_SELF_SIGNUP_ROLES = new Set([
  "STUDENT",
  "PARENT",
  "UNI_MEMBER",
  "CIRCLE_MEMBER",
]);
const DEFAULT_SIGNUP_ROLE = "STUDENT";
const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
]);

function getOwnerEmails(): string[] {
  return (process.env.OWNER_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req.headers as any);
    const rateLimitResult = await checkRateLimit(clientIp, RATE_LIMIT_CONFIGS.AUTH_SIGNUP);

    if (!rateLimitResult.allowed) {
      console.warn("Rate limit exceeded for signup IP: " + clientIp);
      const response = NextResponse.json(
        {
          success: false,
          error: RATE_LIMIT_CONFIGS.AUTH_SIGNUP.message,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const firstName = body.firstName || 'User';
    const lastName = body.lastName || 'Account';
    const requestedRole = (body.role || DEFAULT_SIGNUP_ROLE).toUpperCase();
    const normalizedRequestedRole = ALLOWED_SELF_SIGNUP_ROLES.has(requestedRole)
      ? requestedRole
      : DEFAULT_SIGNUP_ROLE;
    const role = PRIVILEGED_SELF_SIGNUP_ROLES.has(requestedRole)
      ? DEFAULT_SIGNUP_ROLE
      : normalizedRequestedRole;
    const isPrivilegedRoleRequest = requestedRole !== role;
    const approvalStatus = isPrivilegedRoleRequest ? 'PENDING_ROLE_APPROVAL' : 'APPROVED';
    const phone = body.phone || '';
    const state = body.state || '';
    const roleRequestEvidence = {
      institutionalEmail: body.institutionalEmail || '',
      staffIdNumber: body.staffIdNumber || '',
      invitationReference: body.invitationReference || '',
      phoneVerified: Boolean(body.phoneVerified),
      supportingNote: body.supportingNote || '',
    };

    if (isPrivilegedRoleRequest) {
      const institutionalEmail = String(roleRequestEvidence.institutionalEmail).trim().toLowerCase();
      const staffIdNumber = String(roleRequestEvidence.staffIdNumber).trim();
      const invitationReference = String(roleRequestEvidence.invitationReference).trim();
      const supportingNote = String(roleRequestEvidence.supportingNote).trim();
      const emailDomain = institutionalEmail.includes("@")
        ? institutionalEmail.split("@")[1]
        : "";

      if (!institutionalEmail || !staffIdNumber || !invitationReference || !roleRequestEvidence.phoneVerified) {
        const response = NextResponse.json(
          {
            success: false,
            error:
              "Privileged role request requires institutional email, staff ID, invitation reference, and verified phone.",
          },
          { status: 400 }
        );
        return addCorsHeaders(response, req.headers.get("origin") || undefined);
      }

      if (!emailDomain || PUBLIC_EMAIL_DOMAINS.has(emailDomain)) {
        const response = NextResponse.json(
          {
            success: false,
            error: "Institutional email must use a non-public organization domain.",
          },
          { status: 400 }
        );
        return addCorsHeaders(response, req.headers.get("origin") || undefined);
      }

      if (supportingNote.length < 20) {
        const response = NextResponse.json(
          {
            success: false,
            error: "Supporting note must include enough detail for manual review.",
          },
          { status: 400 }
        );
        return addCorsHeaders(response, req.headers.get("origin") || undefined);
      }
    }

    console.log(`?? Register Request - Email: ${email}, Role from form: "${body.role}", Normalized to: "${role}"`);

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Password is too weak",
          feedback: passwordCheck.feedback,
        },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    const fullName = (firstName + " " + lastName).trim();
    if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Name can only contain letters, spaces, hyphens, and apostrophes",
        },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    if (!email || !password) {
      const response = NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

    const auth = getFirebaseAuth();
    
    try {
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: fullName,
      });

      const roleRequest = isPrivilegedRoleRequest
        ? {
            requestedRole,
            status: approvalStatus,
            requestedAt: new Date().toISOString(),
            requestedBy: userRecord.uid,
            evidence: roleRequestEvidence,
          }
        : null;

      console.log("User created: " + userRecord.uid);

      try {
        const db = getFirestore();
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          displayName: fullName,
          role: role,
          requestedRole: requestedRole,
          approvalStatus: approvalStatus,
          roleRequest,
          roleApprovalHistory: isPrivilegedRoleRequest
            ? [{
                action: 'REQUESTED',
                requestedRole,
                performedBy: userRecord.uid,
                performedAt: new Date().toISOString(),
                note: 'Privileged role requested during signup',
              }]
            : [],
          phone: phone,
          state: state,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
        });
        console.log("Profile stored in Firestore");
      } catch (firestoreError) {
        console.warn("Firestore write failed (non-critical): " + (firestoreError as Error).message);
      }

      // Also create user in PostgreSQL for role-based endpoints
      try {
        // Hash the password for PostgreSQL
        const passwordHash = await hashPassword(password);
        
        await prisma.user.create({
          data: {
            id: userRecord.uid,
            email: email,
            firstName: firstName,
            lastName: lastName,
            passwordHash: passwordHash,
            role: role,
            phone: phone,
            state: state || 'Unknown',
            institution: body.institution || '',
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log("? User created in PostgreSQL:", userRecord.uid);
      } catch (prismaError) {
        console.error("? PostgreSQL user creation failed:", prismaError);
        // Don't fail the registration if PostgreSQL fails, user is in Firestore
      }

      if (isPrivilegedRoleRequest) {
        const ownerEmails = getOwnerEmails();
        if (ownerEmails.length > 0) {
          const appBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api").replace("/api", "");
          const reviewUrl = `${appBaseUrl}/dashboard/admin/role-requests?userId=${encodeURIComponent(userRecord.uid)}&requestedRole=${encodeURIComponent(requestedRole)}`;
          const issueCodeUrl = `${appBaseUrl}/dashboard/admin/invite-codes?targetEmail=${encodeURIComponent(email)}`;

          const subject = `[Action Required] ${requestedRole} role request pending approval`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; line-height: 1.5;">
              <h2 style="margin-bottom: 12px;">Privileged Role Request Pending</h2>
              <p>A new user requested elevated access and is waiting for owner review.</p>
              <div style="background: #f5f7fa; border: 1px solid #e3e8ef; border-radius: 8px; padding: 12px 14px; margin: 14px 0;">
                <p style="margin: 4px 0;"><strong>User ID:</strong> ${userRecord.uid}</p>
                <p style="margin: 4px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 4px 0;"><strong>Requested Role:</strong> ${requestedRole}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> ${approvalStatus}</p>
                <p style="margin: 4px 0;"><strong>Institutional Email:</strong> ${roleRequestEvidence.institutionalEmail || "N/A"}</p>
                <p style="margin: 4px 0;"><strong>Staff ID:</strong> ${roleRequestEvidence.staffIdNumber || "N/A"}</p>
                <p style="margin: 4px 0;"><strong>Invitation Reference:</strong> ${roleRequestEvidence.invitationReference || "N/A"}</p>
                <p style="margin: 4px 0;"><strong>Phone Verified:</strong> ${roleRequestEvidence.phoneVerified ? "Yes" : "No"}</p>
                <p style="margin: 4px 0;"><strong>Supporting Note:</strong> ${roleRequestEvidence.supportingNote || "N/A"}</p>
              </div>
              <p style="margin: 14px 0 6px;">Review request:</p>
              <p style="margin: 4px 0;"><a href="${reviewUrl}">${reviewUrl}</a></p>
              <p style="margin: 14px 0 6px;">Issue one-time admin invite code:</p>
              <p style="margin: 4px 0;"><a href="${issueCodeUrl}">${issueCodeUrl}</a></p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">This notification is sent automatically for privileged-role requests. Do not share invite codes over insecure channels.</p>
            </div>
          `;

          try {
            const emailService = getEmailService();
            await Promise.all(
              ownerEmails.map((ownerEmail) =>
                emailService.send({
                  to: ownerEmail,
                  subject,
                  html,
                })
              )
            );
          } catch (emailError) {
            console.error("Owner notification email failed:", emailError);
          }
        }
      }

      const customToken = await auth.createCustomToken(userRecord.uid);

      // Generate JWT token for API authentication
      const jwtToken = generateToken({
        sub: userRecord.uid,
        email: email,
        role: role,
      });

      // Return complete user object matching User interface
      const completedUser = {
        id: userRecord.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        role: role,
        state: state,
        institution: body.institution || '',
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("? Complete user object being returned:", completedUser);

      // Return user data with proper role
      const response = NextResponse.json(
        {
          success: true,
          message: isPrivilegedRoleRequest
            ? "Account created. Your role request is pending admin approval."
            : "Account created successfully",
          user: completedUser,
          token: jwtToken,
          roleRequest: {
            requestedRole,
            assignedRole: role,
            approvalStatus,
          },
        },
        { status: 201 }
      );

      return addCorsHeaders(response, req.headers.get("origin") || undefined);

    } catch (firebaseError: any) {
      let errorMessage = "Signup failed";
      let statusCode = 400;

      if (firebaseError.code === "auth/email-already-exists") {
        errorMessage = "Email already registered";
        statusCode = 409;
      } else if (firebaseError.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (firebaseError.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }

      console.error("Firebase error: " + firebaseError.code);

      const response = NextResponse.json(
        { success: false, error: errorMessage },
        { status: statusCode }
      );

      return addCorsHeaders(response, req.headers.get("origin") || undefined);
    }

  } catch (error) {
    console.error("Signup error: " + (error as Error).message);
    const response = NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin") || undefined);
  }
}
