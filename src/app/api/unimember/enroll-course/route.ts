import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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
  const body = await request.json();

  try {
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        enrollmentDate: new Date(),
        completionPercentage: 0,
        status: "active"
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          enrollmentId: enrollment.id,
          courseId: enrollment.courseId,
          status: "active"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
