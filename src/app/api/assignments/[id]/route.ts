import { NextRequest, NextResponse } from "next/server";
import { getAssignment, logActivity } from "@/lib/firestore-utils";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/assignments/[id]
 * Fetch assignment details from Firestore
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id;

    const assignment = await getAssignment(assignmentId);

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    const assignmentResponse = {
      id: assignment.id,
      courseId: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      dueDate: assignment.dueDate,
      maxPoints: assignment.maxPoints,
      allowLateSubmission: assignment.allowLateSubmission,
      createdAt: assignment.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: assignmentResponse,
    });
  } catch (error) {
    console.error("❌ Fetch assignment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assignments/[id]/submit
 * Submit assignment files/content to Firestore
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
    const submissionUrl = formData.get("submissionUrl") as string;
    const comments = formData.get("comments") as string;

    if (!submissionUrl) {
      return NextResponse.json(
        { success: false, error: "Submission content is required" },
        { status: 400 }
      );
    }

    // Fetch assignment
    const assignment = await getAssignment(assignmentId);

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if assignment is late
    const now = new Date();
    const dueDate = assignment.dueDate instanceof Date 
      ? assignment.dueDate 
      : new Date(assignment.dueDate);
    const isLate = now > dueDate && !assignment.allowLateSubmission;

    if (isLate) {
      return NextResponse.json(
        { success: false, error: "Assignment submission deadline has passed" },
        { status: 400 }
      );
    }

    // Log activity
    await logActivity(payload.sub, {
      type: 'assignment_submit',
      description: `Submitted assignment: ${assignment.title}`,
      assignmentId,
      isLate,
      timestamp: new Date(),
    });

    // Create submission record (would be stored in Firestore)
    const submissionResponse = {
      id: `submission-${Date.now()}`,
      assignmentId,
      submittedAt: new Date(),
      isLate,
      submissionUrl,
      comments,
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
    console.error("❌ Submit assignment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}
