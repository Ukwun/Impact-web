import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * PUT /api/facilitator/submissions/[id]/grade
 * Grade a submission
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await verifyToken(token)) as JWTPayload;
    if (payload.role !== "FACILITATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { grade, feedback } = await req.json();

    if (grade < 0 || grade > 100) {
      return NextResponse.json(
        { error: "Grade must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Get submission and verify facilitator owns the course
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          include: {
            lesson: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.assignment.lesson.course.facilitatorId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized to grade this submission" },
        { status: 403 }
      );
    }

    // Update submission with grade
    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: {
        grade: (grade / 100) * submission.assignment.maxPoints || grade,
        feedback,
        gradedAt: new Date(),
        gradedBy: payload.userId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        title: `Grade Received`,
        message: `Your submission for "${submission.assignment.title}" has been graded: ${grade}%`,
        type: "GRADE_RECEIVED",
        relatedId: submission.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Submission graded successfully",
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Failed to grade submission" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await verifyToken(token)) as JWTPayload;
    if (payload.role !== "FACILITATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignment: {
          include: {
            lesson: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verify facilitator owns the course
    if (submission.assignment.lesson.course.facilitatorId !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}
