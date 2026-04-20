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
    if (!payload || payload.role !== "CIRCLE_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ MOCK DATA
    const mockData = {
      success: true,
      data: {
        joinedCommunities: [
          {
            id: "c1",
            name: "Tech Innovators",
            members: 243,
            isMember: true,
            focusArea: "Technology & Innovation",
          },
          {
            id: "c2",
            name: "Startup Founders",
            members: 156,
            isMember: true,
            focusArea: "Entrepreneurship",
          },
          {
            id: "c3",
            name: "Design Enthusiasts",
            members: 89,
            isMember: true,
            focusArea: "Design & UX",
          },
        ],
        recentDiscussions: [
          {
            id: "d1",
            communityName: "Tech Innovators",
            title: "Best practices for AI integration",
            author: "Sarah Chen",
            replies: 24,
            createdAt: "2026-04-20T10:30:00Z",
          },
          {
            id: "d2",
            communityName: "Startup Founders",
            title: "Funding strategies for seed stage",
            author: "Marcus Brown",
            replies: 18,
            createdAt: "2026-04-19T14:45:00Z",
          },
          {
            id: "d3",
            communityName: "Design Enthusiasts",
            title: "Latest design trends",
            author: "Alex Johnson",
            replies: 12,
            createdAt: "2026-04-19T09:15:00Z",
          },
        ],
        suggestedMembers: [
          {
            id: "m1",
            name: "Jordan Lee",
            expertise: ["AI", "Machine Learning", "Data Science"],
            isMutualsConnection: true,
          },
          {
            id: "m2",
            name: "Casey Morgan",
            expertise: ["Product Management", "Strategy"],
            isMutualsConnection: false,
          },
        ],
        unreadMessages: 5,
        contributionScore: 342,
        communityCount: {
          joined: 3,
          suggested: 12,
        },
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error in circle dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
