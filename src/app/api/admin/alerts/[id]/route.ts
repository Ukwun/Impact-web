import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

// In-memory alert storage (shared with alerts route)
// In production, use database
function getAlerts() {
  // This would be retrieved from a database in production
  const alerts = [
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
  ];
  return alerts;
}

/**
 * DELETE /api/admin/alerts/[id]
 * Dismiss/resolve a specific alert
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

    // In production, delete from database
    // For now, just return success
    console.log(`✅ Alert ${alertId} dismissed`);

    return NextResponse.json({
      success: true,
      message: "Alert dismissed successfully",
    });
  } catch (error) {
    console.error("❌ Error dismissing alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dismiss alert" },
      { status: 500 }
    );
  }
}
