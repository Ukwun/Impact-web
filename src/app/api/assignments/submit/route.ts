import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "submissions");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB max per file
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
];

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SubmitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  comments: z.string().optional().default(""),
});

// Helper to verify authentication
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

// Helper to generate unique filename
function generateFileName(file: File): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split(".").pop();
  return `submission-${timestamp}-${random}.${extension}`;
}

/**
 * POST /api/assignments/submit
 * Submit an assignment with files (students)
 * 
 * FormData:
 * - assignmentId: string
 * - comments: string (optional)
 * - files: File[] (attached files from student)
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

    // Students can only submit assignments
    if (!["STUDENT", "PARENT"].includes(user.role?.toUpperCase() || "")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only students can submit assignments",
        },
        { status: 403 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Parse FormData
    const formData = await req.formData();
    const assignmentId = formData.get("assignmentId") as string;
    const comments = (formData.get("comments") as string) || "";

    // Validate assignmentId
    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: assignment.courseId,
        userId: user.sub,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not enrolled in this course",
        },
        { status: 403 }
      );
    }

    // Check if submission already exists
    let submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId: user.sub,
        },
      },
    });

    // Create submission if it doesn't exist
    if (!submission) {
      submission = await prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          userId: user.sub,
          enrollmentId: enrollment.id,
          comments,
          isSubmitted: true,
          submittedAt: new Date(),
          isLate: new Date() > assignment.dueDate,
        },
      });
    } else {
      // Update existing submission
      submission = await prisma.assignmentSubmission.update({
        where: { id: submission.id },
        data: {
          comments,
          isSubmitted: true,
          submittedAt: new Date(),
          isLate: new Date() > assignment.dueDate,
        },
      });
    }

    // Process uploaded files
    const files = formData.getAll("files") as File[];
    const uploadedFiles = [];

    for (const file of files) {
      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `File type ${file.type} is not allowed`,
          },
          { status: 400 }
        );
      }

      // Save file
      const fileName = generateFileName(file);
      const filePath = path.join(UPLOAD_DIR, fileName);
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      // Create SubmissionFile record
      const submissionFile = await prisma.submissionFile.create({
        data: {
          submissionId: submission.id,
          fileName: file.name,
          fileUrl: `/uploads/submissions/${fileName}`,
          fileSize: file.size,
          mimeType: file.type,
        },
      });

      uploadedFiles.push({
        id: submissionFile.id,
        fileName: submissionFile.fileName,
        fileUrl: submissionFile.fileUrl,
        fileSize: submissionFile.fileSize,
      });

      console.log(`✅ File uploaded: ${fileName} for submission ${submission.id}`);
    }

    console.log(`✅ Assignment submitted: ${user.email} submitted ${assignment.title}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          submissionId: submission.id,
          assignmentTitle: assignment.title,
          submittedAt: submission.submittedAt,
          isLate: submission.isLate,
          filesCount: uploadedFiles.length,
          files: uploadedFiles,
          message: `Assignment submitted successfully${submission.isLate ? " (LATE)" : ""}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Submit assignment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit assignment",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assignments/submit?assignmentId=xxx
 * Get submission details (student or facilitator)
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
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Get user's submission
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        userId: user.sub,
      },
      include: {
        files: true,
        assignment: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        submissionId: submission.id,
        assignmentId: submission.assignmentId,
        assignmentTitle: submission.assignment.title,
        submittedAt: submission.submittedAt,
        isSubmitted: submission.isSubmitted,
        isLate: submission.isLate,
        comments: submission.comments,
        isGraded: submission.isGraded,
        score: submission.score,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt,
        files: submission.files.map((f) => ({
          id: f.id,
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Get submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch submission",
      },
      { status: 500 }
    );
  }
}
