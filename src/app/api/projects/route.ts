/**
 * Projects API Route
 * /api/projects - Project showcase system endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, roleMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get("projectId");
    const filter = searchParams.get("filter") || "all"; // all, my, featured, showcased

    if (projectId) {
      return getProjectDetail(projectId, authResult);
    }

    // TODO: Fetch from database based on filter and role
    // const projects = await prisma.studentProject.findMany({
    //   where: { ... },
    //   include: { student: true, collaborators: true, feedback: true }
    // });

    const projectsData = {
      success: true,
      data: {
        projects: [
          {
            id: "project-1",
            title: "AI Chatbot Development",
            description: "Built an intelligent chatbot using NLP and machine learning",
            student: {
              id: "student-1",
              name: "Alex Johnson",
              grade: "Grade 10",
              avatar: "https://api.example.com/avatars/alex.jpg",
            },
            course: "Computer Science",
            status: "SHOWCASED",
            visibility: "PUBLIC",
            startDate: "2026-02-15",
            endDate: "2026-04-20",
            learningOutcomes: ["Natural Language Processing", "Machine Learning", "Python Programming"],
            grade: 95,
            thumbnail: "https://api.example.com/projects/chatbot-thumb.jpg",
            views: 432,
            likes: 89,
            comments: 23,
            collaborators: [
              { id: "user-2", name: "Sarah Lee", role: "Developer" },
              { id: "user-3", name: "Mike Chen", role: "Designer" },
            ],
          },
          {
            id: "project-2",
            title: "Sustainable City Planning Simulation",
            description: "Interactive model showing urban sustainability challenges",
            student: {
              id: "student-2",
              name: "Emma Smith",
              grade: "Grade 10",
              avatar: "https://api.example.com/avatars/emma.jpg",
            },
            course: "Social Studies",
            status: "SHOWCASED",
            visibility: "PUBLIC",
            startDate: "2026-03-01",
            endDate: "2026-04-18",
            learningOutcomes: ["Systems Thinking", "Urban Planning", "Data Visualization"],
            grade: 93,
            thumbnail: "https://api.example.com/projects/city-sim-thumb.jpg",
            views: 287,
            likes: 76,
            comments: 19,
            collaborators: [],
          },
          {
            id: "project-3",
            title: "Renewable Energy Analysis",
            description: "Comprehensive study of solar and wind energy efficiency",
            student: {
              id: "student-3",
              name: "James Brown",
              grade: "Grade 10",
              avatar: "https://api.example.com/avatars/james.jpg",
            },
            course: "Physics",
            status: "SHOWCASED",
            visibility: "COURSE_ONLY",
            startDate: "2026-02-20",
            endDate: "2026-04-15",
            learningOutcomes: ["Physics Principles", "Data Analysis", "Scientific Communication"],
            grade: 91,
            thumbnail: "https://api.example.com/projects/energy-thumb.jpg",
            views: 156,
            likes: 42,
            comments: 11,
            collaborators: [
              { id: "user-4", name: "Lisa Wang", role: "Researcher" },
            ],
          },
        ],
        pagination: {
          total: 142,
          page: 1,
          perPage: 10,
          totalPages: 15,
        },
      },
    };

    return NextResponse.json(projectsData);
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
    const { title, description, courseId, visibility } = body;

    // TODO: Create project in database
    // const project = await prisma.studentProject.create({
    //   data: {
    //     title,
    //     description,
    //     studentId: authResult.user.id,
    //     courseId,
    //     visibility,
    //     status: 'PLANNING'
    //   }
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: {
          id: `project-${Date.now()}`,
          title,
          description,
          courseId,
          visibility,
          status: "PLANNING",
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}

async function getProjectDetail(projectId: string, authResult: any) {
  // TODO: Fetch project detail from database
  // const project = await prisma.studentProject.findUnique({
  //   where: { id: projectId },
  //   include: { files: true, feedback: true, collaborators: true, peerReviews: true }
  // });

  const projectDetail = {
    success: true,
    data: {
      id: projectId,
      title: "AI Chatbot Development",
      description: "Built an intelligent chatbot using NLP and machine learning",
      fullDescription: `This project explores the development of an AI-powered chatbot using natural language processing techniques. 
The system is designed to understand user queries and provide intelligent responses based on trained models.`,
      student: {
        id: "student-1",
        name: "Alex Johnson",
        grade: "Grade 10",
        bio: "Passionate about AI and machine learning",
        portfolio: "https://example.com/alex-portfolio",
      },
      course: {
        id: "course-1",
        name: "Computer Science",
      },
      status: "SHOWCASED",
      visibility: "PUBLIC",
      dates: {
        start: "2026-02-15",
        end: "2026-04-20",
        duration: "8 weeks",
      },
      learningOutcomes: [
        "Natural Language Processing fundamentals",
        "Machine learning algorithms",
        "Python programming",
        "Data analysis and processing",
      ],
      grade: 95,
      feedback: "Exceptional work on implementation and testing. Great use of industry-standard libraries.",
      files: [
        { id: "file-1", name: "chatbot_code.zip", type: "CODE", size: "2.5MB" },
        { id: "file-2", name: "demo_video.mp4", type: "VIDEO", size: "45MB" },
        { id: "file-3", name: "documentation.pdf", type: "DOCUMENT", size: "3.2MB" },
      ],
      collaborators: [
        { id: "user-2", name: "Sarah Lee", role: "Developer", contribution: 40 },
        { id: "user-3", name: "Mike Chen", role: "Designer", contribution: 30 },
      ],
      peerReviews: [
        {
          id: "review-1",
          reviewer: "Emma Smith",
          rating: 5,
          comment: "Very impressive implementation with clean code structure",
          rubricScores: [
            { criteria: "Functionality", score: 9, maxScore: 10 },
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
