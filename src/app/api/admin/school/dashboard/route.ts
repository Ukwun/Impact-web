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
    if (!payload || payload.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ MOCK DATA
    const mockData = {
      success: true,
      data: {
        schoolName: "Lincoln High School",
        stats: {
          totalStudents: 324,
          totalFacilitators: 18,
          totalCourses: 42,
          averageCompletion: 78,
          schoolHealth: 87,
        },
        pendingApprovals: [
          {
            id: "p1",
            userName: "Sarah Mitchell",
            role: "TEACHER",
            registeredAt: "2026-04-19T10:30:00Z",
          },
          {
            id: "p2",
            userName: "Marcus Thompson",
            role: "STUDENT",
            registeredAt: "2026-04-20T14:15:00Z",
          },
        ],
        topCourses: [
          { title: "Biology 101", enrollment: 45, completion: 82 },
          { title: "English Literature", enrollment: 38, completion: 76 },
          { title: "Mathematics II", enrollment: 52, completion: 68 },
        ],
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error in school admin dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
