import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getFirestore } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

/**
 * POST /api/admin/seed
 * Seed Firestore with demo data (ADMIN ONLY)
 * Body: { seedType: 'full' | 'courses' | 'events' }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { seedType = "full" } = await req.json();
    const db = getFirestore();

    console.log(`🌱 Starting Firestore seed (type: ${seedType})...`);

    const results: any = {};

    // ============================================================================
    // SEED COURSES
    // ============================================================================
    if (seedType === "full" || seedType === "courses") {
      console.log("📚 Seeding courses...");

      const demoFacilitatorId = "demo-facilitator-001";
      const coursesData = [
        {
          title: "Financial Literacy 101",
          description: "Learn the fundamentals of personal finance, budgeting, and saving strategies.",
          difficulty: "BEGINNER",
          duration: 120,
          thumbnail: "https://images.unsplash.com/photo-1579621970563-430f63602022?w=400",
        },
        {
          title: "Entrepreneurship Essentials",
          description: "Start your entrepreneurial journey with business planning and execution.",
          difficulty: "BEGINNER",
          duration: 150,
          thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
        },
        {
          title: "Digital Marketing Mastery",
          description: "Master social media, SEO, and content marketing to grow online.",
          difficulty: "INTERMEDIATE",
          duration: 180,
          thumbnail: "https://images.unsplash.com/photo-1460925895917-adf4e0c359a1?w=400",
        },
        {
          title: "Investment & Wealth Building",
          description: "Understand stocks, bonds, and investment strategies for wealth.",
          difficulty: "INTERMEDIATE",
          duration: 200,
          thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
        },
        {
          title: "Tech Skills for Non-Techies",
          description: "Get comfortable with essential tech tools, AI, and automation.",
          difficulty: "BEGINNER",
          duration: 100,
          thumbnail: "https://images.unsplash.com/photo-1516534775068-bb57846d893f?w=400",
        },
      ];

      let courseCount = 0;
      for (const courseData of coursesData) {
        const courseRef = db.collection("courses").doc();
        const course = {
          id: courseRef.id,
          ...courseData,
          isPublished: true,
          createdBy: demoFacilitatorId,
          enrollmentCount: 0,
          ratingAverage: 0,
          ratingCount: 0,
          prerequisites: [],
          tags: ["finance", "education", "online-learning"],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await courseRef.set(course);
        courseCount++;
        console.log(`   ✓ ${course.title}`);

        // Add sample lessons
        const lessonsData = [
          { title: "Introduction", order: 1 },
          { title: "Core Concepts", order: 2 },
          { title: "Practical Application", order: 3 },
        ];

        for (const lessonData of lessonsData) {
          const lessonRef = courseRef.collection("lessons").doc();
          const lesson = {
            id: lessonRef.id,
            courseId: courseRef.id,
            ...lessonData,
            description: `Learn about ${lessonData.title.toLowerCase()}`,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            transcript: "Lesson content transcript...",
            isPublished: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          await lessonRef.set(lesson);
        }
      }

      results.coursesCreated = courseCount;
    }

    // ============================================================================
    // SEED EVENTS
    // ============================================================================
    if (seedType === "full" || seedType === "events") {
      console.log("📅 Seeding events...");

      const eventsData = [
        {
          title: "Entrepreneur Meetup Lagos",
          description: "Network with fellow entrepreneurs in Lagos.",
          type: "NETWORKING",
          location: "Lagos, Nigeria",
          capacity: 100,
        },
        {
          title: "Financial Literacy Workshop",
          description: "Interactive workshop on personal finance.",
          type: "WORKSHOP",
          location: "Online",
          capacity: 500,
        },
        {
          title: "Tech Skills Bootcamp",
          description: "Intensive bootcamp on essential tech skills.",
          type: "BOOTCAMP",
          location: "Abuja, Nigeria",
          capacity: 50,
        },
        {
          title: "Business Plan Competition",
          description: "Pitch your business idea and compete for prizes!",
          type: "COMPETITION",
          location: "Online",
          capacity: 200,
        },
      ];

      let eventCount = 0;
      for (const eventData of eventsData) {
        const eventRef = db.collection("events").doc();
        const event = {
          id: eventRef.id,
          ...eventData,
          isPublished: true,
          registrationCount: 0,
          startDate: new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          createdBy: payload.sub,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await eventRef.set(event);
        eventCount++;
        console.log(`   ✓ ${event.title}`);
      }

      results.eventsCreated = eventCount;
    }

    // ============================================================================
    // SEED USERS (if needed)
    // ============================================================================
    if (seedType === "full") {
      console.log("👥 Seeding demo users...");

      const demoUsers = [
        {
          uid: "demo-facilitator-001",
          email: "facilitator@example.com",
          firstName: "Jane",
          lastName: "Teacher",
          phone: "+234 9012345678",
          state: "Lagos",
          institution: "Demo College",
          role: "FACILITATOR",
          programme: "IMPACT_SCHOOL",
        },
        {
          uid: "demo-student-001",
          email: "student@example.com",
          firstName: "John",
          lastName: "Learner",
          phone: "+234 9087654321",
          state: "Abuja",
          institution: "Demo School",
          role: "STUDENT",
          programme: "IMPACT_SCHOOL",
        },
      ];

      let userCount = 0;
      for (const userData of demoUsers) {
        const userRef = db.collection("users").doc(userData.uid);
        const user = {
          ...userData,
          verified: true,
          emailVerified: true,
          isActive: true,
          membershipStatus: "ACTIVE",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await userRef.set(user, { merge: true });
        userCount++;
        console.log(`   ✓ ${userData.firstName} ${userData.lastName}`);
      }

      results.usersCreated = userCount;
    }

    console.log("✅ Seeding completed!");

    return NextResponse.json({
      success: true,
      message: "Firestore seeded successfully",
      data: results,
    });
  } catch (error) {
    console.error("❌ Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
