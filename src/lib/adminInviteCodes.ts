import crypto from "crypto";
import * as admin from "firebase-admin";
import { getFirestore } from "@/lib/firebase-admin";

const INVITE_COLLECTION = "admin_invite_codes";
const INVITE_PEPPER = process.env.OWNER_INVITE_HASH_PEPPER || "";

export interface CreateAdminInviteInput {
  createdByUserId: string;
  createdByEmail: string;
  targetEmail?: string;
  expiresInMinutes?: number;
  note?: string;
}

export function normalizeEmail(email?: string): string {
  return String(email || "").trim().toLowerCase();
}

export function hashInviteCode(code: string): string {
  return crypto
    .createHash("sha256")
    .update(`${code}${INVITE_PEPPER}`)
    .digest("hex");
}

export function generateInviteCode(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

export async function createAdminInviteCode(input: CreateAdminInviteInput) {
  const db = getFirestore();
  const code = generateInviteCode(10);
  const codeHash = hashInviteCode(code);
  const now = Date.now();
  const expiresInMinutes = Math.min(Math.max(input.expiresInMinutes || 30, 5), 1440);
  const expiresAt = new Date(now + expiresInMinutes * 60 * 1000).toISOString();

  const docRef = db.collection(INVITE_COLLECTION).doc();
  await docRef.set({
    id: docRef.id,
    codeHash,
    targetRole: "ADMIN",
    targetEmail: normalizeEmail(input.targetEmail) || null,
    status: "ACTIVE",
    createdByUserId: input.createdByUserId,
    createdByEmail: normalizeEmail(input.createdByEmail),
    note: String(input.note || "").trim() || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt,
    usedAt: null,
    usedByUserId: null,
    usedByEmail: null,
  });

  return {
    inviteId: docRef.id,
    inviteCode: code,
    expiresAt,
    targetEmail: normalizeEmail(input.targetEmail) || null,
    targetRole: "ADMIN",
  };
}

export async function listAdminInviteCodes(limit = 30) {
  const db = getFirestore();
  const snapshot = await db
    .collection(INVITE_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(Math.min(Math.max(limit, 1), 100))
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      targetRole: data.targetRole || "ADMIN",
      targetEmail: data.targetEmail || null,
      status: data.status || "UNKNOWN",
      createdByUserId: data.createdByUserId || null,
      createdByEmail: data.createdByEmail || null,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
      expiresAt: data.expiresAt || null,
      usedAt: data.usedAt || null,
      usedByUserId: data.usedByUserId || null,
      usedByEmail: data.usedByEmail || null,
      note: data.note || null,
    };
  });
}

export async function consumeAdminInviteCode(input: {
  inviteCode: string;
  claimantUserId: string;
  claimantEmail: string;
}) {
  const db = getFirestore();
  const codeHash = hashInviteCode(input.inviteCode);
  const claimantEmail = normalizeEmail(input.claimantEmail);
  const snapshot = await db
    .collection(INVITE_COLLECTION)
    .where("codeHash", "==", codeHash)
    .limit(5)
    .get();

  if (snapshot.empty) {
    return { success: false, reason: "Invalid invitation code" } as const;
  }

  const now = Date.now();

  for (const doc of snapshot.docs) {
    const data = doc.data() as any;
    if (String(data.status || "").toUpperCase() !== "ACTIVE") {
      continue;
    }

    const expiresAtMs = new Date(String(data.expiresAt || "")).getTime();
    if (!Number.isNaN(expiresAtMs) && expiresAtMs <= now) {
      continue;
    }

    const targetEmail = normalizeEmail(data.targetEmail || "");
    if (targetEmail && targetEmail !== claimantEmail) {
      continue;
    }

    await doc.ref.update({
      status: "USED",
      usedAt: new Date().toISOString(),
      usedByUserId: input.claimantUserId,
      usedByEmail: claimantEmail,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      inviteId: doc.id,
      targetRole: String(data.targetRole || "ADMIN").toUpperCase(),
      targetEmail: targetEmail || null,
    } as const;
  }

  return {
    success: false,
    reason: "Invitation code is expired, already used, or not issued for this email",
  } as const;
}
