/**
 * Parent Dashboard API Route
 * /api/dashboard/parent - Get parent-specific dashboard data
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, roleMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Only parents can access this
    const roleCheck = await roleMiddleware(request, ["PARENT"]);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    // TODO: Fetch parent's children from database
    // const parentProfile = await prisma.parentProfile.findUnique({
    //   where: { userId: authResult.user.id },
    //   include: { children: true }
    // });

    const parentDashboard = {
      success: true,
      data: {
        parent: {
          id: authResult.user.id,
          name: "Robert Johnson",
          email: "robert@example.com",
        },
        children: [
          {
            id: "student-1",
            name: "Alex Johnson",
            grade: "Grade 10",
            school: "Central High School",
            avatar: "https://api.example.com/avatars/alex.jpg",
            activeCourses: 6,
            overallGPA: 3.75,
            currentStatus: "On Track",
          },
          {
            id: "student-2",
            name: "Sophie Johnson",
            grade: "Grade 8",
            school: "Central High School",
            avatar: "https://api.example.com/avatars/sophie.jpg",
            activeCourses: 5,
            overallGPA: 3.62,
            currentStatus: "Excellent Progress",
          },
        ],
        childrenSummary: [
          {
            childId: "student-1",
            childName: "Alex Johnson",
            activeAssignments: [
              {
                id: "assign-1",
                title: "Quadratic Equations Problem Set",
                course: "Advanced Mathematics",
                dueDate: "2026-04-25",
                status: "SUBMITTED",
                grade: 92,
              },
              {
                id: "assign-2",
                title: "Essay on Industrial Revolution",
                course: "World History",
                dueDate: "2026-04-28",
                status: "IN_PROGRESS",
                progress: 75,
              },
            ],
            recentGrades: [
              { course: "Mathematics", grade: 92, date: "2026-04-20" },
              { course: "History", grade: 88, date: "2026-04-18" },
              { course: "English", grade: 90, date: "2026-04-16" },
            ],
            weeklyStats: {
              hoursLearned: 12.5,
              assignmentsSubmitted: 3,
              absences: 0,
              participationScore: 85,
            },
            recentAchievements: [
              { title: "Quiz Master", icon: "🎯", date: "2026-04-19" },
              { title: "Math Wizard", icon: "📐", date: "2026-04-15" },
            ],
            upcomingDeadlines: [
              { title: "Physics Lab Report", dueDate: "2026-04-25", course: "Physics" },
              { title: "History Project", dueDate: "2026-04-28", course: "World History" },
            ],
            teacherComments: [
              {
                teacher: "Dr. Sarah Wilson (Mathematics)",
                comment: "Alex is doing excellent work in class. Keep it up!",
                date: "2026-04-19",
              },
              {
                teacher: "Mr. James Peterson (History)",
                comment: "Strong essay writing. Need to cite more primary sources.",
                date: "2026-04-17",
              },
            ],
          },
          {
            childId: "student-2",
            childName: "Sophie Johnson",
            activeAssignments: [
              {
                id: "assign-3",
                title: "Science Fair Project Proposal",
                course: "Biology",
                dueDate: "2026-04-23",
                status: "SUBMITTED",
                grade: 95,
              },
            ],
            recentGrades: [
              { course: "Science", grade: 95, date: "2026-04-20" },
              { course: "English", grade: 92, date: "2026-04-18" },
              { course: "Mathematics", grade: 88, date: "2026-04-16" },
            ],
            weeklyStats: {
              hoursLearned: 10.2,
              assignmentsSubmitted: 2,
              absences: 0,
              participationScore: 92,
            },
            recentAchievements: [
              { title: "Science Star", icon: "⭐", date: "2026-04-20" },
              { title: "Perfect Attendance", icon: "✅", date: "2026-04-19" },
            ],
            upcomingDeadlines: [
              { title: "Art Project", dueDate: "2026-04-24", course: "Art" },
              { title: "Language Essay", dueDate: "2026-04-26", course: "Language Arts" },
            ],
            teacherComments: [
              {
                teacher: "Ms. Emily Brown (Biology)",
                comment: "Excellent science fair proposal! Very creative ideas.",
                date: "2026-04-20",
              },
            ],
          },
        ],
        weeklyReport: {
          generatedDate: "2026-04-20",
          period: "Week of April 14-20, 2026",
          content: {
            summary: "Both children are performing well this week...",
            highlights: [
              "Alex achieved Quiz Master badge",
              "Sophie's science fair proposal received highest grade",
              "Strong participation from both children in discussions",
            ],
            areasOfConcern: [],
            recommendations: ["Continue current study habits", "Explore advanced math topics with Alex"],
          },
        },
        communicationLog: [
          {
            id: "msg-1",
            from: "Dr. Sarah Wilson",
            role: "Teacher (Mathematics)",
            subject: "Alex's Progress",
            message: "Alex is showing excellent understanding of quadratic equations...",
            date: "2026-04-19",
            read: true,
          },
          {
            id: "msg-2",
            from: "School Counselor",
            role: "Counselor",
            subject: "General Check-in",
            message: "Just checking in on how Sophie is adjusting...",
            date: "2026-04-18",
            read: false,
          },
        ],
        announcements: [
          {
            id: "ann-1",
            title: "Spring Break Assignments",
            content: "Light assignments during spring break...",
            date: "2026-04-15",
            relevantTo: "All Students",
          },
          {
            id: "ann-2",
            title: "Science Fair Registration",
            content: "Open for Year 8 and above...",
            date: "2026-04-12",
            relevantTo: "Grade 8+",
          },
        ],
        actionItems: [
          {
            id: "action-1",
            type: "PENDING_GRADE",
            description: "Awaiting grade for Alex's Physics lab report",
            dueDate: "2026-04-25",
            priority: "INFO",
          },
          {
            id: "action-2",
            type: "UPCOMING_EVENT",
            description: "Science Fair presentation on May 5th",
            dueDate: "2026-05-05",
            priority: "INFO",
          },
        ],
      },
    };

    return NextResponse.json(parentDashboard);
  } catch (error) {
    console.error("Parent dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch parent dashboard" },
      { status: 500 }
    );
  }
}
