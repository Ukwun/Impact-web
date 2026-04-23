/**
 * Facilitator Dashboard API Route
 * /api/dashboard/facilitator - Get facilitator-specific dashboard data
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, roleMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Only facilitators can access this
    const roleCheck = await roleMiddleware(request, ["FACILITATOR"]);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    // TODO: Fetch facilitator's courses from database
    // const facilitatorProfile = await prisma.facilitatorProfile.findUnique({
    //   where: { userId: authResult.user.id },
    //   include: { courses: true }
    // });

    const facilitatorDashboard = {
      success: true,
      data: {
        facilitator: {
          id: authResult.user.id,
          name: "Dr. Sarah Wilson",
          email: "sarah.wilson@school.edu",
          department: "Mathematics",
          officeHours: "Mon & Wed 3-5 PM",
        },
        coursesSummary: [
          {
            id: "course-1",
            name: "Advanced Mathematics 101",
            section: "A",
            enrollments: 28,
            schedule: "MWF 9:00 AM",
            status: "Active",
            nextClass: "2026-04-21",
          },
          {
            id: "course-2",
            name: "Calculus II",
            section: "B",
            enrollments: 25,
            schedule: "TTH 10:30 AM",
            status: "Active",
            nextClass: "2026-04-22",
          },
          {
            id: "course-3",
            name: "Statistics Basics",
            section: "C",
            enrollments: 22,
            schedule: "MWF 1:00 PM",
            status: "Active",
            nextClass: "2026-04-21",
          },
        ],
        pendingTasks: [
          {
            id: "task-1",
            type: "GRADING",
            description: "Grade 12 assignments from Advanced Math 101",
            dueDate: "2026-04-22",
            course: "Advanced Mathematics 101",
            count: 12,
            priority: "HIGH",
          },
          {
            id: "task-2",
            type: "ASSIGNMENT",
            description: "Create quiz for next week's lesson",
            dueDate: "2026-04-24",
            course: "Calculus II",
            priority: "MEDIUM",
          },
          {
            id: "task-3",
            type: "FEEDBACK",
            description: "Provide written feedback on student projects",
            dueDate: "2026-04-25",
            course: "Statistics Basics",
            count: 8,
            priority: "MEDIUM",
          },
        ],
        studentPerformance: [
          {
            courseId: "course-1",
            courseName: "Advanced Mathematics 101",
            performanceData: {
              averageGrade: 85.2,
              gradeDistribution: {
                "A (90-100)": 8,
                "B (80-89)": 12,
                "C (70-79)": 6,
                "D (60-69)": 2,
                "F (Below 60)": 0,
              },
              attendanceRate: 94,
              assignmentCompletionRate: 92,
              discussionParticipation: 78,
            },
            atRiskStudents: [
              {
                id: "student-45",
                name: "Marcus Johnson",
                currentGrade: 65,
                attendance: 72,
                lastSubmission: "3 days ago",
                concern: "Consistent low performance",
              },
              {
                id: "student-78",
                name: "Jessica Chen",
                currentGrade: 72,
                attendance: 68,
                lastSubmission: "5 days ago",
                concern: "Low attendance affecting performance",
              },
            ],
          },
          {
            courseId: "course-2",
            courseName: "Calculus II",
            performanceData: {
              averageGrade: 82.1,
              gradeDistribution: {
                "A (90-100)": 6,
                "B (80-89)": 14,
                "C (70-79)": 4,
                "D (60-69)": 1,
                "F (Below 60)": 0,
              },
              attendanceRate: 96,
              assignmentCompletionRate: 95,
              discussionParticipation: 82,
            },
            atRiskStudents: [],
          },
          {
            courseId: "course-3",
            courseName: "Statistics Basics",
            performanceData: {
              averageGrade: 88.3,
              gradeDistribution: {
                "A (90-100)": 12,
                "B (80-89)": 8,
                "C (70-79)": 2,
                "D (60-69)": 0,
                "F (Below 60)": 0,
              },
              attendanceRate: 98,
              assignmentCompletionRate: 98,
              discussionParticipation: 88,
            },
            atRiskStudents: [],
          },
        ],
        upcomingLessons: [
          {
            id: "lesson-1",
            course: "Advanced Mathematics 101",
            date: "2026-04-21",
            time: "9:00 AM",
            topic: "Applications of Quadratic Equations",
            prepared: true,
            resources: ["Lesson slides", "practice problems", "video tutorial"],
            studentCount: 28,
          },
          {
            id: "lesson-2",
            course: "Calculus II",
            date: "2026-04-22",
            time: "10:30 AM",
            topic: "Integration Techniques",
            prepared: false,
            resources: ["Need to create slides"],
            studentCount: 25,
          },
          {
            id: "lesson-3",
            course: "Statistics Basics",
            date: "2026-04-21",
            time: "1:00 PM",
            topic: "Probability Distributions",
            prepared: true,
            resources: ["Interactive tool", "datasets", "worksheet"],
            studentCount: 22,
          },
        ],
        studentActivity: [
          {
            date: "2026-04-20",
            activeStudents: 73,
            assignmentsSubmitted: 18,
            discussionPosts: 34,
            resourcesAccessed: 156,
          },
          {
            date: "2026-04-19",
            activeStudents: 68,
            assignmentsSubmitted: 16,
            discussionPosts: 29,
            resourcesAccessed: 142,
          },
          {
            date: "2026-04-18",
            activeStudents: 71,
            assignmentsSubmitted: 22,
            discussionPosts: 38,
            resourcesAccessed: 168,
          },
        ],
        recentSubmissions: [
          {
            id: "sub-1",
            studentName: "Emma Smith",
            course: "Advanced Mathematics 101",
            assignment: "Chapter 5 Homework",
            submittedDate: "2026-04-20",
            status: "SUBMITTED",
            grade: null,
            daysLate: 0,
          },
          {
            id: "sub-2",
            studentName: "James Brown",
            course: "Calculus II",
            assignment: "Integration Practice",
            submittedDate: "2026-04-19",
            status: "SUBMITTED",
            grade: 88,
            daysLate: 0,
          },
          {
            id: "sub-3",
            studentName: "Lisa Wang",
            course: "Statistics Basics",
            assignment: "Data Analysis Project",
            submittedDate: "2026-04-18",
            status: "SUBMITTED",
            grade: null,
            daysLate: 0,
          },
        ],
        classroomChat: [
          {
            id: "chat-1",
            course: "Advanced Mathematics 101",
            recentMessages: 12,
            unreadMessages: 3,
            lastActivity: "1 hour ago",
          },
          {
            id: "chat-2",
            course: "Calculus II",
            recentMessages: 8,
            unreadMessages: 0,
            lastActivity: "3 hours ago",
          },
          {
            id: "chat-3",
            course: "Statistics Basics",
            recentMessages: 15,
            unreadMessages: 5,
            lastActivity: "30 minutes ago",
          },
        ],
        peerCodeReviewQueue: [
          {
            id: "review-1",
            studentName: "Alex Johnson",
            course: "Computer Science",
            projectTitle: "Python Data Analysis",
            submittedDate: "2026-04-18",
            status: "PENDING",
            reviewersAssigned: 2,
          },
          {
            id: "review-2",
            studentName: "Sophie Chen",
            course: "Computer Science",
            projectTitle: "Web Application",
            submittedDate: "2026-04-19",
            status: "IN_REVIEW",
            reviewersAssigned: 2,
          },
        ],
      },
    };

    return NextResponse.json(facilitatorDashboard);
  } catch (error) {
    console.error("Facilitator dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch facilitator dashboard" },
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

    const roleCheck = await roleMiddleware(request, ["FACILITATOR"]);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    const { pathname } = request.nextUrl;

    if (pathname.includes("/grade")) {
      return handleGradeSubmission(request, authResult);
    } else if (pathname.includes("/feedback")) {
      return handleFeedbackSubmission(request, authResult);
    }

    return NextResponse.json(
      { success: false, error: "Invalid operation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Facilitator POST error:", error);
    return NextResponse.json(
      { success: false, error: "Operation failed" },
      { status: 500 }
    );
  }
}

async function handleGradeSubmission(request: NextRequest, authResult: any) {
  const body = await request.json();
  const { submissionId, grade, rubricScores } = body;

  // TODO: Update submission grade in database
  // await prisma.submission.update({
  //   where: { id: submissionId },
  //   data: { grade, status: 'GRADED', rubricScores }
  // });

  return NextResponse.json({
    success: true,
    message: "Grade submitted successfully",
    data: {
      submissionId,
      grade,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleFeedbackSubmission(request: NextRequest, authResult: any) {
  const body = await request.json();
  const { submissionId, feedback, isRubricBased } = body;

  // TODO: Save feedback in database
  // await prisma.submission.update({
  //   where: { id: submissionId },
  //   data: { feedback }
  // });

  return NextResponse.json({
    success: true,
    message: "Feedback submitted successfully",
    data: {
      submissionId,
      feedbackType: isRubricBased ? "RUBRIC" : "COMMENT",
      timestamp: new Date().toISOString(),
    },
  });
}
