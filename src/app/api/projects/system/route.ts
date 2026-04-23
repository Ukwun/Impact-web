import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const projects = [
    {
      id: "project-growth-cart-001",
      title: "School Market Day Revenue Tracker",
      description: "A simple tracker built to record sales, cost, and daily profit for the class market day.",
      courseId: "course-enterprise-basics",
      courseName: "Enterprise Practice",
      status: "SHOWCASED",
      startDate: "2026-02-10",
      dueDate: "2026-04-30",
      completionDate: "2026-04-16",
      category: "Finance",
      difficulty: "BEGINNER",
      owner: { id: "learner-1", name: "Amina Bello" },
      collaborators: [{ id: "learner-2", name: "David James", role: "Data Recorder" }],
      files: [
        {
          id: "file-1",
          type: "DOCUMENT",
          title: "Tracker Template",
          url: "/dashboard/resources/library",
          fileSize: "350KB",
          uploadedDate: "2026-04-15",
          description: "Template used in the showcase",
        },
      ],
      description_full:
        "This project demonstrates practical application of budgeting, tracking, and simple reporting during a school market simulation.",
      learningOutcomes: ["Revenue vs cost clarity", "Daily record keeping", "Team accountability"],
      techniquesUsed: ["Spreadsheet design", "Data capture", "Reflection journaling"],
      grade: 92,
      feedback: {
        overallGrade: 92,
        rubricScores: [
          { criteria: "Accuracy", maxPoints: 40, earnedPoints: 36, feedback: "Strong consistency" },
          { criteria: "Presentation", maxPoints: 30, earnedPoints: 28 },
          { criteria: "Insight", maxPoints: 30, earnedPoints: 28 },
        ],
        instructorComments: "Clear, practical, and highly relevant output.",
        peerReviews: [
          {
            reviewerId: "peer-1",
            reviewerName: "Hauwa Okon",
            date: "2026-04-17",
            rating: 5,
            comment: "Helpful and easy to use",
            helpful: 6,
          },
        ],
        suggestedImprovements: ["Add weekend trend summary"],
      },
      views: 264,
      likes: 41,
      isLiked: false,
      isFeatured: true,
      visibility: "PUBLIC",
    },
    {
      id: "project-savings-habit-002",
      title: "Primary Savings Challenge Journal",
      description: "Weekly habit log for saving before spending.",
      courseId: "course-money-habits",
      courseName: "My Money Habits",
      status: "IN_DEVELOPMENT",
      startDate: "2026-03-06",
      dueDate: "2026-05-05",
      category: "Habit Building",
      difficulty: "BEGINNER",
      owner: { id: "learner-1", name: "Amina Bello" },
      collaborators: [],
      files: [],
      description_full:
        "A progress journal that helps younger learners visualize daily saving decisions and delayed gratification.",
      learningOutcomes: ["Needs vs wants", "Saving discipline"],
      techniquesUsed: ["Journaling", "Story cards"],
      views: 89,
      likes: 14,
      isLiked: false,
      isFeatured: false,
      visibility: "COURSE_ONLY",
    },
    {
      id: "project-community-003",
      title: "Community Problem-Solving Pitch",
      description: "A team pitch focused on a community service micro-enterprise idea.",
      courseId: "course-leadership-action",
      courseName: "Leadership in Action",
      status: "REVIEW",
      startDate: "2026-02-25",
      dueDate: "2026-04-29",
      category: "Leadership",
      difficulty: "INTERMEDIATE",
      owner: { id: "learner-3", name: "Kene Obi" },
      collaborators: [
        { id: "learner-1", name: "Amina Bello", role: "Team Lead" },
        { id: "learner-4", name: "Grace Adu", role: "Presenter" },
      ],
      files: [],
      description_full:
        "Project combines ethics, teamwork, and cost estimation into a practical community-focused challenge.",
      learningOutcomes: ["Ethical decision making", "Teamwork", "Pitch communication"],
      techniquesUsed: ["Simulation", "Presentation", "Peer feedback"],
      views: 141,
      likes: 28,
      isLiked: true,
      isFeatured: false,
      visibility: "PUBLIC",
    },
  ];

  const portfolio = {
    studentId: authResult.user.id,
    profileUrl: `/portfolio/${authResult.user.id}`,
    bio: "I build practical projects that connect finance habits, enterprise ideas, and community value.",
    skills: ["Budgeting", "Record keeping", "Pitching", "Team collaboration"],
    completedProjects: projects.filter((p) => p.status === "SHOWCASED"),
    currentProjects: projects.filter((p) => p.status !== "SHOWCASED" && p.status !== "ARCHIVED"),
    showcases: [
      {
        id: "showcase-monthly-001",
        name: "Monthly Learner Showcase",
        description: "Top cross-level submissions from this month",
        type: "SCHOOL_SHOWCASE",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
        featuredProjects: projects.filter((p) => p.isFeatured),
        participantCount: 42,
        viewCount: 2200,
        status: "LIVE",
        theme: "Practical Money and Enterprise Skills",
        requirements: ["Include reflection", "Include evidence of application"],
      },
    ],
    stats: {
      totalProjects: projects.length,
      skillsDeveloped: 4,
      likeCount: projects.reduce((sum, p) => sum + p.likes, 0),
      viewCount: projects.reduce((sum, p) => sum + p.views, 0),
    },
    collaborationScore: 84,
  };

  return NextResponse.json({
    success: true,
    data: {
      projects,
      portfolio,
      showcases: portfolio.showcases,
      recommendations: projects.filter((p) => !p.isFeatured).slice(0, 2),
      comments: [
        {
          id: "comment-1",
          author: { id: "peer-7", name: "Samuel Kay" },
          text: "Great practical application. Could you add one more chart for weekly trend?",
          timestamp: new Date().toISOString(),
          replies: [],
          likes: 3,
          isLiked: false,
        },
      ],
    },
  });
}
