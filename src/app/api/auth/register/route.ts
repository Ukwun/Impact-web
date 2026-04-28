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

const PRIVILEGED_SELF_SIGNUP_ROLES = new Set(["ADMIN", "FACILITATOR", "SCHOOL_ADMIN"]);
const ALLOWED_SELF_SIGNUP_ROLES = new Set([
  "STUDENT",
  "PARENT",
  "UNI_MEMBER",
  "CIRCLE_MEMBER",
]);
const DEFAULT_SIGNUP_ROLE = "STUDENT";

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
