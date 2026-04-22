import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload || payload.role?.toUpperCase() !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ==== GET REAL DATA FROM DATABASE ====

    // Get all users by role
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
    });

    const facilitators = await prisma.user.findMany({
      where: { role: "FACILITATOR" },
    });

    const courses = await prisma.course.findMany({
      include: {
        enrollments: {
          select: {
            completionPercentage: true,
            isCompleted: true,
          },
        },
      },
    });

    // Get pending approvals (users not yet verified)
    const pendingApprovals = await prisma.user.findMany({
      where: {
        verified: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Calculate metrics
    const totalStudents = students.length;
    const totalFacilitators = facilitators.length;
    const totalCourses = courses.length;

    // Calculate average completion rate
    const allEnrollments = courses.flatMap((c) => c.enrollments);
    const completedCount = allEnrollments.filter((e) => e.isCompleted).length;
    const averageCompletion =
      allEnrollments.length > 0
        ? Math.round((completedCount / allEnrollments.length) * 100)
        : 0;

    // Get top courses by enrollment
    const topCourses = courses
      .map((c) => ({
        title: c.title,
        enrollment: c.enrollments.length,
        completion: c.enrollments.length > 0
          ? Math.round(
              c.enrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) /
                c.enrollments.length
            )
          : 0,
      }))
      .sort((a, b) => b.enrollment - a.enrollment)
      .slice(0, 5);

    // Calculate school health (average of student progress)
    const allStudentEnrollments = await prisma.enrollment.findMany({
      select: { completionPercentage: true },
    });
    const schoolHealth =
      allStudentEnrollments.length > 0
        ? Math.round(
            allStudentEnrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) /
              allStudentEnrollments.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        schoolName: "Institution Dashboard",
        stats: {
          totalStudents,
          totalFacilitators,
          totalCourses,
          averageCompletion,
          schoolHealth,
        },
        pendingApprovals: pendingApprovals.map((user) => ({
          id: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          role: user.role === "FACILITATOR" ? "TEACHER" : user.role,
          registeredAt: user.createdAt.toISOString(),
        })),
        topCourses,
      },
    });
  } catch (error) {
    console.error("Error in school admin dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
