import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

// In-memory alert storage for now (in production, use database)
let alerts: any[] = [
  {
    id: "1",
    title: "Database Connection Error",
    message: "Connection pool exhausted. Consider increasing pool size.",
    severity: "critical",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    category: "System",
  },
  {
    id: "2",
    title: "High Error Rate Detected",
    message: "Error rate exceeds 1% threshold. Investigate API endpoints.",
    severity: "critical",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    category: "Performance",
  },
  {
    id: "3",
    title: "High Memory Usage",
    message: "Server memory usage at 85%. Consider optimization.",
    severity: "warning",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    category: "System",
  },
  {
    id: "4",
    title: "Unusual User Activity",
    message: "Spike in login attempts detected from suspicious locations.",
    severity: "warning",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    category: "Security",
  },
  {
    id: "5",
    title: "Scheduled Maintenance Completed",
    message: "Database backup completed successfully.",
    severity: "info",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    category: "System",
  },
  {
    id: "6",
    title: "New Feature Deployed",
    message: "Advanced analytics dashboard released to all users.",
    severity: "info",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    category: "Features",
  },
];

/**
 * GET /api/admin/alerts
 * Get system alerts
 * Admin only endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const severity = req.nextUrl.searchParams.get("severity") || "all";

    let filtered = alerts;
    if (severity !== "all") {
      filtered = alerts.filter((a) => a.severity === severity);
    }

    // Group by severity
    const critical = alerts.filter((a) => a.severity === "critical");
    const warnings = alerts.filter((a) => a.severity === "warning");
    const info = alerts.filter((a) => a.severity === "info");

    return NextResponse.json({
      success: true,
      data: {
        critical,
        warnings,
        info,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/alerts/[id]
 * Dismiss/resolve an alert
 * Admin only endpoint
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract alert ID from URL
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const alertId = parts[parts.length - 1];

    // Find and remove alert
    const alertIndex = alerts.findIndex((a) => a.id === alertId);
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    alerts.splice(alertIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Alert dismissed",
    });
  } catch (error) {
    console.error("❌ Error dismissing alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dismiss alert" },
      { status: 500 }
    );
  }
}
