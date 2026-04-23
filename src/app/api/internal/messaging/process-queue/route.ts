import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { dispatchMessage } from "@/lib/messaging-delivery";
import { AlertSeverity, Prisma } from "@prisma/client";

const ADMIN_ROLES: UserRole[] = ["ADMIN"];

type QueueJob = {
  channel: "WHATSAPP" | "SMS";
  userId: string;
  phone: string | null;
  role: "LEARNER" | "PARENT";
};

function getObject(input: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
}

function getArray<T = unknown>(input: unknown): T[] {
  return Array.isArray(input) ? (input as T[]) : [];
}

async function authorize(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret");
  if (process.env.MESSAGING_WORKER_SECRET && secret === process.env.MESSAGING_WORKER_SECRET) {
    return { authorized: true, actor: "worker_secret" } as const;
  }

  const auth = await roleMiddleware(request, ADMIN_ROLES);
  if (auth instanceof NextResponse) {
    return auth;
  }

  return { authorized: true, actor: auth.user.userId } as const;
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json().catch(() => ({}));
  const limitAlerts = Math.min(50, Math.max(1, Number(body.limitAlerts) || 10));
  const limitJobs = Math.min(500, Math.max(1, Number(body.limitJobs) || 150));

  const queueAlerts = await prisma.systemAlert.findMany({
    where: {
      category: "Messaging Queue",
      resolved: false,
    },
    orderBy: { createdAt: "asc" },
    take: limitAlerts,
  });

  let processedJobs = 0;
  let delivered = 0;
  let failed = 0;

  for (const queueAlert of queueAlerts) {
    if (processedJobs >= limitJobs) {
      break;
    }

    const metadata = getObject(queueAlert.metadata);
    const queuedJobs = getArray<QueueJob>(metadata.queuedJobs);
    const deliveryLog = getArray<Record<string, unknown>>(metadata.deliveryLog);
    const deliveredIndexes = new Set(getArray<number>(metadata.deliveredIndexes));

    for (let index = 0; index < queuedJobs.length; index += 1) {
      if (processedJobs >= limitJobs) {
        break;
      }

      if (deliveredIndexes.has(index)) {
        continue;
      }

      const job = queuedJobs[index];
      processedJobs += 1;

      if (!job?.phone) {
        failed += 1;
        deliveryLog.push({
          at: new Date().toISOString(),
          index,
          channel: job?.channel || "UNKNOWN",
          status: "FAILED",
          reason: "Missing phone number",
        });
        continue;
      }

      const result = await dispatchMessage({
        channel: job.channel,
        to: job.phone,
        message:
          typeof metadata.messagePreview === "string"
            ? metadata.messagePreview
            : typeof queueAlert.message === "string"
              ? queueAlert.message
              : "ImpactEdu live classroom update",
      });

      if (result.ok) {
        delivered += 1;
        deliveredIndexes.add(index);
        deliveryLog.push({
          at: new Date().toISOString(),
          index,
          channel: job.channel,
          status: "DELIVERED",
          provider: result.provider,
          providerMessageId: result.providerMessageId,
        });
      } else {
        failed += 1;
        deliveryLog.push({
          at: new Date().toISOString(),
          index,
          channel: job.channel,
          status: "FAILED",
          provider: result.provider,
          reason: result.error,
        });
      }
    }

    const queueCompleted = deliveredIndexes.size >= queuedJobs.length;

    await prisma.systemAlert.update({
      where: { id: queueAlert.id },
      data: {
        title: queueCompleted ? `Queue delivered: ${queueAlert.title}` : queueAlert.title,
        severity: queueCompleted ? AlertSeverity.INFO : failed > 0 ? AlertSeverity.WARNING : queueAlert.severity,
        resolved: queueCompleted,
        resolvedAt: queueCompleted ? new Date() : null,
        metadata: {
          ...metadata,
          deliveredIndexes: Array.from(deliveredIndexes.values()),
          deliveryLog,
          queueStatus: queueCompleted ? "COMPLETED" : "PARTIAL",
          lastProcessedAt: new Date().toISOString(),
          lastProcessedBy: auth.actor,
          deliveryCounts: {
            delivered: deliveredIndexes.size,
            total: queuedJobs.length,
            failed: deliveryLog.filter((entry) => entry.status === "FAILED").length,
          },
        } satisfies Prisma.JsonObject,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      alertsProcessed: queueAlerts.length,
      jobsProcessed: processedJobs,
      delivered,
      failed,
    },
  });
}
