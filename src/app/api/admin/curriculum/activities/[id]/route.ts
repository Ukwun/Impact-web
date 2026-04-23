import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      lesson: {
        include: {
          curriculumModule: { select: { id: true, title: true, schoolId: true } },
        },
      },
    },
  });

  if (!activity) return NextResponse.json({ success: false, error: "Activity not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: activity });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      lesson: { include: { curriculumModule: { select: { schoolId: true } } } },
    },
  });
  if (!activity) return NextResponse.json({ success: false, error: "Activity not found" }, { status: 404 });

  if (user.role === "SCHOOL_ADMIN" && activity.lesson?.curriculumModule?.schoolId !== user.schoolId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updated = await prisma.activity.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.activityType !== undefined && { activityType: body.activityType }),
      ...(body.points !== undefined && { points: body.points }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.isRequired !== undefined && { isRequired: body.isRequired }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      lesson: { include: { curriculumModule: { select: { schoolId: true } } } },
    },
  });
  if (!activity) return NextResponse.json({ success: false, error: "Activity not found" }, { status: 404 });

  if (user.role === "SCHOOL_ADMIN" && activity.lesson?.curriculumModule?.schoolId !== user.schoolId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
