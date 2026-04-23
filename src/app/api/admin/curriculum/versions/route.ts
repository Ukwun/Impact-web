import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { PublishStatus, CurriculumEntityType } from "@prisma/client";

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType") as CurriculumEntityType | null;
  const entityId = searchParams.get("entityId");
  const status = searchParams.get("status") as PublishStatus | null;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "25"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (status) where.status = status;

  // SCHOOL_ADMIN: only see their own versions
  if (user.role === "SCHOOL_ADMIN") {
    where.authorId = user.userId;
  }

  const [total, versions] = await Promise.all([
    prisma.curriculumVersion.count({ where }),
    prisma.curriculumVersion.findMany({
      where,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
        approvalRequest: {
          select: { id: true, status: true, requestNotes: true, reviewNotes: true, requestedAt: true, reviewedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: versions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const body = await request.json();
  const { entityType, entityId, content, changeNotes, moduleId } = body;

  if (!entityType || !entityId || !content) {
    return NextResponse.json({ success: false, error: "entityType, entityId, and content are required" }, { status: 400 });
  }

  // SCHOOL_ADMIN cannot version FRAMEWORK entities
  if (user.role === "SCHOOL_ADMIN" && entityType === "FRAMEWORK") {
    return NextResponse.json({ success: false, error: "Forbidden: School admins cannot version framework definitions" }, { status: 403 });
  }

  // Get next version number
  const latest = await prisma.curriculumVersion.findFirst({
    where: { entityType: entityType as CurriculumEntityType, entityId },
    orderBy: { versionNumber: "desc" },
  });
  const versionNumber = (latest?.versionNumber ?? 0) + 1;

  const version = await prisma.curriculumVersion.create({
    data: {
      entityType: entityType as CurriculumEntityType,
      entityId,
      versionNumber,
      status: PublishStatus.DRAFT,
      content,
      changeNotes,
      authorId: user.userId,
      ...(moduleId && { moduleId }),
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json({ success: true, data: version }, { status: 201 });
}
