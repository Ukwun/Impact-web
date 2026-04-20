import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/parent/alerts
 * Get performance alerts for all children
 */
export async function GET(request: NextRequest) {
  try {
    // Verify parent authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parentId = payload.userId;

    // ============================================================================
    // GET ALL PARENT'S LINKED CHILDREN
    // ============================================================================
    const parentChildLinks = await prisma.parentChild.findMany({
      where: {
        parentId,
        isActive: true,
        canReceiveAlerts: true, // Only for children with alerts enabled
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // ============================================================================
    // GENERATE ALERTS FOR EACH CHILD
    // ============================================================================
    const allAlertsPerChild = await Promise.all(
      parentChildLinks.map(async (link) => {
        const childAlerts: any[] = [];

        // Get recent submissions
        const recentSubmissions = await prisma.assignmentSubmission.findMany({
          where: { userId: link.child.id, isGraded: true },
          include: {
            assignment: {
              select: { title: true },
            },
          },
          orderBy: { gradedAt: "desc" },
          take: 10,
        });

        // Alert: Low scores
        const lowScores = recentSubmissions.filter((s) => (s.score || 0) < 60);
        if (lowScores.length > 0) {
          childAlerts.push({
            childId: link.child.id,
            childName: `${link.child.firstName} ${link.child.lastName}`,
            type: "critical",
            title: "Low Score Alert",
            message: `${link.child.firstName} scored ${lowScores[0].score}% on ${lowScores[0].assignment.title}`,
            timestamp: lowScores[0].gradedAt,
            actionNeeded: true,
          });
        }

        // Alert: Needs improvement
        const needsImprovement = recentSubmissions.filter(
          (s) => (s.score || 0) >= 60 && (s.score || 0) < 75
        );
        if (needsImprovement.length > 2) {
          childAlerts.push({
            childId: link.child.id,
            childName: `${link.child.firstName} ${link.child.lastName}`,
            type: "warning",
            title: "Pattern Alert",
            message: `${link.child.firstName} is scoring below target in multiple assignments. Average: ${Math.round(
              needsImprovement.reduce((sum, s) => sum + (s.score || 0), 0) /
                needsImprovement.length
            )}%`,
            timestamp: new Date(),
            actionNeeded: true,
          });
        }

        // Alert: Excellent performance
        const excellentScores = recentSubmissions.filter(
          (s) => (s.score || 0) >= 90
        );
        if (excellentScores.length > 0) {
          childAlerts.push({
            childId: link.child.id,
            childName: `${link.child.firstName} ${link.child.lastName}`,
            type: "success",
            title: "Great Achievement",
            message: `${link.child.firstName} scored ${excellentScores[0].score}% on ${excellentScores[0].assignment.title}!`,
            timestamp: excellentScores[0].gradedAt,
            actionNeeded: false,
          });
        }

        // Alert: No recent submissions
        const noRecentSubmissions = await prisma.enrollment.count({
          where: {
            userId: link.child.id,
            isCompleted: false,
          },
        });

        if (noRecentSubmissions > 0 && recentSubmissions.length === 0) {
          childAlerts.push({
            childId: link.child.id,
            childName: `${link.child.firstName} ${link.child.lastName}`,
            type: "info",
            title: "No Recent Activity",
            message: `No recent submissions from ${link.child.firstName}. Check course status.`,
            timestamp: new Date(),
            actionNeeded: false,
          });
        }

        return childAlerts;
      })
    );

    // Flatten alerts and sort by timestamp
    const alerts = allAlertsPerChild
      .flat()
      .sort((a, b) => {
        // Critical alerts first, then warnings, then success/info
        const priorityMap: Record<string, number> = {
          critical: 0,
          warning: 1,
          success: 2,
          info: 3,
        };
        return priorityMap[a.type] - priorityMap[b.type];
      });

    return NextResponse.json({
      success: true,
      alerts,
      criticalCount: alerts.filter((a) => a.type === "critical").length,
      warningCount: alerts.filter((a) => a.type === "warning").length,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
