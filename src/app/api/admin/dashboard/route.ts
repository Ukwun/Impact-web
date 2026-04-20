import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin/dashboard
 * Fetch admin dashboard data with MOCK DATA
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated and has admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("❌ No authorization header");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      console.error("❌ Invalid token");
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    console.log("🔍 Admin request from user:", payload.userId, "role:", payload.role);

    // Verify admin role from token
    if (payload.role !== "ADMIN") {
      console.error("❌ User is not admin. Role:", payload.role);
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // ✅ MOCK DATA - No database queries
    const mockData = {
      success: true,
      data: {
        platformStats: {
          totalUsers: 1245,
          totalSchools: 8,
          activeToday: 342,
          systemUptime: 99.2,
        },
        systemHealth: [
          {
            name: "Database Health",
            status: "healthy",
            value: 98,
            unit: "%",
          },
          {
            name: "API Response Time",
            status: "healthy",
            value: 145,
            unit: "ms",
          },
          {
            name: "Server Load",
            status: "warning",
            value: 72,
            unit: "%",
          },
          {
            name: "Disk Usage",
            status: "healthy",
            value: 54,
            unit: "%",
          },
        ],
        recentAlerts: [
          {
            id: "alert1",
            type: "warning",
            message: "High server load detected",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            resolved: false,
          },
          {
            id: "alert2",
            type: "info",
            message: "Scheduled maintenance completed",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            resolved: true,
          },
        ],
        topSchools: [
          { name: "Lincoln High School", users: 324, courses: 42 },
          { name: "Central University", users: 287, courses: 38 },
          { name: "Tech Institute", users: 156, courses: 21 },
        ],
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("❌ Error fetching admin dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
