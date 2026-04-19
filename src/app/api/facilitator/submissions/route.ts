import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * GET /api/facilitator/submissions
 * Fetch pending submissions for facilitator's classes
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await verifyToken(token)) as JWTPayload;
    if (payload.role !== "FACILITATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all courses taught by this facilitator
    const courses = await prisma.course.findMany({
      where: { facilitatorId: payload.userId },
      include: {
        lessons: {
          include: {
            assignments: {
              include: {
                submissions: {
                  where: { gradedAt: null }, // Only ungraded submissions
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
                        dueDate: true,
                      },
                    },
                  },
                  orderBy: { submittedAt: "asc" },
                },
              },
            },
          },
        },
      },
    });

    // Flatten submissions
    const submissions = courses.flatMap((course) =>
      course.lessons.flatMap((lesson) =>
        lesson.assignments.flatMap((assignment) =>
          assignment.submissions.map((sub) => ({
            id: sub.id,
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            studentId: sub.student.id,
            studentName: sub.student.name,
            studentEmail: sub.student.email,
            courseId: course.id,
            courseName: course.name,
            submittedAt: sub.submittedAt.toISOString(),
            content: sub.content,
            fileUrl: sub.fileUrl,
          }))
        )
      )
    );

    return NextResponse.json({
      success: true,
      data: submissions,
      pendingCount: submissions.length,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
