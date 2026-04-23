import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const frameworks = await prisma.curriculumFramework.findMany({
    include: {
      _count: { select: { modules: true } },
    },
    orderBy: { minAge: "asc" },
  });

  return NextResponse.json({ success: true, data: frameworks });
}

// Only ADMIN can update top-level frameworks
export async function PUT(request: NextRequest) {
  const auth = await roleMiddleware(request, ["ADMIN"] as UserRole[]);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { id, name, description, signatureShift, primaryOutcome, durationWeeks, learningObjectives, competencyAreas, assessmentMethods } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: "Framework id required" }, { status: 400 });
  }

  const updated = await prisma.curriculumFramework.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(signatureShift !== undefined && { signatureShift }),
      ...(primaryOutcome !== undefined && { primaryOutcome }),
      ...(durationWeeks !== undefined && { durationWeeks }),
      ...(learningObjectives !== undefined && { learningObjectives }),
      ...(competencyAreas !== undefined && { competencyAreas }),
      ...(assessmentMethods !== undefined && { assessmentMethods }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
