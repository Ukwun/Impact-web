import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ADMIN_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const includeResolved = request.nextUrl.searchParams.get("includeResolved") === "true";

  const alerts = await prisma.systemAlert.findMany({
    where: {
      category: "Replay Review",
      ...(includeResolved ? {} : { resolved: false }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: {
      items: alerts.map((alert) => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity.toLowerCase(),
        resolved: alert.resolved,
        createdAt: alert.createdAt,
        resolvedAt: alert.resolvedAt,
        metadata: alert.metadata,
      })),
      summary: {
        total: alerts.length,
        pending: alerts.filter((alert) => !alert.resolved).length,
      },
    },
  });
}
