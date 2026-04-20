import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ MOCK DATA
    const mockData = {
      success: true,
      data: {
        children: [
          {
            id: "child1",
            name: "Emma Johnson",
            age: 10,
            enrolledCourses: 3,
            averageGrade: 87,
            completionRate: 92,
          },
          {
            id: "child2",
            name: "Lucas Johnson",
            age: 8,
            enrolledCourses: 2,
            averageGrade: 79,
            completionRate: 78,
          },
        ],
        alerts: [
          {
            childId: "child1",
            childName: "Emma Johnson",
            message: "Excellent work on the Math assignment!",
            type: "success",
          },
          {
            childId: "child2",
            childName: "Lucas Johnson",
            message: "Needs support with Reading comprehension",
            type: "warning",
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error in parent dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
