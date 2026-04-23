/**
 * Admin Dashboard API Route
 * /api/dashboard/admin - Get admin/school admin dashboard data
 */

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, roleMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Only admins can access this
    const roleCheck = await roleMiddleware(request, ["ADMIN", "SUPER_ADMIN", "SCHOOL_ADMIN"]);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    const { searchParams } = request.nextUrl;
    const tab = searchParams.get("tab") || "overview";
    const timeRange = searchParams.get("timeRange") || "week";

    // TODO: Fetch actual data from database based on role
    // Level 1: SUPER_ADMIN - all schools
    // Level 2: ADMIN - assigned school
    // Level 3: SCHOOL_ADMIN - only own school data

    const adminDashboard = {
      success: true,
      data: {
        school: {
          id: "school-1",
          name: "Central High School",
          totalStudents: 1240,
          totalFacilitators: 45,
          totalCourses: 32,
          academicYear: "2025-2026",
        },
        overview: {
          activeStudents: 1180,
          activeCourses: 28,
          totalEnrollments: 3420,
          averageAttendance: 94.2,
          averageGPA: 3.6,
          completionRate: 87.3,
          atRiskStudents: 23,
        },
        atRiskAlerts: [
          {
            id: "alert-1",
            studentName: "Marcus Johnson",
            studentId: "student-45",
            severity: "HIGH",
            type: "STUDENT_AT_RISK",
            reason: "Low attendance (68%) and declining grades",
            courses: ["Mathematics", "English"],
            lastActivity: "2 days ago",
            interventions: [
              { date: "2026-04-18", action: "Counselor meeting", assigned: "Dr. Williams" },
            ],
            recommended: ["Tutoring", "Attendance intervention", "Parent contact"],
          },
          {
            id: "alert-2",
            studentName: "Jessica Chen",
            studentId: "student-78",
            severity: "MEDIUM",
            type: "LOW_ATTENDANCE",
            reason: "Attendance below 80%",
            courses: ["Physics"],
            lastActivity: "1 day ago",
            interventions: [],
            recommended: ["Parent notification", "Attendance plan"],
          },
          {
            id: "alert-3",
            studentName: "David Smith",
            studentId: "student-102",
            severity: "LOW",
            type: "COURSE_DELAY",
            reason: "Behind on assignments in Biology",
            courses: ["Biology"],
            lastActivity: "3 days ago",
            interventions: [],
            recommended: ["Extension offered", "Study group referral"],
          },
        ],
        courseOverview: [
          {
            id: "course-1",
            name: "Advanced Mathematics",
            facilitator: "Dr. Sarah Wilson",
            enrollments: 142,
            averageGrade: 85.3,
            completionRate: 92,
            status: "On Track",
            alerts: 2,
          },
          {
            id: "course-2",
            name: "World History",
            facilitator: "Mr. James Peterson",
            enrollments: 128,
            averageGrade: 82.1,
            completionRate: 88,
            status: "Monitor",
            alerts: 5,
          },
          {
            id: "course-3",
            name: "English Literature",
            facilitator: "Ms. Emily Brown",
            enrollments: 135,
            averageGrade: 87.6,
            completionRate: 94,
            status: "Excellent",
            alerts: 1,
          },
        ],
        analyticsData: {
          timeRange,
          enrollment: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            data: [1100, 1130, 1155, 1180],
          },
          performance: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            gpa: [3.52, 3.55, 3.58, 3.60],
            completionRate: [84, 85, 86, 87],
          },
          attendance: {
            present: 1110,
            absent: 35,
            late: 25,
            excused: 10,
          },
          gradeDistribution: {
            "A (90-100)": 380,
            "B (80-89)": 520,
            "C (70-79)": 220,
            "D (60-69)": 45,
            "F (Below 60)": 15,
          },
        },
        activityTrends: [
          {
            date: "2026-04-20",
            activeStudents: 950,
            assignmentsSubmitted: 342,
            discussionPosts: 127,
            resourcesAccessed: 2840,
          },
          {
            date: "2026-04-19",
            activeStudents: 890,
            assignmentsSubmitted: 318,
            discussionPosts: 105,
            resourcesAccessed: 2650,
          },
          {
            date: "2026-04-18",
            activeStudents: 920,
            assignmentsSubmitted: 334,
            discussionPosts: 118,
            resourcesAccessed: 2780,
          },
        ],
        facilitatorStats: {
          totalActive: 43,
          coursesMissing: 2,
          gradesNotSubmitted: 8,
          averageResponsiveness: 92,
          topPerformers: [
            { name: "Dr. Sarah Wilson", courses: 3, studentSatisfaction: 4.8, engagement: 96 },
            { name: "Ms. Emily Brown", courses: 2, studentSatisfaction: 4.7, engagement: 94 },
            { name: "Mr. James Peterson", courses: 3, studentSatisfaction: 4.5, engagement: 89 },
          ],
        },
      },
    };

    return NextResponse.json(adminDashboard);
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin dashboard" },
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

    const roleCheck = await roleMiddleware(request, ["ADMIN", "SUPER_ADMIN", "SCHOOL_ADMIN"]);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    const { pathname } = request.nextUrl;

    if (pathname.includes("/students")) {
      return handleStudentIntervention(request, authResult);
    }

    return NextResponse.json(
      { success: false, error: "Invalid operation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json(
      { success: false, error: "Operation failed" },
      { status: 500 }
    );
  }
}

async function handleStudentIntervention(request: NextRequest, authResult: any) {
  const body = await request.json();
  const { studentId, action, interventionType, details } = body;

  // TODO: Record intervention in database
  // await prisma.alertNotification.create({
  //   data: {
  //     schoolId: authResult.school.id,
  //     studentId,
  //     type: interventionType,
  //     createdBy: authResult.user.id,
  //   }
  // });

  return NextResponse.json({
    success: true,
    message: `Intervention recorded for student ${studentId}`,
    data: {
      studentId,
      action,
      interventionType,
      timestamp: new Date().toISOString(),
      recordedBy: authResult.user.name,
    },
  });
}
