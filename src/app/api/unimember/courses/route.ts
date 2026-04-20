import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload || payload.role !== "UNI_MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = payload.userId;

  try {
    // Get all advanced courses
    const courses = await prisma.course.findMany({
      where: {
        level: { in: ["intermediate", "advanced"] },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        instructorId: true,
        instructor: {
          select: { name: true, title: true }
        },
        category: true,
        level: true,
        durationWeeks: true,
        price: true,
        startDate: true,
        enrollments: {
          select: { id: true }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { startDate: "desc" }
    });

    // Check if user is already enrolled
    const enrolledCourseIds = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true }
    });

    const enrolledIds = new Set(enrolledCourseIds.map((e) => e.courseId));

    // Format response
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.name,
      instructor: course.instructor.name,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.durationWeeks,
      enrollmentCount: course._count.enrollments,
      price: course.price,
      startDate: course.startDate.toISOString(),
      rating: 4.5, // Placeholder - would be calculated from reviews
      reviewCount: 128,
      topics: course.description.split(",").slice(0, 3).map((t) => t.trim()),
      isEnrolled: enrolledIds.has(course.id)
    }));

    return NextResponse.json({
      success: true,
      data: formattedCourses
    });
  } catch (error) {
    console.error("Courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
