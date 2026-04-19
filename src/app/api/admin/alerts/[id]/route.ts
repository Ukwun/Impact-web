import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/admin/alerts/[id]
 * Get a specific alert by ID
 * Admin only endpoint
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const alertId = params.id;

    const alert = await prisma.systemAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...alert,
        severity: alert.severity.toLowerCase(),
        timestamp: alert.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alert" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/alerts/[id]
 * Update an alert (resolve, unresolve, etc.)
 * Admin only endpoint
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const alertId = params.id;
    const body = await req.json();
    const { resolved, title, message, severity, category } = body;

    // Verify alert exists
    const existingAlert = await prisma.systemAlert.findUnique({
      where: { id: alertId },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (resolved !== undefined) {
      updateData.resolved = resolved;
      if (resolved) {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }
    }
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (severity !== undefined) updateData.severity = severity.toUpperCase();
    if (category !== undefined) updateData.category = category;

    // Update in database
    const updatedAlert = await prisma.systemAlert.update({
      where: { id: alertId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedAlert,
        severity: updatedAlert.severity.toLowerCase(),
        timestamp: updatedAlert.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error updating alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/alerts/[id]
 * Dismiss/resolve a specific alert (marks as resolved)
 * Admin only endpoint
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const alertId = params.id;

    // Verify alert exists
    const alert = await prisma.systemAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    // Mark as resolved instead of deleting
    const updatedAlert = await prisma.systemAlert.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    console.log(`✅ Alert ${alertId} marked as resolved`);

    return NextResponse.json({
      success: true,
      message: "Alert dismissed successfully",
      data: {
        ...updatedAlert,
        severity: updatedAlert.severity.toLowerCase(),
        timestamp: updatedAlert.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error dismissing alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dismiss alert" },
      { status: 500 }
    );
  }
}
