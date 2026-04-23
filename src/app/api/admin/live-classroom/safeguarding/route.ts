import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

function asObject(input: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
}

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ADMIN_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const includeResolved = request.nextUrl.searchParams.get("includeResolved") === "true";

  const alerts = await prisma.systemAlert.findMany({
    where: {
      category: "Safeguarding",
      ...(includeResolved ? {} : { resolved: false }),
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    success: true,
    data: {
      items: alerts.map((alert) => {
        const metadata = asObject(alert.metadata);
        return {
          id: alert.id,
          title: alert.title,
          message: alert.message,
          severity: alert.severity.toLowerCase(),
          resolved: alert.resolved,
          createdAt: alert.createdAt,
          resolvedAt: alert.resolvedAt,
          metadata,
          ownership: {
            assignedOfficerId: metadata.assignedOfficerId || null,
            assignedOfficerName: metadata.assignedOfficerName || null,
            assignedOfficerRole: metadata.assignedOfficerRole || null,
            ownershipStatus: metadata.ownershipStatus || "UNASSIGNED",
          },
          auditTrailCount: Array.isArray(metadata.auditTrail) ? metadata.auditTrail.length : 0,
        };
      }),
      summary: {
        total: alerts.length,
        critical: alerts.filter((alert) => alert.severity === "CRITICAL" && !alert.resolved).length,
        warning: alerts.filter((alert) => alert.severity === "WARNING" && !alert.resolved).length,
        info: alerts.filter((alert) => alert.severity === "INFO" && !alert.resolved).length,
      },
    },
  });
}
