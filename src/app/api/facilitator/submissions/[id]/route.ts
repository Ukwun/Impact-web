import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const GRADER_ROLES = ["FACILITATOR", "ADMIN", "SCHOOL_ADMIN"];

/**
 * PUT /api/facilitator/submissions/[id]
 * Grade an assignment submission (facilitator / admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !GRADER_ROLES.includes(payload.role?.toUpperCase())) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { grade, feedback } = await req.json();

    if (typeof grade !== "number" || grade < 0 || grade > 100) {
      return NextResponse.json(
        { success: false, error: "Grade must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    // Look up the submission and its associated assignment/course
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          include: { course: { select: { id: true, createdById: true } } },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    // Facilitators may only grade submissions in courses they created; admins may grade any.
    const isAdmin = ["ADMIN", "SCHOOL_ADMIN"].includes(payload.role?.toUpperCase());
    const isCourseOwner = submission.assignment.course.createdById === payload.sub;

    if (!isAdmin && !isCourseOwner) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to grade this submission" },
        { status: 403 }
      );
    }

    // Persist the grade
    const updated = await prisma.assignmentSubmission.update({
      where: { id: params.id },
      data: {
        score: grade,
        feedback: feedback ?? null,
        isGraded: true,
        gradedAt: new Date(),
        gradedBy: payload.sub,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignment: { select: { id: true, title: true, maxPoints: true } },
      },
    });

    // Notify the student
    try {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: "Assignment Graded",
          message: `Your submission for "${updated.assignment.title}" has been graded: ${grade}%`,
          type: "GRADE_RECEIVED",
          relatedId: updated.id,
        },
      });
    } catch {
      // Notification failure should not block the response
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        studentName: `${updated.user.firstName} ${updated.user.lastName}`.trim(),
        studentEmail: updated.user.email,
        assignmentTitle: updated.assignment.title,
        score: updated.score,
        maxPoints: updated.assignment.maxPoints,
        percentage: updated.assignment.maxPoints > 0
          ? Math.round((updated.score! / updated.assignment.maxPoints) * 100)
          : null,
        feedback: updated.feedback,
        gradedAt: updated.gradedAt,
      },
      message: "Submission graded successfully",
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to grade submission" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/facilitator/submissions/[id]
 * Get specific submission details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !GRADER_ROLES.includes(payload.role?.toUpperCase())) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        assignment: {
          include: { course: { select: { id: true, createdById: true, title: true } } },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    const isAdmin = ["ADMIN", "SCHOOL_ADMIN"].includes(payload.role?.toUpperCase());
    const isCourseOwner = submission.assignment.course.createdById === payload.sub;

    if (!isAdmin && !isCourseOwner) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}
