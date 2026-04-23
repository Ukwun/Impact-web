import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];
type Params = { params: Promise<{ alertId: string }> };

function asObject(input: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
}

function asArray<T>(input: unknown): T[] {
  return Array.isArray(input) ? (input as T[]) : [];
}

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ADMIN_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { alertId } = await params;

  const alert = await prisma.systemAlert.findUnique({ where: { id: alertId } });
  if (!alert || alert.category !== "Safeguarding") {
    return NextResponse.json({ success: false, error: "Safeguarding case not found" }, { status: 404 });
  }

  const metadata = asObject(alert.metadata);
  const assignedOfficerId = typeof metadata.assignedOfficerId === "string" ? metadata.assignedOfficerId : null;

  const assignedOfficer = assignedOfficerId
    ? await prisma.user.findUnique({
        where: { id: assignedOfficerId },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      })
    : null;

  return NextResponse.json({
    success: true,
    data: {
      id: alert.id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity.toLowerCase(),
      resolved: alert.resolved,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt,
      metadata,
      assignedOfficer,
      auditTrail: asArray<Record<string, unknown>>(metadata.auditTrail),
      resolutionNotes: asArray<Record<string, unknown>>(metadata.resolutionNotes),
    },
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ADMIN_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { alertId } = await params;
  const body = await request.json();

  const alert = await prisma.systemAlert.findUnique({ where: { id: alertId } });
  if (!alert || alert.category !== "Safeguarding") {
    return NextResponse.json({ success: false, error: "Safeguarding case not found" }, { status: 404 });
  }

  const metadata = asObject(alert.metadata);
  const auditTrail = asArray<Record<string, unknown>>(metadata.auditTrail);
  const resolutionNotes = asArray<Record<string, unknown>>(metadata.resolutionNotes);

  if (typeof body.assignOfficerId === "string" && body.assignOfficerId) {
    const officer = await prisma.user.findUnique({
      where: { id: body.assignOfficerId },
      select: { id: true, role: true, firstName: true, lastName: true, email: true },
    });

    if (!officer) {
      return NextResponse.json({ success: false, error: "Assigned officer not found" }, { status: 404 });
    }

    const schoolAdminAssignableRoles = ["FACILITATOR", "MENTOR", "SCHOOL_ADMIN"];
    if (
      auth.user.role === "SCHOOL_ADMIN" &&
      !schoolAdminAssignableRoles.includes(officer.role)
    ) {
      return NextResponse.json(
        { success: false, error: "School admins can assign only facilitator, mentor, or school admin officers" },
        { status: 403 }
      );
    }

    metadata.assignedOfficerId = officer.id;
    metadata.assignedOfficerRole = officer.role;
    metadata.assignedOfficerName = `${officer.firstName} ${officer.lastName}`;
    metadata.assignedOfficerEmail = officer.email;
    metadata.assignedAt = new Date().toISOString();
    metadata.assignedBy = auth.user.userId;
    metadata.ownershipStatus = "ASSIGNED";

    auditTrail.push({
      action: "ASSIGNED",
      at: new Date().toISOString(),
      by: auth.user.userId,
      officerId: officer.id,
      officerRole: officer.role,
      note: body.assignmentNote || "Case assigned",
    });
  }

  if (typeof body.note === "string" && body.note.trim()) {
    const noteEntry = {
      note: body.note.trim(),
      createdAt: new Date().toISOString(),
      createdBy: auth.user.userId,
      type: body.noteType || "UPDATE",
    };

    resolutionNotes.push(noteEntry);
    auditTrail.push({
      action: "NOTE_ADDED",
      at: new Date().toISOString(),
      by: auth.user.userId,
      note: body.note.trim(),
      noteType: body.noteType || "UPDATE",
    });
  }

  const resolved = body.resolve === true || body.resolved === true;
  if (resolved) {
    metadata.escalationStatus = "RESOLVED";
    metadata.resolvedBy = auth.user.userId;
    metadata.resolvedAt = new Date().toISOString();
    if (typeof body.resolutionSummary === "string" && body.resolutionSummary.trim()) {
      resolutionNotes.push({
        note: body.resolutionSummary.trim(),
        createdAt: new Date().toISOString(),
        createdBy: auth.user.userId,
        type: "RESOLUTION",
      });
    }
    auditTrail.push({
      action: "RESOLVED",
      at: new Date().toISOString(),
      by: auth.user.userId,
      summary: body.resolutionSummary || "Case resolved",
    });
  }

  metadata.auditTrail = auditTrail;
  metadata.resolutionNotes = resolutionNotes;

  const updated = await prisma.systemAlert.update({
    where: { id: alertId },
    data: {
      resolved,
      resolvedAt: resolved ? new Date() : null,
      metadata: metadata satisfies Prisma.JsonObject,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id,
      resolved: updated.resolved,
      resolvedAt: updated.resolvedAt,
      metadata,
    },
  });
}
