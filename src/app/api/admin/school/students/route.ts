import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin/school/students - Get all students at school
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Verify SCHOOL_ADMIN role
    if (payload.role?.toUpperCase() !== "SCHOOL_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get all students with their enrollment progress
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        achievements: {
          select: {
            id: true,
            achievement: true,
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    // Format student data with metrics
    const studentData = students.map((student) => {
      const totalEnrollments = student.enrollments.length;
      const completedEnrollments = student.enrollments.filter(
        (e) => e.isCompleted
      ).length;
      const averageProgress =
        totalEnrollments > 0
          ? Math.round(
              student.enrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) /
                totalEnrollments
            )
          : 0;

      return {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        verified: student.verified,
        isActive: student.isActive,
        totalEnrollments,
        completedEnrollments,
        averageProgress,
        achievements: student.achievements.length,
        courses: student.enrollments.map((e) => ({
          courseId: e.course.id,
          courseName: e.course.title,
          progress: e.completionPercentage || 0,
          isCompleted: e.isCompleted,
        })),
        joinedAt: student.createdAt,
        lastLogin: student.lastLoginAt,
      };
    });

    return NextResponse.json({
      success: true,
      students: studentData,
      total: studentData.length,
    });
  } catch (error) {
    console.error("Error fetching school students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
