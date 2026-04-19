import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * GET /api/assignments
 * Fetch all assignments for user's enrolled courses
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
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

    // Verify STUDENT role
    if (payload.role?.toUpperCase() !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - STUDENT role required" },
        { status: 403 }
      );
    }

    const userId = payload.sub;
    console.log(`📝 Fetching assignments for user: ${userId}`);

    // Get all courses user is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    // Get all assignments for those courses with submission status
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          },
        },
        rubric: true,
        submissions: {
          where: { userId },
          select: {
            id: true,
            isSubmitted: true,
            submittedAt: true,
            isLate: true,
            isGraded: true,
            score: true,
            feedback: true,
            files: {
              select: {
                id: true,
                fileName: true,
                fileSize: true,
                mimeType: true,
                uploadedAt: true,
              },
            },
          },
          take: 1, // Only get the latest submission
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Transform to frontend format
    const assignmentData = assignments.map((assignment) => {
      const submission = assignment.submissions[0] || null;
      const now = new Date();
      const isOverdue = !submission?.isSubmitted && assignment.dueDate < now;

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        courseId: assignment.courseId,
        courseName: assignment.course.title,
        courseThumbnail: assignment.course.thumbnail,
        dueDate: assignment.dueDate.toISOString(),
        maxPoints: assignment.maxPoints,
        allowLateSubmission: assignment.allowLateSubmission,
        rubric: assignment.rubric.map((r) => ({
          id: r.id,
          criterion: r.criterion,
          points: r.points,
          description: r.description,
        })),
        submission: submission ? {
          id: submission.id,
          isSubmitted: submission.isSubmitted,
          submittedAt: submission.submittedAt?.toISOString() || null,
          isLate: submission.isLate,
          isGraded: submission.isGraded,
          score: submission.score,
          feedback: submission.feedback,
          files: submission.files.map((f) => ({
            id: f.id,
            fileName: f.fileName,
            fileSize: f.fileSize,
            mimeType: f.mimeType,
            uploadedAt: f.uploadedAt.toISOString(),
          })),
        } : null,
        status: submission?.isGraded ? "GRADED" : submission?.isSubmitted ? "SUBMITTED" : isOverdue ? "OVERDUE" : "PENDING",
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        assignments: assignmentData,
        total: assignmentData.length,
      },
    });
  } catch (error) {
    console.error("❌ Fetch assignments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
