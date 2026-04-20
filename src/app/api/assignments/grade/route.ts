import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const GradeSubmissionSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  score: z.number().min(0).max(100, "Score must be between 0 and 100"),
  feedback: z.string().optional().default(""),
});

// Helper to verify authentication
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

// Helper to check if user is facilitator/admin
function isAuthorized(userRole: string) {
  return ["ADMIN", "FACILITATOR"].includes(userRole?.toUpperCase());
}

/**
 * POST /api/assignments/grade
 * Submit a grade for an assignment submission (facilitator/admin only)
 * 
 * Body:
 * {
 *   submissionId: string,
 *   score: number (0-100),
 *   feedback: string (optional)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify authorization
    if (!isAuthorized(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only facilitators and admins can grade assignments",
        },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validatedData = GradeSubmissionSchema.parse(body);

    // Get the submission
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: validatedData.submissionId },
      include: {
        assignment: {
          include: { course: true },
        },
        user: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verify the facilitator can grade this submission
    // (course creator or admin)
    const isCreator = submission.assignment.course.createdById === user.sub;
    const isAdmin = user.role?.toUpperCase() === "ADMIN";
    
    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You cannot grade this submission" },
        { status: 403 }
      );
    }

    // Update grade
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: validatedData.submissionId },
      data: {
        score: validatedData.score,
        feedback: validatedData.feedback,
        isGraded: true,
        gradedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
          },
        },
      },
    });

    // Calculate percentage
    const percentage = (validatedData.score / updatedSubmission.assignment.maxPoints) * 100;

    console.log(`✅ Grade submitted: ${updatedSubmission.user.email} scored ${validatedData.score}/${updatedSubmission.assignment.maxPoints} (${percentage}%) on ${updatedSubmission.assignment.title}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedSubmission.id,
          studentName: `${updatedSubmission.user.firstName} ${updatedSubmission.user.lastName}`,
          studentEmail: updatedSubmission.user.email,
          assignmentTitle: updatedSubmission.assignment.title,
          score: updatedSubmission.score,
          maxPoints: updatedSubmission.assignment.maxPoints,
          percentage: Math.round(percentage),
          feedback: updatedSubmission.feedback,
          gradedAt: updatedSubmission.gradedAt,
          message: `Grade saved successfully for ${updatedSubmission.user.firstName}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("❌ Grading error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit grade",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assignments/grade?submissionId=xxx
 * Get grade details for a submission
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submissionId");

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Submission ID is required" },
        { status: 400 }
      );
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
            dueDate: true,
          },
        },
        files: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check authorization (student viewing own submission or facilitator/admin)
    const isOwnSubmission = submission.userId === user.sub;
    const isAuthorized = ["ADMIN", "FACILITATOR"].includes(user.role?.toUpperCase() || "");

    if (!isOwnSubmission && !isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: submission.id,
        studentName: `${submission.user.firstName} ${submission.user.lastName}`,
        studentEmail: submission.user.email,
        assignmentTitle: submission.assignment.title,
        submittedAt: submission.submittedAt,
        isGraded: submission.isGraded,
        score: submission.score,
        maxPoints: submission.assignment.maxPoints,
        percentage: submission.score ? (submission.score / submission.assignment.maxPoints) * 100 : null,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt,
        files: submission.files.map((f) => ({
          id: f.id,
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize,
          uploadedAt: f.uploadedAt,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Get grade error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch grade",
      },
      { status: 500 }
    );
  }
}
