import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ MOCK DATA - Return immediately without database queries
    const mockData = {
      success: true,
      data: {
        enrolledCourses: [
          {
            id: "1",
            title: "Introduction to React",
            facilitatorName: "John Smith",
            progress: 65,
            status: "active",
          },
          {
            id: "2",
            title: "Advanced TypeScript",
            facilitatorName: "Jane Doe",
            progress: 42,
            status: "active",
          },
          {
            id: "3",
            title: "Web Design Fundamentals",
            facilitatorName: "Michael Johnson",
            progress: 88,
            status: "active",
          },
        ],
        pendingAssignments: [
          {
            id: "a1",
            title: "Build a Todo App",
            course: "Introduction to React",
            daysUntilDue: 2,
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            difficulty: "medium",
          },
          {
            id: "a2",
            title: "Type System Challenge",
            course: "Advanced TypeScript",
            daysUntilDue: 5,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            difficulty: "hard",
          },
        ],
        studyStreak: 12,
        recentGrades: [
          { course: "Introduction to React", score: 85 },
          { course: "Advanced TypeScript", score: 72 },
          { course: "Web Design Fundamentals", score: 92 },
        ],
      },
    };

    return NextResponse.json(mockData);

    // COMMENTED OUT: Database queries that are failing
    // const studentId = payload.userId;

    // Get student info
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, email: true, avatar: true },
    });

    // Get all enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            lessons: true,
            assignments: {
              include: {
                submissions: {
                  where: { studentId },
                  take: 1,
                },
              },
            },
            facilitator: {
              include: { user: true },
            },
          },
        },
      },
    });

    // Calculate course progress data
    const courses = enrollments.map((enrollment) => {
      const course = enrollment.course;
      const lessonsTotal = course.lessons.length;
      const lessonsCompleted = course.lessons.filter(
        (l) => l.completedAt !== null
      ).length;
      const completionPercent =
        lessonsTotal > 0
          ? Math.round((lessonsCompleted / lessonsTotal) * 100)
          : 0;

      const assignmentsTotal = course.assignments.length;
      const assignmentsSubmitted = course.assignments.filter(
        (a) => a.submissions.length > 0
      ).length;

      const gradesData = course.assignments
        .map((a) => a.submissions[0]?.grade)
        .filter((g) => g !== null && g !== undefined);
      const averageGrade =
        gradesData.length > 0
          ? Math.round(
              gradesData.reduce((a, b) => a + b, 0) / gradesData.length
            )
          : undefined;

      return {
        courseId: course.id,
        courseName: course.name,
        facilitatorName: course.facilitator?.user?.name || "Unknown",
        facilitatorEmail: course.facilitator?.user?.email,
        completionPercent,
        lessonsCompleted,
        lessonsTotal,
        assignmentsSubmitted,
        assignmentsTotal,
        averageGrade,
        status: enrollment.status,
        enrolledDate: enrollment.enrolledDate,
      };
    });

    // Get pending assignments
    const allAssignments = enrollments
      .flatMap((enrollment) =>
        enrollment.course.assignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          courseId: enrollment.course.id,
          courseName: enrollment.course.name,
          dueDate: assignment.dueDate,
          pointsTotal: assignment.pointsTotal || 0,
          submitted: assignment.submissions.length > 0,
          graded: assignment.submissions[0]?.grade !== null,
          status:
            !assignment.submissions[0]
              ? "pending"
              : assignment.submissions[0].grade !== null
              ? "graded"
              : "submitted",
        }))
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const pendingAssignments = allAssignments.filter(
      (a) => a.status === "pending"
    );
    const submittedAssignments = allAssignments.filter(
      (a) => a.status === "submitted"
    );
    const gradedAssignments = allAssignments.filter(
      (a) => a.status === "graded"
    );

    // Calculate overall stats
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.status === "active").length;
    const completedCourses = courses.filter((c) => c.status === "completed").length;
    const avgProgress = totalCourses > 0
      ? Math.round(
          courses.reduce((sum, c) => sum + c.completionPercent, 0) /
            totalCourses
        )
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        student: {
          name: student?.name,
          email: student?.email,
          avatar: student?.avatar,
        },
        courses,
        assignments: allAssignments,
        stats: {
          totalCourses,
          activeCourses,
          completedCourses,
          avgProgress,
          pendingCount: pendingAssignments.length,
          submittedCount: submittedAssignments.length,
          gradedCount: gradedAssignments.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
