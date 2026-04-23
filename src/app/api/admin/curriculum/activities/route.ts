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
  const lessonId = searchParams.get("lessonId");
  const activityType = searchParams.get("activityType");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "25"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (lessonId) where.lessonId = lessonId;
  if (activityType) where.activityType = activityType;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // SCHOOL_ADMIN: scope to their school's lessons
  if (user.role === "SCHOOL_ADMIN") {
    where.lesson = {
      curriculumModule: {
        OR: [{ schoolId: user.schoolId }, { schoolId: null }],
      },
    };
  }

  const [total, activities] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        activityType: true,
        points: true,
        dueDate: true,
        isRequired: true,
        createdAt: true,
        lesson: {
          select: {
            id: true,
            title: true,
            curriculumModule: {
              select: {
                id: true,
                title: true,
                subjectStrand: true,
                framework: { select: { level: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: activities,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await roleMiddleware(request, ALLOWED_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const body = await request.json();
  const { title, description, activityType, lessonId, points, dueDate, isRequired, courseId } = body;

  if (!title || !activityType || !lessonId) {
    return NextResponse.json({ success: false, error: "title, activityType, and lessonId are required" }, { status: 400 });
  }

  // SCHOOL_ADMIN: verify lesson is in their school's module
  if (user.role === "SCHOOL_ADMIN") {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { curriculumModule: { select: { schoolId: true } } },
    });
    if (!lesson || lesson.curriculumModule?.schoolId !== user.schoolId) {
      return NextResponse.json({ success: false, error: "Forbidden: Lesson not in your school's curriculum" }, { status: 403 });
    }
  }

  const activity = await prisma.activity.create({
    data: {
      title,
      description,
      activityType,
      lessonId,
      points: points ?? 0,
      ...(dueDate && { dueDate: new Date(dueDate) }),
      isRequired: isRequired ?? false,
      ...(courseId && { courseId }),
    },
  });

  return NextResponse.json({ success: true, data: activity }, { status: 201 });
}
