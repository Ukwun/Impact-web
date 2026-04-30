/**
 * Projects API Route
 * /api/projects - Project showcase system endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, roleMiddleware } from "@/lib/auth-service";
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get("projectId");
    const filter = searchParams.get("filter") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "10", 10);

    if (projectId) {
      return getProjectDetail(projectId, authResult);
    }

    // Query ContentMetadata for projects
    const where: any = { contentType: "PROJECT", isPublished: true };
    if (filter === "my") {
      where["resourceId"] = authResult.userId;
    }
    // Add more filters as needed (e.g., featured, showcased)

    const [projects, total] = await Promise.all([
      prisma.contentMetadata.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.contentMetadata.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page,
          perPage,
          totalPages: Math.ceil(total / perPage),
        },
      },
    });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    // Only students can create projects
    const roleCheck = await roleMiddleware(request, ["STUDENT"]);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }
    const body = await request.json();
    const {
      title,
      shortDescription,
      longDescription,
      courseId,
      thumbnail,
      learningObjectives,
      competencies,
      visibility = "PUBLIC",
      publishedAt,
    } = body;

    // Create project as ContentMetadata
    const project = await prisma.contentMetadata.create({
      data: {
        resourceType: "PROJECT",
        resourceId: authResult.userId,
        title,
        shortDescription,
        longDescription,
        thumbnail,
        courseId,
        learningObjectives,
        competencies,
        contentType: "PROJECT",
        isPublished: true,
        publishedAt: publishedAt || new Date(),
        // Add more fields as needed
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      data: project,
    }, { status: 201 });
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}

async function getProjectDetail(projectId: string, authResult: any) {
  // Fetch project detail from ContentMetadata
  const project = await prisma.contentMetadata.findUnique({
    where: { id: projectId, contentType: "PROJECT" },
  });
  if (!project) {
    return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: project });
}
            { criteria: "Code Quality", score: 9, maxScore: 10 },
            { criteria: "Documentation", score: 8, maxScore: 10 },
          ],
        },
        {
          id: "review-2",
          reviewer: "James Brown",
          rating: 4.5,
          comment: "Great project! Could improve error handling",
          rubricScores: [
            { criteria: "Functionality", score: 9, maxScore: 10 },
            { criteria: "Code Quality", score: 8, maxScore: 10 },
            { criteria: "Documentation", score: 9, maxScore: 10 },
          ],
        },
      ],
      engagement: {
        views: 432,
        likes: 89,
        comments: 23,
      },
      canEdit: authResult.user.id === "student-1",
      canReview: authResult.user.role === "STUDENT" || authResult.user.role === "FACILITATOR",
    },
  };

  return NextResponse.json(projectDetail);
}
