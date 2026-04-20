import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schoolId = payload.schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Get school info
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        name: true,
        email: true,
        studentCount: true,
        facilitatorCount: true,
      },
    });

    // Count users by role
    const users = await prisma.user.findMany({
      where: { schoolId },
      select: { role: true },
    });

    const roleStats = {
      students: users.filter((u) => u.role === "STUDENT").length,
      parents: users.filter((u) => u.role === "PARENT").length,
      facilitators: users.filter((u) => u.role === "FACILITATOR").length,
      admins: users.filter((u) => u.role === "SCHOOL_ADMIN").length,
    };

    // Get pending facilitators
    const pendingFacilitators = await prisma.user.findMany({
      where: { 
        schoolId,
        role: "FACILITATOR",
        facilitator: {
          status: "pending",
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Get enrollment stats
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          schoolId,
        },
      },
      include: {
        course: true,
      },
    });

    const totalEnrolled = enrollments.length;
    const totalCompleted = enrollments.filter((e) => e.status === "completed").length;
    const completionRate = totalEnrolled > 0 
      ? Math.round((totalCompleted / totalEnrolled) * 100)
      : 0;

    // Get average grades
    const submissions = await prisma.submission.findMany({
      where: {
        assignment: {
          course: {
            schoolId,
          },
        },
        grade: {
          not: null,
        },
      },
      select: { grade: true },
    });

    const avgGrade = submissions.length > 0
      ? Math.round(submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length)
      : 0;

    // Get courses
    const courses = await prisma.course.findMany({
      where: { schoolId },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        school: {
          name: school?.name,
          email: school?.email,
        },
        users: roleStats,
        totalUsers: Object.values(roleStats).reduce((a, b) => a + b, 0),
        enrollments: {
          total: totalEnrolled,
          completed: totalCompleted,
          completionRate,
        },
        performance: {
          avgGrade,
          submissionsGraded: submissions.length,
        },
        pendingApprovals: pendingFacilitators.length,
        totalCourses: courses.length,
      },
    });
  } catch (error) {
    console.error("Error fetching school admin dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
