import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/assignments/[id]
 * Fetch assignment details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        rubric: true,
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    const assignmentResponse = {
      id: assignment.id,
      courseId: assignment.courseId,
      courseName: assignment.course.title,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      dueDate: assignment.dueDate,
      maxPoints: assignment.maxPoints,
      allowLateSubmission: assignment.allowLateSubmission,
      rubric: assignment.rubric.map((r: any) => ({
        id: r.id,
        criterion: r.criterion,
        points: r.points,
        description: r.description,
      })),
      createdAt: assignment.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: assignmentResponse,
    });
  } catch (error) {
    console.error("Fetch assignment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assignments/[id]/submit
 * Submit assignment files
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id;

    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const comments = formData.get("comments") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one file is required" },
        { status: 400 }
      );
    }

    // Fetch assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if assignment is late
    const now = new Date();
    const isLate = now > assignment.dueDate && !assignment.allowLateSubmission;

    if (isLate) {
      return NextResponse.json(
        { success: false, error: "Assignment submission deadline has passed" },
        { status: 400 }
      );
    }

    // Create submission record
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        userId: payload.sub,
        comments,
        isSubmitted: true,
        submittedAt: new Date(),
        isLate: now > assignment.dueDate,
        files: {
          create: files.map((file) => ({
            fileName: file.name,
            fileUrl: `/uploads/assignments/${assignmentId}/${file.name}`, // This would be actual S3/cloud URL
            fileSize: file.size,
            mimeType: file.type,
          })),
        },
      },
      include: {
        files: true,
      },
    });

    // TODO: Upload files to cloud storage (AWS S3, Cloudinary, etc.)

    const submissionResponse = {
      id: submission.id,
      assignmentId: submission.assignmentId,
      submittedAt: submission.submittedAt,
      isLate: submission.isLate,
      files: submission.files.map((f: any) => ({
        id: f.id,
        fileName: f.fileName,
        fileSize: f.fileSize,
      })),
      status: "Pending Review",
    };

    return NextResponse.json(
      {
        success: true,
        message: "Assignment submitted successfully",
        data: submissionResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit assignment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}
