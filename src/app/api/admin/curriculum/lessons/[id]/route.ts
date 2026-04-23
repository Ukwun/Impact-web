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
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      curriculumModule: { select: { id: true, title: true, schoolId: true } },
      course: { select: { id: true, title: true } },
      activities: { select: { id: true, title: true, activityType: true } },
    },
  });

  if (!lesson) return NextResponse.json({ success: false, error: "Lesson not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: lesson });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { curriculumModule: { select: { schoolId: true } } },
  });
  if (!lesson) return NextResponse.json({ success: false, error: "Lesson not found" }, { status: 404 });

  if (user.role === "SCHOOL_ADMIN" && lesson.curriculumModule?.schoolId !== user.schoolId) {
    return NextResponse.json({ success: false, error: "Forbidden: Lesson not in your school's curriculum" }, { status: 403 });
  }

  const body = await request.json();
  const updated = await prisma.lesson.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { curriculumModule: { select: { schoolId: true } } },
  });
  if (!lesson) return NextResponse.json({ success: false, error: "Lesson not found" }, { status: 404 });

  if (user.role === "SCHOOL_ADMIN" && lesson.curriculumModule?.schoolId !== user.schoolId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
