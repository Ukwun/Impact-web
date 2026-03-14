import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================================
  // CREATE USERS
  // ============================================================================

  const hashedPassword = await hashPassword("Test@1234");

  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+234123456789",
      passwordHash: hashedPassword,
      role: "STUDENT",
      state: "Lagos",
    },
  });

  const facilitator = await prisma.user.upsert({
    where: { email: "facilitator@example.com" },
    update: {},
    create: {
      email: "facilitator@example.com",
      firstName: "Mrs. Adeola",
      lastName: "Okafor",
      phone: "+234987654321",
      passwordHash: hashedPassword,
      role: "FACILITATOR",
      state: "Lagos",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      phone: "+234555555555",
      passwordHash: hashedPassword,
      role: "ADMIN",
      state: "Abuja",
    },
  });

  // ============================================================================
  // CREATE DEMO USERS (For Testing & QA)
  // ============================================================================
  // These demo users persist in the database, so they're available after restart
  const demoStudentPassword = await hashPassword("Demo@123");
  
  const demoStudent = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      email: "student@demo.com",
      firstName: "Demo",
      lastName: "Student",
      phone: "+234701234567",
      passwordHash: demoStudentPassword,
      role: "STUDENT",
      state: "Lagos",
      institution: "Demo University",
    },
  });

  const demoFacilitatorPassword = await hashPassword("Demo@123");
  
  const demoFacilitator = await prisma.user.upsert({
    where: { email: "facilitator@demo.com" },
    update: {},
    create: {
      email: "facilitator@demo.com",
      firstName: "Demo",
      lastName: "Facilitator",
      phone: "+234702345678",
      passwordHash: demoFacilitatorPassword,
      role: "FACILITATOR",
      state: "Lagos",
      institution: "Demo University",
    },
  });

  const demoMentorPassword = await hashPassword("Demo@123");
  
  const demoMentor = await prisma.user.upsert({
    where: { email: "mentor@demo.com" },
    update: {},
    create: {
      email: "mentor@demo.com",
      firstName: "Demo",
      lastName: "Mentor",
      phone: "+234703456789",
      passwordHash: demoMentorPassword,
      role: "MENTOR",
      state: "Lagos",
      institution: "Demo University",
    },
  });

  console.log(`✓ Created demo users: student@demo.com, facilitator@demo.com, mentor@demo.com (Password: Demo@123)`);

  // ============================================================================
  // CREATE COURSES
  // ============================================================================

  const course1 = await prisma.course.upsert({
    where: { id: "course_1" },
    update: {},
    create: {
      id: "course_1",
      title: "Introduction to Financial Literacy",
      description:
        "Learn the basics of personal finance, budgeting, and smart money management.",
      difficulty: "BEGINNER",
      duration: 240,
      language: "English",
      instructor: "Adeyemi Johnson",
      createdById: facilitator.id,
      isPublished: true,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: "course_2" },
    update: {},
    create: {
      id: "course_2",
      title: "Digital Skills Bootcamp",
      description: "Master essential digital skills for the modern workplace.",
      difficulty: "INTERMEDIATE",
      duration: 480,
      language: "English",
      instructor: "Chioma Okafor",
      createdById: facilitator.id,
      isPublished: true,
    },
  });

  // ============================================================================
  // CREATE MODULES
  // ============================================================================

  const module1 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: "Module 1: Money Basics",
      order: 1,
    },
  });

  // ============================================================================
  // CREATE LESSONS
  // ============================================================================

  const lesson1 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      moduleId: module1.id,
      title: "What is Money?",
      description:
        "Understanding the fundamentals of money and its role in the economy",
      content: "Money is a medium of exchange that facilitates trade...",
      videoUrl: "https://example.com/lesson1.mp4",
      duration: 45,
      order: 1,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      moduleId: module1.id,
      title: "Budgeting 101",
      description: "Learn how to create and maintain a personal budget",
      content: "A budget is a financial plan that outlines your income...",
      videoUrl: "https://example.com/lesson2.mp4",
      duration: 50,
      order: 2,
    },
  });

  // ============================================================================
  // CREATE LESSON MATERIALS
  // ============================================================================

  await prisma.lessonMaterial.create({
    data: {
      lessonId: lesson1.id,
      title: "Lesson Slides (PDF)",
      type: "pdf",
      url: "/materials/lesson1-slides.pdf",
      fileSize: 2048000,
    },
  });

  // ============================================================================
  // CREATE QUIZZES
  // ============================================================================

  const quiz1 = await prisma.quiz.create({
    data: {
      courseId: course1.id,
      moduleId: module1.id,
      title: "Module 1: What is Money? - Quiz",
      description: "Test your understanding of the concepts covered in this module.",
      duration: 15,
      passingScore: 70,
      totalPoints: 100,
      allowRetake: true,
      showResults: true,
    },
  });

  // ============================================================================
  // CREATE QUIZ QUESTIONS
  // ============================================================================

  await prisma.quizQuestion.create({
    data: {
      quizId: quiz1.id,
      order: 1,
      type: "MULTIPLE_CHOICE",
      questionText: "Which of the following is the primary function of money?",
      options: [
        "A store of value",
        "A medium of exchange",
        "A unit of account",
        "All of the above",
      ],
      correctAnswer: "3",
      points: 10,
      explanation:
        "Money serves all three functions: as a store of value, as a medium of exchange, and as a unit of account.",
    },
  });

  await prisma.quizQuestion.create({
    data: {
      quizId: quiz1.id,
      order: 2,
      type: "TRUE_FALSE",
      questionText:
        "Fiat money is backed by a physical commodity like gold or silver.",
      options: ["True", "False"],
      correctAnswer: "1",
      points: 10,
      explanation:
        "False - Fiat money is not backed by physical commodities but by government decree and trust in the government.",
    },
  });

  // ============================================================================
  // CREATE ASSIGNMENTS
  // ============================================================================

  const assignment1 = await prisma.assignment.create({
    data: {
      courseId: course1.id,
      title: "Create Your Personal Budget Plan",
      description: "In this assignment, you will create a comprehensive personal budget plan.",
      instructions: `Create a detailed personal budget plan:
1. Income Analysis
2. Expense Categorization  
3. Budget Summary
4. Action Plan`,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxPoints: 100,
      allowLateSubmission: false,
      rubric: {
        create: [
          {
            criterion: "Income Analysis - Completeness",
            points: 25,
            description: "All income sources are identified and correctly calculated",
          },
          {
            criterion: "Expense Categorization - Organization",
            points: 25,
            description: "Expenses are well-organized and clearly categorized",
          },
          {
            criterion: "Budget Calculations - Accuracy",
            points: 25,
            description: "All calculations are accurate and properly documented",
          },
          {
            criterion: "Action Plan - Feasibility",
            points: 25,
            description: "Action plan is realistic, measurable, and clearly articulated",
          },
        ],
      },
    },
  });

  // ============================================================================
  // CREATE ENROLLMENTS
  // ============================================================================

  await prisma.enrollment.create({
    data: {
      courseId: course1.id,
      userId: student.id,
      progress: 60,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
    },
  });

  // ============================================================================
  // CREATE LESSON PROGRESS
  // ============================================================================

  await prisma.lessonProgress.create({
    data: {
      lessonId: lesson1.id,
      enrollmentId: (
        await prisma.enrollment.findFirst({
          where: { courseId: course1.id, userId: student.id },
        })
      )!.id,
      secondsWatched: 2700, // 45 minutes
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // ============================================================================
  // CREATE EVENTS
  // ============================================================================

  const now = new Date();
  const futureDate1 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now
  const futureDate2 = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000); // 4 weeks from now
  const futureDate3 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

  await prisma.event.upsert({
    where: { id: "event_1" },
    update: {},
    create: {
      id: "event_1",
      title: "ImpactEdu National Summit 2026",
      description:
        "Nigeria's largest educational gathering. Network with leaders, discover emerging trends, and accelerate your growth.",
      eventDate: futureDate1,
      startTime: "09:00",
      endTime: "18:00",
      venue: "Lagos Convention Centre",
      location: "Victoria Island, Lagos",
      eventType: "NATIONAL",
      capacity: 2500,
      createdById: admin.id,
      isPublished: true,
    },
  });

  await prisma.event.upsert({
    where: { id: "event_2" },
    update: {},
    create: {
      id: "event_2",
      title: "Campus Pitch Day",
      description:
        "University students showcase their innovations and pitches to investors and industry mentors.",
      eventDate: futureDate2,
      startTime: "10:00",
      endTime: "16:00",
      venue: "Multiple Campuses",
      location: "Lagos & Abuja",
      eventType: "SCHOOL",
      capacity: 800,
      createdById: admin.id,
      isPublished: true,
    },
  });

  await prisma.event.upsert({
    where: { id: "event_3" },
    update: {},
    create: {
      id: "event_3",
      title: "Impact Roundtable: The Future of African EdTech",
      description:
        "Exclusive conversation with African education leaders on innovation, funding, and impact at scale.",
      eventDate: futureDate3,
      startTime: "15:00",
      endTime: "17:30",
      venue: "Virtual + Lagos",
      location: "Online & Lekki, Lagos",
      eventType: "WEBINAR",
      capacity: 500,
      createdById: admin.id,
      isPublished: true,
    },
  });

  // ============================================================================
  // CREATE TESTIMONIALS
  // ============================================================================

  await prisma.testimonial.createMany({
    data: [
      {
        authorName: "Adebayo Okonkwo",
        authorRole: "Founder & CEO, TechStart Nigeria",
        quote:
          "ImpactEdu completely transformed my entrepreneurial journey. I went from idea to a funded startup in 6 months. The mentorship and network alone are worth millions.",
        rating: 5,
        category: "student",
        isPublished: true,
      },
      {
        authorName: "Dr. Chioma Adeyemi",
        authorRole: "University Lecturer, University of Lagos",
        quote:
          "As a facilitator, I've seen firsthand how ImpactEdu equips students with practical skills that universities alone can't provide. My students are more confident and job-ready.",
        rating: 5,
        category: "mentor",
        isPublished: true,
      },
      {
        authorName: "Mrs. Nneka Okafor",
        authorRole: "Head of HR, Nigerian Banking Sector",
        quote:
          "We partner with ImpactEdu to identify top talent. The quality of graduates from this platform is exceptional. They hit the ground running on day one.",
        rating: 5,
        category: "partner",
        isPublished: true,
      },
      {
        authorName: "Emeka Nwosu",
        authorRole: "Recent Graduate, ImpactCircle Member",
        quote:
          "The financial literacy course changed my life. I now have passive income streams and I'm building towards my first million. 100% worth it!",
        rating: 5,
        category: "student",
        isPublished: true,
      },
      {
        authorName: "Zainab Ibrahim",
        authorRole: "Business Mentor, Entrepreneurship Coach",
        quote:
          "I mentor 15+ students on ImpactEdu. The platform's infrastructure makes it easy for mentors to create real impact. My mentees are my proud referrals.",
        rating: 5,
        category: "mentor",
        isPublished: true,
      },
      {
        authorName: "Segun Adebayo",
        authorRole: "Head of Development, International NGO",
        quote:
          "ImpactEdu's commitment to equitable education across Africa aligns perfectly with our mission. We're excited to deepen our partnership.",
        rating: 5,
        category: "partner",
        isPublished: true,
      },
    ],
  });

  // ============================================================================
  // CREATE LEADERBOARD ENTRIES
  // ============================================================================

  // Create leaderboard entries for existing users
  await prisma.leaderboardEntry.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      totalScore: 450,
      coursesCompleted: 3,
      quizzesPassed: 12,
      assignmentsSubmitted: 8,
      perfectScores: 2,
      streakDays: 7,
      totalLogins: 45,
      studyTimeMinutes: 1200,
    },
  });

  await prisma.leaderboardEntry.upsert({
    where: { userId: facilitator.id },
    update: {},
    create: {
      userId: facilitator.id,
      totalScore: 250,
      coursesCompleted: 1,
      quizzesPassed: 5,
      assignmentsSubmitted: 3,
      perfectScores: 1,
      streakDays: 3,
      totalLogins: 20,
      studyTimeMinutes: 300,
    },
  });

  // Create some sample achievements for the student
  await prisma.userAchievement.upsert({
    where: {
      userId_badge: {
        userId: student.id,
        badge: "first_course",
      },
    },
    update: {},
    create: {
      userId: student.id,
      badge: "first_course",
      title: "First Steps",
      description: "Complete your first course",
      icon: "🎓",
    },
  });

  await prisma.userAchievement.upsert({
    where: {
      userId_badge: {
        userId: student.id,
        badge: "five_courses",
      },
    },
    update: {},
    create: {
      userId: student.id,
      badge: "five_courses",
      title: "Scholar",
      description: "Complete 5 courses",
      icon: "📚",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("Email: student@example.com");
  console.log("Password: Test@1234");
  console.log("Role: STUDENT");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
