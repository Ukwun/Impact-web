import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "MENTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mentorId = payload.userId;

    // Get all mentees for this mentor
    const mentees = await prisma.user.findMany({
      where: {
        mentorId: mentorId,
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            course: {
              select: {
                id: true,
                name: true,
              },
            },
            completionPercentage: true,
            status: true,
          },
          take: 1,
          orderBy: {
            enrolledAt: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform data
    const transformedMentees = mentees.map((mentee) => ({
      id: mentee.id,
      name: mentee.name,
      email: mentee.email,
      joinDate: mentee.createdAt,
      currentCourse: mentee.enrollments[0]?.course.name || "No course",
      progress: mentee.enrollments[0]?.completionPercentage || 0,
      enrollmentCount: mentee.enrollments.length,
    }));

    return NextResponse.json({
      success: true,
      data: transformedMentees,
    });
  } catch (error: any) {
    console.error("Get mentees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentees" },
      { status: 500 }
    );
  }
}
