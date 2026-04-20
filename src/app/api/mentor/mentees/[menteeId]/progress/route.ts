import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { menteeId: string } }
) {
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
    const menteeId = params.menteeId;

    // Verify mentee belongs to this mentor
    const mentee = await prisma.user.findFirst({
      where: {
        id: menteeId,
        mentorId: mentorId,
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!mentee) {
      return NextResponse.json({ error: "Mentee not found" }, { status: 404 });
    }

    // Get mentee's primary enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: menteeId,
      },
      select: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        completionPercentage: true,
        enrolledAt: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Get submissions and grades for this mentee
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: menteeId,
      },
      select: {
        id: true,
        gradeReceived: true,
        createdAt: true,
      },
    });

    const avgGrade =
      submissions.length > 0 && submissions.some((s) => s.gradeReceived !== null)
        ? (
            submissions
              .filter((s) => s.gradeReceived !== null)
              .reduce((sum, s) => sum + (s.gradeReceived || 0), 0) /
            submissions.filter((s) => s.gradeReceived !== null).length
          ).toFixed(1)
        : "N/A";

    // Get mentee assessment/feedback
    const lastActivity = submissions.length > 0 ? submissions[0].createdAt : mentee ? new Date() : null;

    // Simulate milestones (in real system, would be from database)
    const milestones = [
      {
        id: "m1",
        name: "Course Start",
        completed: true,
        dueDate: enrollment?.enrolledAt || new Date().toISOString(),
      },
      {
        id: "m2",
        name: "25% Progress",
        completed: (enrollment?.completionPercentage || 0) >= 25,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "m3",
        name: "50% Progress",
        completed: (enrollment?.completionPercentage || 0) >= 50,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "m4",
        name: "75% Progress",
        completed: (enrollment?.completionPercentage || 0) >= 75,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "m5",
        name: "Course Completion",
        completed: (enrollment?.completionPercentage || 0) >= 100,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        id: mentee.id,
        name: mentee.name,
        courseId: enrollment?.course.id || "",
        courseName: enrollment?.course.name || "No course",
        completionPercentage: enrollment?.completionPercentage || 0,
        gradesAverage: typeof avgGrade === "string" ? 0 : parseFloat(avgGrade),
        lastActivityDate: lastActivity?.toISOString() || new Date().toISOString(),
        milestones,
        strengths: [
          "Strong analytical skills",
          "Consistent participation",
          "Quick to grasp concepts",
        ],
        areasForImprovement: [
          "Time management",
          "Written communication",
          "Peer collaboration",
        ],
      },
    });
  } catch (error: any) {
    console.error("Get mentee progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentee progress" },
      { status: 500 }
    );
  }
}
