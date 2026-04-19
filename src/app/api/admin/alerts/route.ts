import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/admin/alerts
 * Get system alerts from database
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
    const includeResolved = req.nextUrl.searchParams.get("includeResolved") === "true";

    // Build query filter
    const where: any = {
      resolved: includeResolved ? undefined : false,
    };

    if (severity !== "all") {
      where.severity = severity.toUpperCase();
    }

    // Fetch alerts from database
    const allAlerts = await prisma.systemAlert.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by severity for response format
    const critical = allAlerts.filter((a) => a.severity === "CRITICAL");
    const warnings = allAlerts.filter((a) => a.severity === "WARNING");
    const info = allAlerts.filter((a) => a.severity === "INFO");

    // Convert severity enum to lowercase for frontend compatibility
    const formatAlert = (alert: any) => ({
      ...alert,
      severity: alert.severity.toLowerCase(),
      timestamp: alert.createdAt.toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        critical: critical.map(formatAlert),
        warnings: warnings.map(formatAlert),
        info: info.map(formatAlert),
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
 * POST /api/admin/alerts
 * Create a new system alert
 * Admin only endpoint (for manual alert creation)
 */
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, message, severity = "INFO", category = "System" } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "title and message are required" },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ["CRITICAL", "WARNING", "INFO"];
    const normalizedSeverity = severity.toUpperCase();
    if (!validSeverities.includes(normalizedSeverity)) {
      return NextResponse.json(
        { success: false, error: "Invalid severity level" },
        { status: 400 }
      );
    }

    // Create alert in database
    const alert = await prisma.systemAlert.create({
      data: {
        title,
        message,
        severity: normalizedSeverity as any,
        category,
        source: "manual",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...alert,
        severity: alert.severity.toLowerCase(),
        timestamp: alert.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error creating alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
