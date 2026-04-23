import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { PublishStatus } from "@prisma/client";

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const frameworkId = searchParams.get("frameworkId");
  const subjectStrand = searchParams.get("subjectStrand");
  const publishStatus = searchParams.get("publishStatus") as PublishStatus | null;
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "25"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  // SCHOOL_ADMIN can only see modules scoped to their school OR platform-wide that they authored
  if (user.role === "SCHOOL_ADMIN") {
    where.OR = [
      { schoolId: user.schoolId },
      { schoolId: null }, // Can view platform-wide modules (read-only enforced at PUT/DELETE)
    ];
  }

  if (frameworkId) where.frameworkId = frameworkId;
  if (subjectStrand) where.subjectStrand = subjectStrand;
  if (publishStatus) where.publishStatus = publishStatus;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, modules] = await Promise.all([
    prisma.curriculumModule.count({ where }),
    prisma.curriculumModule.findMany({
      where,
      include: {
        framework: { select: { id: true, name: true, level: true } },
        _count: { select: { lessons: true, versions: true } },
      },
      orderBy: [{ frameworkId: "asc" }, { order: "asc" }],
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: modules,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const body = await request.json();
  const { frameworkId, title, description, order, subjectStrand, competencies, learningObjectives, estimatedWeeks } = body;

  if (!frameworkId || !title || !subjectStrand || order === undefined) {
    return NextResponse.json({ success: false, error: "frameworkId, title, subjectStrand, and order are required" }, { status: 400 });
  }

  // SCHOOL_ADMIN cannot create platform-wide modules (schoolId must be their school)
  const schoolId = user.role === "SCHOOL_ADMIN" ? user.schoolId : (body.schoolId ?? null);

  const module = await prisma.curriculumModule.create({
    data: {
      frameworkId,
      title,
      description,
      order,
      subjectStrand,
      competencies: competencies ?? [],
      learningObjectives: learningObjectives ?? [],
      estimatedWeeks: estimatedWeeks ?? 2,
      schoolId,
      publishStatus: PublishStatus.DRAFT,
    },
    include: {
      framework: { select: { id: true, name: true, level: true } },
    },
  });

  return NextResponse.json({ success: true, data: module }, { status: 201 });
}
