import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { Prisma } from "@prisma/client";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

function toObject(input: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
}

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ADMIN_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const includeResolved = request.nextUrl.searchParams.get("includeResolved") === "true";

  const queueAlerts = await prisma.systemAlert.findMany({
    where: {
      category: "Messaging Queue",
      ...(includeResolved ? {} : { resolved: false }),
    },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  const items = queueAlerts.map((alert) => {
    const metadata = toObject(alert.metadata);
    const counts = (metadata.deliveryCounts as { delivered?: number; failed?: number; total?: number } | undefined) || {};

    return {
      id: alert.id,
      title: alert.title,
      message: alert.message,
      resolved: alert.resolved,
      severity: alert.severity.toLowerCase(),
      createdAt: alert.createdAt,
      metadata: {
        ...metadata,
        deliveryCounts: {
          delivered: Number(counts.delivered || 0),
          failed: Number(counts.failed || 0),
          total: Number(counts.total || Number(metadata.queuedCount || 0)),
        },
      },
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      items,
      summary: {
        total: items.length,
        pending: items.filter((item) => !item.resolved).length,
      },
    },
  });
}
