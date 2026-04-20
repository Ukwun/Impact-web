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
    if (!payload || payload.role !== "FACILITATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ MOCK DATA - Return immediately without database queries
    const mockData = {
      success: true,
      data: {
        coursesTaught: [
          {
            id: "c1",
            title: "Introduction to React",
            enrolledStudents: 24,
            pendingSubmissions: 3,
            averageGrade: 82,
          },
          {
            id: "c2",
            title: "Advanced TypeScript",
            enrolledStudents: 18,
            pendingSubmissions: 5,
            averageGrade: 76,
          },
          {
            id: "c3",
            title: "Web Design Fundamentals",
            enrolledStudents: 31,
            pendingSubmissions: 2,
            averageGrade: 88,
          },
        ],
        pendingSubmissions: [
          {
            id: "s1",
            studentName: "Alex Brown",
            courseTitle: "Introduction to React",
            assignmentTitle: "Build a Todo App",
            submittedAt: new Date().toISOString(),
          },
          {
            id: "s2",
            studentName: "Sarah Wilson",
            courseTitle: "Advanced TypeScript",
            assignmentTitle: "Type System Challenge",
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        totalStudents: 73,
        averageClassGrade: 82,
        completionRate: 76,
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error in facilitator dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
