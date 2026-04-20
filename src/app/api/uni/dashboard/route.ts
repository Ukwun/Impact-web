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
    if (!payload || payload.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ MOCK DATA
    const mockData = {
      success: true,
      data: {
        name: "Alex Rivera",
        connections: 42,
        recommendations: [
          {
            id: "p1",
            name: "Jordan Lee",
            specialization: "Software Engineer",
            location: "San Francisco, CA",
            isConnected: false,
          },
          {
            id: "p2",
            name: "Casey Morgan",
            specialization: "Product Manager",
            location: "New York, NY",
            isConnected: false,
          },
          {
            id: "p3",
            name: "Morgan Taylor",
            specialization: "Data Scientist",
            location: "Boston, MA",
            isConnected: true,
          },
        ],
        eventInvitations: [
          {
            id: "e1",
            title: "Tech Summit 2026",
            date: "2026-05-15",
            attendees: 234,
          },
          {
            id: "e2",
            title: "AI & ML Workshop",
            date: "2026-04-28",
            attendees: 87,
          },
        ],
        opportunities: [
          {
            id: "o1",
            title: "Senior Developer Position",
            type: "career",
            deadline: "2026-05-01",
          },
          {
            id: "o2",
            title: "Graduate Scholarship Program",
            type: "scholarship",
            deadline: "2026-04-25",
          },
          {
            id: "o3",
            title: "Summer Internship",
            type: "internship",
            deadline: "2026-05-10",
          },
        ],
        network: {
          total: 42,
          degree2: 347,
        },
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error in uni dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
