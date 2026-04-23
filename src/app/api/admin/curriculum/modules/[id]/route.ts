import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";
import { PublishStatus } from "@prisma/client";

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

type Params = { params: Promise<{ id: string }> };

async function resolveModule(id: string) {
  return prisma.curriculumModule.findUnique({
    where: { id },
    include: {
      framework: { select: { id: true, name: true, level: true } },
      _count: { select: { lessons: true } },
    },
  });
}

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const mod = await resolveModule(id);
  if (!mod) return NextResponse.json({ success: false, error: "Module not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: mod });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { id } = await params;

  const mod = await prisma.curriculumModule.findUnique({ where: { id } });
  if (!mod) return NextResponse.json({ success: false, error: "Module not found" }, { status: 404 });

  // SCHOOL_ADMIN cannot edit platform-wide modules (schoolId === null)
  if (user.role === "SCHOOL_ADMIN" && mod.schoolId !== user.schoolId) {
    return NextResponse.json({ success: false, error: "Forbidden: You can only edit your school's modules" }, { status: 403 });
  }

  // SCHOOL_ADMIN cannot change publishStatus to PUBLISHED (must go through approval)
  const body = await request.json();
  if (user.role === "SCHOOL_ADMIN" && body.publishStatus === "PUBLISHED") {
    return NextResponse.json({ success: false, error: "Forbidden: Submit for review to publish" }, { status: 403 });
  }

  const updated = await prisma.curriculumModule.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.subjectStrand !== undefined && { subjectStrand: body.subjectStrand }),
      ...(body.competencies !== undefined && { competencies: body.competencies }),
      ...(body.learningObjectives !== undefined && { learningObjectives: body.learningObjectives }),
      ...(body.estimatedWeeks !== undefined && { estimatedWeeks: body.estimatedWeeks }),
      ...(body.publishStatus !== undefined && user.role === "ADMIN" && { publishStatus: body.publishStatus as PublishStatus }),
    },
    include: { framework: { select: { id: true, name: true, level: true } } },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { id } = await params;

  const mod = await prisma.curriculumModule.findUnique({ where: { id } });
  if (!mod) return NextResponse.json({ success: false, error: "Module not found" }, { status: 404 });

  // SCHOOL_ADMIN can only delete their own school's modules
  if (user.role === "SCHOOL_ADMIN" && mod.schoolId !== user.schoolId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  // ADMIN cannot delete published platform modules without archiving first
  if (user.role !== "ADMIN" && mod.publishStatus === "PUBLISHED") {
    return NextResponse.json({ success: false, error: "Cannot delete a published module. Archive it first." }, { status: 400 });
  }

  await prisma.curriculumModule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
