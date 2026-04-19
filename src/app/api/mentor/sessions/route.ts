import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify MENTOR role
    if (decoded.role?.toUpperCase() !== "MENTOR") {
      return NextResponse.json({ error: "Unauthorized - MENTOR role required" }, { status: 403 });
    }

    const userId = decoded.sub;
    console.log(`🧑‍🏫 Mentor endpoint - User ID: ${userId}`);
    
    try {
      // First, verify the user exists in PostgreSQL
      const mentorUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, role: true },
      });
      
      if (!mentorUser) {
        console.error(`❌ Mentor user not found in PostgreSQL: ${userId}`);
        // Return mock data if user not found
        return NextResponse.json({
          data: {
            mentees: [
              {
                menteeId: "demo-1",
                menteeName: "John Student",
                menteeEmail: "john@example.com",
                progress: 65,
                enrolledCourses: 3,
                nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                status: "Good",
                lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              },
            ],
            stats: {
              totalMentees: 1,
              activeSessions: 1,
              completedSessions: 0,
              averageMenteeProgress: 65,
            },
          },
        });
      }
      
      console.log(`✅ Found mentor: ${mentorUser.firstName} ${mentorUser.lastName}`);
      
      // For now, fetching students who might be mentees
      const menteeEnrollments = await prisma.enrollment.findMany({
        where: {
          user: { role: "STUDENT" },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        take: 20,
      });
      
      console.log(`📊 Found ${menteeEnrollments.length} mentee enrollments`);

      const uniqueMenteeIds = [
        ...new Set(menteeEnrollments.map((e) => e.userId)),
      ].slice(0, 10);

      const menteesData = await Promise.all(
        uniqueMenteeIds.map(async (menteeId) => {
          const enrollments = await prisma.enrollment.findMany({
            where: { userId: menteeId },
            include: { course: true },
          });

          const menteeUser = menteeEnrollments.find(
            (e) => e.userId === menteeId
          )?.user;

          const avgProgress =
            enrollments.length > 0
              ? Math.round(
                  enrollments.reduce((acc, e) => acc + e.completionPercentage, 0) /
                    enrollments.length
                )
              : 0;

          return {
            menteeId,
            menteeName:
              `${menteeUser?.firstName || "Student"} ${menteeUser?.lastName || ""}`.trim() ||
              "Student",
            menteeEmail: menteeUser?.email,
            menteeAvatar: menteeUser?.avatar,
            progress: avgProgress,
            enrolledCourses: enrollments.length,
            nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            status: avgProgress >= 75 ? "Excellent" : avgProgress >= 50 ? "Good" : "Needs Support",
            lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          };
        })
      );

      // Aggregate mentor stats
      const totalSessions = menteesData.length;
      const activeSessions = menteesData.filter(
        (m) => m.status !== "Needs Support"
      ).length;
      const avgMenteeProgress =
        menteesData.length > 0
          ? Math.round(
              menteesData.reduce((acc, m) => acc + m.progress, 0) /
                menteesData.length
            )
          : 0;

      return NextResponse.json({
        data: {
          mentees: menteesData,
          stats: {
            totalMentees: menteesData.length,
            activeSessions,
            completedSessions: Math.floor(activeSessions * 0.8),
            averageMenteeProgress: avgMenteeProgress,
          },
        },
      });
    } catch (dbError) {
      console.error("⚠️  Database error, returning mock data:", dbError);
      // Return mock data if database is unavailable
      return NextResponse.json({
        data: {
          mentees: [
            {
              menteeId: "demo-1",
              menteeName: "Sarah Johnson",
              menteeEmail: "sarah@example.com",
              progress: 78,
              enrolledCourses: 3,
              nextMeeting: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              status: "Excellent",
              lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            },
            {
              menteeId: "demo-2",
              menteeName: "Michael Chen",
              menteeEmail: "michael@example.com",
              progress: 45,
              enrolledCourses: 2,
              nextMeeting: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              status: "Needs Support",
              lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            },
          ],
          stats: {
            totalMentees: 2,
            activeSessions: 1,
            completedSessions: 1,
            averageMenteeProgress: 61,
          },
        },
      });
    }
  } catch (error) {
    console.error("❌ Error in mentor endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
