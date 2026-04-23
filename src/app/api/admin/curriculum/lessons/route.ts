import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleMiddleware } from "@/lib/auth-service";
import type { UserRole } from "@/lib/auth-service";

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "SCHOOL_ADMIN"];

export async function GET(request: NextRequest) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "25"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (moduleId) where.curriculumModuleId = moduleId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  // SCHOOL_ADMIN: only see lessons within their school's modules
  if (user.role === "SCHOOL_ADMIN") {
    where.curriculumModule = {
      OR: [{ schoolId: user.schoolId }, { schoolId: null }],
    };
  }

  const [total, lessons] = await Promise.all([
    prisma.lesson.count({ where }),
    prisma.lesson.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        order: true,
        isPublished: true,
        createdAt: true,
        curriculumModule: {
          select: {
            id: true,
            title: true,
            subjectStrand: true,
            framework: { select: { level: true, name: true } },
          },
        },
        course: { select: { id: true, title: true } },
        _count: { select: { activities: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: lessons,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const body = await request.json();
  const { title, content, order, curriculumModuleId, courseId } = body;

  if (!title || !curriculumModuleId) {
    return NextResponse.json({ success: false, error: "title and curriculumModuleId are required" }, { status: 400 });
  }

  // SCHOOL_ADMIN: verify module belongs to their school
  if (user.role === "SCHOOL_ADMIN") {
    const mod = await prisma.curriculumModule.findUnique({ where: { id: curriculumModuleId } });
    if (!mod || mod.schoolId !== user.schoolId) {
      return NextResponse.json({ success: false, error: "Forbidden: Module not in your school's curriculum" }, { status: 403 });
    }
  }

  const lesson = await prisma.lesson.create({
    data: {
      title,
      content: content ?? "",
      order: order ?? 1,
      curriculumModuleId,
      ...(courseId && { courseId }),
    },
    include: {
      curriculumModule: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ success: true, data: lesson }, { status: 201 });
}
