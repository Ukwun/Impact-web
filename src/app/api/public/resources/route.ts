import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

/**
 * GET /api/public/resources
 * Get learning resources (public endpoint)
 * Includes guides, tutorials, documents, and tools
 */
export async function GET(req: NextRequest) {
  try {
    // For now, return mock resources
    // In production, these could be stored in database
    const resources = {
      guides: [
        {
          id: "1",
          title: "Getting Started Guide",
          description: "Learn the basics of the platform",
          category: "Getting Started",
          type: "guide" as const,
          views: 1250,
        },
        {
          id: "2",
          title: "Course Navigation Guide",
          description: "Navigate courses and lessons efficiently",
          category: "Navigation",
          type: "guide" as const,
          views: 890,
        },
        {
          id: "3",
          title: "Account Setup & Profile",
          description: "Complete your profile and set preferences",
          category: "Getting Started",
          type: "guide" as const,
          views: 1450,
        },
      ],
      tutorials: [
        {
          id: "4",
          title: "How to Complete an Assignment",
          description: "Step-by-step guide for submitting assignments",
          category: "Assignments",
          type: "video" as const,
          views: 2100,
        },
        {
          id: "5",
          title: "Taking Quizzes Successfully",
          description: "Tips and tricks for quiz preparation",
          category: "Assessments",
          type: "video" as const,
          views: 1560,
        },
        {
          id: "6",
          title: "Using the Learning Dashboard",
          description: "Track your progress and achievements",
          category: "Features",
          type: "video" as const,
          views: 980,
        },
      ],
      documents: [
        {
          id: "7",
          title: "Platform Terms of Service",
          description: "Terms and conditions",
          category: "Legal",
          type: "document" as const,
          downloadUrl: "/downloads/terms.pdf",
        },
        {
          id: "8",
          title: "Privacy Policy",
          description: "How we handle your data",
          category: "Legal",
          type: "document" as const,
          downloadUrl: "/downloads/privacy.pdf",
        },
        {
          id: "9",
          title: "Community Guidelines",
          description: "Rules and expectations for community members",
          category: "Community",
          type: "document" as const,
          downloadUrl: "/downloads/guidelines.pdf",
        },
      ],
      tools: [
        {
          id: "10",
          title: "Learning Path Builder",
          description: "Create a personalized learning path",
          category: "Tools",
          type: "tool" as const,
          url: "/dashboard/resources/learning-path",
        },
        {
          id: "11",
          title: "Progress Tracker",
          description: "Track your learning progress",
          category: "Tools",
          type: "tool" as const,
          url: "/dashboard/progress",
        },
        {
          id: "12",
          title: "Study Schedule Planner",
          description: "Plan your study sessions effectively",
          category: "Tools",
          type: "tool" as const,
          url: "/dashboard/resources/study-planner",
        },
      ],
    };

    const response = NextResponse.json({
      success: true,
      data: resources,
    });

    return addCorsHeaders(response, req.headers.get("origin") || undefined);
  } catch (error) {
    console.error("❌ Error fetching resources:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
