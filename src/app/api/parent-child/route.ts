import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/parent-child - Get children for a parent
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
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

    const userId = payload.sub;

    // Get all student enrollments (representing children's learning progress)
    const studentEnrollments = await prisma.enrollment.findMany({
      where: {
        user: { role: "STUDENT" },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        course: true,
      },
      distinct: ["userId"],
    });

    // Get unique children and their progress
    const uniqueStudentIds = [
      ...new Set(studentEnrollments.map((e) => e.userId)),
    ];

    const childrenData = await Promise.all(
      uniqueStudentIds.slice(0, 10).map(async (childId) => {
        // Get all enrollments for this child
        const enrollments = await prisma.enrollment.findMany({
          where: { userId: childId },
          include: { course: true },
        });

        // Get assignment submissions
        const submissions = await prisma.assignmentSubmission.findMany({
          where: {
            assignment: {
              enrollments: {
                some: {
                  userId: childId,
                },
              },
            },
          },
        });

        const childUser = studentEnrollments.find(
          (e) => e.userId === childId
        )?.user;

        const completedCourses = enrollments.filter(
          (e) => e.completionPercentage === 100
        ).length;

        return {
          childId,
          childName:
            `${childUser?.firstName || "Student"} ${childUser?.lastName || ""}`.trim() ||
            "Student",
          childEmail: childUser?.email,
          childAvatar: childUser?.avatar,
          enrolledCourses: enrollments.length,
          completedCourses,
          averageProgress:
            enrollments.length > 0
              ? Math.round(
                  enrollments.reduce(
                    (acc, e) => acc + e.completionPercentage,
                    0
                  ) / enrollments.length
                )
              : 0,
          currentCourses: enrollments
            .filter((e) => e.completionPercentage < 100)
            .map((e) => ({
              courseId: e.courseId,
              courseName: e.course.title,
              progress: e.completionPercentage,
            })),
          submittedAssignments: submissions.filter(
            (s) => s.status === "SUBMITTED"
          ).length,
          totalAssignments: submissions.length,
          totalGrade:
            submissions.length > 0
              ? Math.round(
                  submissions.reduce((acc, s) => acc + (s.grade || 0), 0) /
                    submissions.length
                )
              : 0,
        };
      })
    );

    return NextResponse.json({
      children: childrenData,
      total: uniqueStudentIds.length,
    });
  } catch (error) {
    console.error('Error fetching parent children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children data' },
      { status: 500 }
    );
  }
}

// POST /api/parent-child - Link a child to a parent
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
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

    // TODO: Implement when database is available
    return NextResponse.json({
      message: 'Child linked successfully (demo mode)',
      relation: { id: 'demo' }
    });
  } catch (error) {
    console.error('Error linking child:', error);
    return NextResponse.json(
      { error: 'Failed to link child' },
      { status: 500 }
    );
  }
}

// DELETE /api/parent-child - Remove parent-child link
export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get("authorization");
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

    // TODO: Implement when database is available
    return NextResponse.json({ message: 'Child unlinked successfully (demo mode)' });
  } catch (error) {
    console.error('Error unlinking child:', error);
    return NextResponse.json(
      { error: 'Failed to unlink child' },
      { status: 500 }
    );
  }
}