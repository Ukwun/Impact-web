import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin/school/facilitators - Get all facilitators at school
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
    const payload = verifyToken(token);
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

    // Get all facilitators with their teaching metrics
    const facilitators = await prisma.user.findMany({
      where: { role: "FACILITATOR" },
      include: {
        createdCourses: {
          select: {
            id: true,
            title: true,
            enrollments: {
              select: {
                userId: true,
                completionPercentage: true,
              },
            },
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    // Format facilitator data with teaching metrics
    const facilitatorData = facilitators.map((facilitator) => {
      const totalCourses = facilitator.createdCourses.length;
      const totalStudents = new Set(
        facilitator.createdCourses.flatMap((c) =>
          c.enrollments.map((e) => e.userId)
        )
      ).size;

      const allEnrollments = facilitator.createdCourses.flatMap(
        (c) => c.enrollments
      );
      const averageCompletion =
        allEnrollments.length > 0
          ? Math.round(
              allEnrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) /
                allEnrollments.length
            )
          : 0;

      return {
        id: facilitator.id,
        name: `${facilitator.firstName} ${facilitator.lastName}`,
        email: facilitator.email,
        verified: facilitator.verified,
        isActive: facilitator.isActive,
        totalCourses,
        totalStudents,
        averageCompletion,
        courses: facilitator.createdCourses.map((c) => ({
          courseId: c.id,
          courseName: c.title,
          students: c.enrollments.length,
        })),
        joinedAt: facilitator.createdAt,
        lastLogin: facilitator.lastLoginAt,
      };
    });

    return NextResponse.json({
      success: true,
      facilitators: facilitatorData,
      total: facilitatorData.length,
    });
  } catch (error) {
    console.error("Error fetching school facilitators:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch facilitators" },
      { status: 500 }
    );
  }
}
