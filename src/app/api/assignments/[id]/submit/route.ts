import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3-client";
import { validateFile, generateS3Key } from "@/lib/file-validation";
import prisma from "@/lib/db";

/**
 * POST /api/assignments/:id/submit
 * Submit assignment with file upload
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

    const userId = payload.sub as string;
    const assignmentId = params.id;

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if user is enrolled in course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: userId,
        courseId: assignment.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Check if assignment submission deadline has passed
    if (assignment.dueDate && new Date() > assignment.dueDate) {
      return NextResponse.json(
        { error: "Assignment submission deadline has passed" },
        { status: 400 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const submissionNotes = formData.get("notes") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Validate file
    const validation = await validateFile(fileBuffer, file.name, "document");
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate S3 key
    const s3Key = generateS3Key(userId, file.name, "document");

    // Upload to S3
    const { url } = await uploadToS3(fileBuffer, s3Key, file.type);

    // Check if submission already exists
    let submission = await prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        userId,
      },
    });

    if (submission) {
      // Update existing submission
      submission = await prisma.assignmentSubmission.update({
        where: { id: submission.id },
        data: {
          submittedAt: new Date(),
          comments: submissionNotes || null,
        },
      });

      // Create file record
      await prisma.submissionFile.create({
        data: {
          submissionId: submission.id,
          fileName: file.name,
          fileUrl: url,
          fileSize: fileBuffer.length,
          mimeType: file.type || 'application/octet-stream',
        },
      });
    } else {
      // Create new submission
      submission = await prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          userId,
          submittedAt: new Date(),
          comments: submissionNotes || null,
          files: {
            create: {
              fileName: file.name,
              fileUrl: url,
              fileSize: fileBuffer.length,
              mimeType: file.type || 'application/octet-stream',
            },
          },
        },
        include: { files: true },
      });
    }

    // Update enrollment progress if needed
    await updateEnrollmentProgress(enrollment.id);

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        assignmentId,
        submittedAt: submission.submittedAt,
        fileUrl: url,
        fileName: file.name,
      },
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to update enrollment progress
 */
async function updateEnrollmentProgress(enrollmentId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
      },
    });

    if (!enrollment) return;

    // Simple progress update for assignment submission
    const currentProgress = enrollment.progress || 0;
    const newProgress = Math.min(currentProgress + 5, 100);

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { progress: newProgress },
    });
  } catch (error) {
    console.error("Error updating enrollment progress:", error);
    // Don't throw - this is non-critical
  }
}
