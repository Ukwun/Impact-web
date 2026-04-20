import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getEmailService, emailTemplates } from "@/lib/email-service";
import { prisma } from "@/lib/db";

/**
 * POST /api/assignments/:id/grade
 * Grade an assignment submission (Facilitator only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const instructorId = payload.sub as string;
    const assignmentId = params.id;

    const body = await request.json();
    const { submissionId, grade, feedback, maxGrade = 100 } = body;

    if (!submissionId || grade === undefined) {
      return NextResponse.json(
        { error: "submissionId and grade are required" },
        { status: 400 }
      );
    }

    // Verify instructor owns the course
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
        user: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // TODO: Add authorization check - verify instructor teaches this course
    // For now, allowing any authenticated user

    // Validate grade
    if (grade < 0 || grade > maxGrade) {
      return NextResponse.json(
        { error: `Grade must be between 0 and ${maxGrade}` },
        { status: 400 }
      );
    }

    // Update submission with grade
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: Math.round(grade),
        gradedAt: new Date(),
        feedback: feedback || null,
        isGraded: true,
      },
    });

    // Send grading notification email to student
    const emailService = getEmailService();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:3000";
    const assignmentLink = `${baseUrl}/dashboard/assignments/${assignmentId}`;

    const template = emailTemplates.gradeNotification(
      submission.user.firstName,
      submission.assignment.title,
      `${Math.round(grade)}/${maxGrade}`,
      feedback || "No feedback provided",
      assignmentLink
    );

    await emailService.send({
      to: submission.user.email,
      subject: template.subject,
      html: template.html,
    });

    // Update enrollment progress
    if (submission.enrollmentId) {
      await updateEnrollmentProgress(submission.enrollmentId);
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: updatedSubmission.id,
        score: updatedSubmission.score,
        gradedAt: updatedSubmission.gradedAt,
        feedback: updatedSubmission.feedback,
      },
    });
  } catch (error) {
    console.error("Error grading assignment:", error);
    return NextResponse.json(
      { error: "Failed to grade assignment" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assignments/:id/submissions
 * Get all submissions for an assignment (Facilitator only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload || payload.role !== "FACILITATOR") {
      return NextResponse.json(
        { error: "Only facilitators can view submissions" },
        { status: 403 }
      );
    }

    const assignmentId = params.id;

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({
      submissions: submissions.map((sub) => ({
        id: sub.id,
        studentName: `${sub.user.firstName} ${sub.user.lastName}`,
        studentEmail: sub.user.email,
        submittedAt: sub.submittedAt,
        score: sub.score,
        gradedAt: sub.gradedAt,
        feedback: sub.feedback,
        files: sub.files.map((f) => ({
          id: f.id,
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          uploadedAt: f.uploadedAt,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to update enrollment progress based on completed assignments and grades
 */
async function updateEnrollmentProgress(enrollmentId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!enrollment) return;

    // Calculate progress based on graded assignments only
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: enrollment.courseId,
      },
    });

    const gradedSubmissions = await prisma.assignmentSubmission.findMany({
      where: {
        userId: enrollment.userId,
        assignment: {
          courseId: enrollment.courseId,
        },
        isGraded: true,
      },
    });

    let totalItems = assignments.length;
    let completedItems = gradedSubmissions.length;

      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { progress },
    });
  } catch (error) {
    console.error("Error updating enrollment progress:", error);
  }
}
