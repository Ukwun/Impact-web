import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = payload.userId;
    const body = await request.json();
    const { assignmentId, content, fileUrl } = body;

    if (!assignmentId || (!content && !fileUrl)) {
      return NextResponse.json(
        { error: "Missing required fields: assignmentId, content or fileUrl" },
        { status: 400 }
      );
    }

    // Verify assignment exists and student is enrolled in course
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { studentId },
              take: 1,
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.course.enrollments.length === 0) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: { assignmentId, studentId },
    });

    let submission;

    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          fileUrl: fileUrl || null,
          submittedAt: new Date(),
          // Reset grade on resubmission
          grade: null,
          feedback: null,
        },
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId,
          content,
          fileUrl: fileUrl || null,
          submittedAt: new Date(),
        },
      });
    }

    // Notify facilitator of submission
    const assignment_populate = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          include: {
            facilitator: {
              include: { user: true },
            },
          },
        },
      },
    });

    // Create notification (simplified - can be extended with email)
    if (assignment_populate) {
      console.log(
        `Submission notification: ${assignment_populate.course.facilitator?.user?.email} - ${assignment_populate.title}`
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: submission.id,
          assignmentId: submission.assignmentId,
          submittedAt: submission.submittedAt,
          message: existingSubmission
            ? "Assignment resubmitted successfully"
            : "Assignment submitted successfully",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
