import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/parent-child - Get MY children (only linked via ParentChild relationship)
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

    // Verify PARENT role
    if (payload.role?.toUpperCase() !== "PARENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - PARENT role required" },
        { status: 403 }
      );
    }

    const parentId = payload.userId || payload.sub;

    // ============================================================================
    // GET ONLY THIS PARENT'S LINKED CHILDREN (not all students!)
    // ============================================================================
    const parentChildLinks = await prisma.parentChild.findMany({
      where: {
        parentId: parentId,
        isActive: true, // Only active relationships
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Get detailed progress for each child
    const childrenData = await Promise.all(
      parentChildLinks.map(async (link) => {
        // Check if parent has permission to view progress
        if (!link.canViewProgress) {
          return {
            childId: link.child.id,
            childName:
              `${link.child.firstName || "Student"} ${link.child.lastName || ""}`.trim() ||
              "Student",
            childEmail: link.child.email,
            childAvatar: link.child.avatar,
            error: "Permission denied",
            relationship: link.relationship,
          };
        }

        // Get all enrollments for this child
        const enrollments = await prisma.enrollment.findMany({
          where: { userId: link.child.id },
          include: { course: true },
        });

        // Get assignment submissions for grades
        const submissions = await prisma.assignmentSubmission.findMany({
          where: { userId: link.child.id },
          select: { score: true, isGraded: true },
        });

        const completedCourses = enrollments.filter(
          (e) => e.isCompleted
        ).length;

        const gradedSubmissions = submissions.filter((s) => s.isGraded && s.score);
        const averageProgress =
          gradedSubmissions.length > 0
            ? Math.round(
                gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                  gradedSubmissions.length
              )
            : 0;

        return {
          childId: link.child.id,
          childName:
            `${link.child.firstName || "Student"} ${link.child.lastName || ""}`.trim() ||
            "Student",
          childEmail: link.child.email,
          childAvatar: link.child.avatar,
          relationship: link.relationship,
          enrolledCourses: enrollments.length,
          completedCourses,
          averageProgress,
          permissions: {
            canViewProgress: link.canViewProgress,
            canViewGrades: link.canViewGrades,
            canViewAttendance: link.canViewAttendance,
            canViewCertificates: link.canViewCertificates,
            canReceiveAlerts: link.canReceiveAlerts,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      children: childrenData,
      totalChildren: childrenData.length,
    });
  } catch (error) {
    console.error("Error in parent-child GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}

// POST /api/parent-child - Link a child (add ParentChild relationship)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload || payload.role?.toUpperCase() !== "PARENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const parentId = payload.sub;
    const { childId, childEmail, relationship = "PARENT" } = await request.json();

    if (!childId && !childEmail) {
      return NextResponse.json(
        { success: false, error: "childId or childEmail required" },
        { status: 400 }
      );
    }

    // Find the child
    let child;
    if (childId) {
      child = await prisma.user.findUnique({
        where: { id: childId },
        select: { id: true, firstName: true, lastName: true, role: true },
      });
    } else {
      child = await prisma.user.findUnique({
        where: { email: childEmail },
        select: { id: true, firstName: true, lastName: true, role: true },
      });
    }

    if (!child) {
      return NextResponse.json(
        { success: false, error: "Child not found" },
        { status: 404 }
      );
    }

    if (child.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Can only link STUDENT role users" },
        { status: 400 }
      );
    }

    // Check if already linked
    const existing = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId,
          childId: child.id,
        },
      },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, error: "Child already linked" },
          { status: 400 }
        );
      }
      // Reactivate if was deactivated
      const updated = await prisma.parentChild.update({
        where: { id: existing.id },
        data: { isActive: true },
        include: { child: true },
      });
      return NextResponse.json({
        success: true,
        message: "Child relationship reactivated",
        parentChild: updated,
      });
    }

    // Create new ParentChild relationship
    const parentChild = await prisma.parentChild.create({
      data: {
        parentId,
        childId: child.id,
        relationship,
        // Default permissions: can view everything
        canViewProgress: true,
        canViewGrades: true,
        canViewAttendance: true,
        canViewCertificates: true,
        canReceiveAlerts: true,
      },
      include: { child: true },
    });

    return NextResponse.json({
      success: true,
      message: "Child linked successfully",
      parentChild,
    });
  } catch (error) {
    console.error("Error in parent-child POST:", error);
    return NextResponse.json(
      { success: false, error: "Failed to link child" },
      { status: 500 }
    );
  }
}

// DELETE /api/parent-child - Unlink a child (deactivate relationship)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload || payload.role?.toUpperCase() !== "PARENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const parentId = payload.sub;
    const { childId } = await request.json();

    if (!childId) {
      return NextResponse.json(
        { success: false, error: "childId required" },
        { status: 400 }
      );
    }

    // Verify parent owns this relationship
    const parentChild = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId,
          childId,
        },
      },
    });

    if (!parentChild) {
      return NextResponse.json(
        { success: false, error: "Relationship not found" },
        { status: 404 }
      );
    }

    // Deactivate instead of delete (preserve history)
    const updated = await prisma.parentChild.update({
      where: { id: parentChild.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Child relationship removed",
      parentChild: updated,
    });
  } catch (error) {
    console.error("Error in parent-child DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove child" },
      { status: 500 }
    );
  }
}

