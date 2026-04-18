#!/usr/bin/env node

/**
 * Firebase Firestore Seed Script
 * Populates initial demo data for ImpactEdu
 * 
 * Run: node scripts/seed-firestore.js
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'firebase-key.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || 'impactknowledge-ab14f',
});

const db = admin.firestore();

// ============================================================================
// SAMPLE DATA
// ============================================================================

const DEMO_COURSES = [
  {
    title: 'Financial Literacy 101',
    description: 'Learn the fundamentals of personal finance, budgeting, and saving strategies.',
    difficulty: 'BEGINNER',
    duration: 120,
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-430f63602022?w=400',  
  },
  {
    title: 'Entrepreneurship Essentials',
    description: 'Start your entrepreneurial journey with business planning and execution strategies.',
    difficulty: 'BEGINNER',
    duration: 150,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
  {
    title: 'Digital Marketing Mastery',
    description: 'Master social media, SEO, and content marketing to grow your business online.',
    difficulty: 'INTERMEDIATE',
    duration: 180,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-adf4e0c359a1?w=400',
  },
  {
    title: 'Investment & Wealth Building',
    description: 'Understand stocks, bonds, and investment strategies for long-term wealth.',
    difficulty: 'INTERMEDIATE',
    duration: 200,
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',
  },
  {
    title: 'Advanced Business Analytics',
    description: 'Learn data analysis, Excel, and business intelligence tools.',
    difficulty: 'ADVANCED',
    duration: 250,
    thumbnail: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=400',
  },
  {
    title: 'Leadership & Team Management',
    description: 'Develop leadership skills and learn to manage high-performing teams.',
    difficulty: 'INTERMEDIATE',
    duration: 160,
    thumbnail: 'https://images.unsplash.com/photo-1552664740-d8c0cb89e90e?w=400',
  },
  {
    title: 'Tech Skills for Non-Techies',
    description: 'Get comfortable with essential tech tools, AI, and automation.',
    difficulty: 'BEGINNER',
    duration: 100,
    thumbnail: 'https://images.unsplash.com/photo-1516534775068-bb57846d893f?w=400',
  },
  {
    title: 'E-commerce & Online Sales',
    description: 'Build and scale an online store, from setup to marketing.',
    difficulty: 'INTERMEDIATE',
    duration: 140,
    thumbnail: 'https://images.unsplash.com/photo-1570959375944-fff8063a0302?w=400',
  },
  {
    title: 'Personal Branding & Networking',
    description: 'Build your personal brand and create meaningful professional connections.',
    difficulty: 'BEGINNER',
    duration: 80,
    thumbnail: 'https://images.unsplash.com/photo-1552664588-f4b88b4e1b9c?w=400',
  },
  {
    title: 'Freelancing & Remote Work Mastery',
    description: 'Build a successful freelancing career and work remotely.',
    difficulty: 'INTERMEDIATE',
    duration: 120,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
];

const DEMO_LESSONS = {
  0: [ // Financial Literacy 101
    { title: 'What is Money?', description: 'Understanding the basics of money and its role in society.', order: 1 },
    { title: 'Budgeting for Beginners', description: 'Create your first budget and track your spending.', order: 2 },
    { title: 'Emergency Fund Essentials', description: 'Why and how to build an emergency fund.', order: 3 },
  ],
  1: [ // Entrepreneurship
    { title: 'Business Idea Validation', description: 'Test your business idea before launching.', order: 1 },
    { title: 'Writing a Business Plan', description: 'Create a comprehensive business plan.', order: 2 },
    { title: 'Funding Your Startup', description: 'Understand different funding options.', order: 3 },
    { title: 'Legal Structures for Businesses', description: 'Choose the right business structure.', order: 4 },
  ],
  2: [ // Digital Marketing
    { title: 'Social Media Strategy', description: 'Create an effective social media plan.', order: 1 },
    { title: 'Content Creation', description: 'Produce engaging content for your audience.', order: 2 },
    { title: 'SEO Basics', description: 'Optimize your online presence for search.', order: 3 },
    { title: 'Email Marketing', description: 'Build and nurture your email list.', order: 4 },
    { title: 'Paid Advertising', description: 'Run effective paid campaigns.', order: 5 },
  ],
};

const DEMO_EVENTS = [
  {
    title: 'Entrepreneur Meetup Lagos',
    description: 'Network with fellow entrepreneurs in Lagos. Share experiences and learn from each other.',
    type: 'NETWORKING',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Lagos, Nigeria',
    capacity: 100,
  },
  {
    title: 'Financial Literacy Workshop',
    description: 'Interactive workshop on personal finance and wealth building.',
    type: 'WORKSHOP',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Online',
    capacity: 500,
  },
  {
    title: 'Tech Skills Bootcamp',
    description: 'Intensive 2-day bootcamp covering essential tech skills for business.',
    type: 'BOOTCAMP',
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Abuja, Nigeria',
    capacity: 50,
  },
  {
    title: 'Business Plan Competition',
    description: 'Pitch your business idea and compete for prizes!',
    type: 'COMPETITION',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Online',
    capacity: 200,
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function createCourse(courseData, facilitatorId) {
  const docRef = db.collection('courses').doc();
  const course = {
    id: docRef.id,
    ...courseData,
    isPublished: true,
    createdBy: facilitatorId,
    enrollmentCount: 0,
    ratingAverage: 0,
    ratingCount: 0,
    prerequisites: [],
    tags: [],
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await docRef.set(course);
  console.log(`✅ Created course: ${course.title}`);
  return course;
}

async function createLessons(courseId, lessonsData) {
  const lessonsRef = db.collection('courses').doc(courseId).collection('lessons');
  
  for (const lessonData of lessonsData) {
    const docRef = lessonsRef.doc();
    const lesson = {
      id: docRef.id,
      courseId,
      ...lessonData,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',// Placeholder
      transcript: 'Lesson content transcript here...',
      isPublished: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await docRef.set(lesson);
    console.log(`   ✨ Created lesson: ${lesson.title}`);
  }
}

async function createEvent(eventData) {
  const docRef = db.collection('events').doc();
  const event = {
    id: docRef.id,
    ...eventData,
    registrationCount: 0,
    isPublished: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await docRef.set(event);
  console.log(`✅ Created event: ${event.title}`);
  return event;
}

async function createDemoUser(userData) {
  // Note: This creates in Firestore only, not in Firebase Auth
  // Firebase Auth users should be created separately
  const docRef = db.collection('users').doc(userData.uid);
  const user = {
    uid: userData.uid,
    ...userData,
    verified: true,
    emailVerified: true,
    isActive: true,
    membershipStatus: 'ACTIVE',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    lastLoginAt: admin.firestore.Timestamp.now(),
  };

  await docRef.set(user);
  console.log(`✅ Created demo user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
  return user;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedFirestore() {
  try {
    console.log('\n🌱 Starting Firestore seed...\n');

    // Create demo facilitator user
    console.log('📝 Creating demo facilitator...');
    const facilitator = await createDemoUser({
      uid: 'demo-facilitator-001',
      email: 'facilitator@example.com',
      firstName: 'Jane',
      lastName: 'Teacher',
      phone: '+234 (0) 9012345678',
      state: 'Lagos',
      institution: 'Demo College',
      role: 'FACILITATOR',
      programme: 'IMPACT_SCHOOL',
      avatar: null,
    });

    // Create demo student user
    console.log('📝 Creating demo student...');
    const student = await createDemoUser({
      uid: 'demo-student-001',
      email: 'student@example.com',
      firstName: 'John',
      lastName: 'Learner',
      phone: '+234 (0) 9087654321',
      state: 'Abuja',
      institution: 'Demo School',
      role: 'STUDENT',
      programme: 'IMPACT_SCHOOL',
      avatar: null,
    });

    // Create courses with lessons
    console.log('\n📚 Creating courses and lessons...');
    for (let i = 0; i < Math.min(5, DEMO_COURSES.length); i++) {
      const course = await createCourse(DEMO_COURSES[i], facilitator.uid);
      if (DEMO_LESSONS[i]) {
        await createLessons(course.id, DEMO_LESSONS[i]);
      }
    }

    // Create events
    console.log('\n📅 Creating events...');
    for (const eventData of DEMO_EVENTS) {
      await createEvent(eventData);
    }

    // Get all courses to create sample enrollments
    console.log('\n📖 Creating sample enrollments...');
    const coursesSnapshot = await db.collection('courses').limit(3).get();
    
    for (const courseDoc of coursesSnapshot.docs) {
      const enrollmentRef = db.collection('enrollments').doc();
      const enrollment = {
        id: enrollmentRef.id,
        courseId: courseDoc.id,
        userId: student.uid,
        progress: Math.random() * 100,
        isCompleted: false,
        enrolledAt: admin.firestore.Timestamp.now(),
        lastAccessedAt: admin.firestore.Timestamp.now(),
      };
      await enrollmentRef.set(enrollment);
      console.log(`   ✅ Enrolled student in course: ${courseDoc.data().title}`);
    }

    console.log('\n✅ Firestore seed completed successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log(`   Facilitator: facilitator@example.com / password`);
    console.log(`   Student: student@example.com / password`);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run the seed
seedFirestore();
