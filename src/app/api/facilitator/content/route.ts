import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// Helper to get auth user from token
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/facilitator/content
 * Get content (courses, modules, lessons) for facilitator
 * Requires FACILITATOR or ADMIN role
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || (user.role !== "FACILITATOR" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const type = req.nextUrl.searchParams.get("type") || "courses";

    if (type === "courses") {
      // Get all courses created by facilitator
      const courses = await prisma.course.findMany({
        where: {
          createdById: user.sub,
        },
        select: {
          id: true,
          title: true,
          description: true,
          isPublished: true,
          updatedAt: true,
          _count: {
            select: { lessons: true },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const formatted = courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        type: "course" as const,
        itemCount: course._count.lessons,
        isPublished: course.isPublished,
        lastModified: course.updatedAt.toISOString().split("T")[0],
      }));

      return NextResponse.json({
        success: true,
        data: {
          courses: formatted,
          modules: [],
          lessons: [],
        },
      });
    } else if (type === "modules") {
      // Get modules from courses created by facilitator
      const modules = await prisma.module.findMany({
        where: {
          course: {
            createdById: user.sub,
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          updatedAt: true,
          _count: {
            select: { lessons: true },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const formatted = modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description || "",
        type: "module" as const,
        itemCount: module._count.lessons,
        isPublished: true,
        lastModified: module.updatedAt.toISOString().split("T")[0],
      }));

      return NextResponse.json({
        success: true,
        data: {
          courses: [],
          modules: formatted,
          lessons: [],
        },
      });
    } else if (type === "lessons") {
      // Get lessons from courses created by facilitator
      const lessons = await prisma.lesson.findMany({
        where: {
          course: {
            createdById: user.sub,
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const formatted = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || "",
        type: "lesson" as const,
        isPublished: true,
        lastModified: lesson.updatedAt.toISOString().split("T")[0],
      }));

      return NextResponse.json({
        success: true,
        data: {
          courses: [],
          modules: [],
          lessons: formatted,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid content type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error fetching facilitator content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
