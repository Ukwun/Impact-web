/**
 * Firestore Utilities for ImpactEdu
 * Replaces Prisma queries with Firestore collection operations
 * 
 * Collection Structure:
 * - users/ → User profiles (auth metadata stored in Firebase Auth)
 * - courses/ → Course details
 * - courses/{courseId}/lessons/ → Lessons under course
 * - courses/{courseId}/lessons/{lessonId}/materials/ → Course materials
 * - enrollments/ → User enrollments in courses
 * - quizzes/ → Quiz definitions
 * - quiz_attempts/ → Student quiz submissions
 * - assignments/ → Assignment definitions
 * - assignment_submissions/ → Student assignment submissions
 * - grades/ → Grades and feedback
 * - events/ → Event definitions
 * - event_registrations/ → User event registrations
 * - certificates/ → Certificates earned
 * - achievements/ → Achievement definitions
 * - user_achievements/ → User achievement records
 * - notifications/ → User notifications
 * - membership_tiers/ → Membership tier definitions
 * - leaderboard_entries/ → Leaderboard rankings
 * - activity_logs/ → User activity tracking
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function createUserProfile(userId: string, userData: any) {
  const db = getFirestore();
  const userRef = db.collection('users').doc(userId);
  
  const profile = {
    uid: userId,
    email: userData.email,
    firstName: userData.firstName || 'User',
    lastName: userData.lastName || 'Account',
    phone: userData.phone || '',
    state: userData.state || '',
    institution: userData.institution || '',
    role: userData.role?.toUpperCase() || 'STUDENT',
    programme: userData.programme || 'IMPACT_SCHOOL',
    avatar: userData.avatar || null,
    verified: false,
    emailVerified: false,
    isActive: true,
    membershipStatus: 'ACTIVE',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: null,
  };

  await userRef.set(profile);
  return profile;
}

export async function getUserProfile(userId: string) {
  const db = getFirestore();
  const doc = await db.collection('users').doc(userId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function updateUserProfile(userId: string, updates: any) {
  const db = getFirestore();
  updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await db.collection('users').doc(userId).update(updates);
  return getUserProfile(userId);
}

export async function getUsersByRole(role: string) {
  const db = getFirestore();
  const snapshot = await db.collection('users')
    .where('role', '==', role.toUpperCase())
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================================================
// COURSE OPERATIONS
// ============================================================================

export async function createCourse(courseData: any) {
  const db = getFirestore();
  const courseRef = db.collection('courses').doc();
  
  const course = {
    id: courseRef.id,
    title: courseData.title,
    description: courseData.description || '',
    difficulty: courseData.difficulty || 'BEGINNER',
    duration: courseData.duration || 0,
    thumbnail: courseData.thumbnail || null,
    isPublished: courseData.isPublished !== false,
    createdBy: courseData.createdBy, // facilitator ID
    prerequisites: courseData.prerequisites || [],
    tags: courseData.tags || [],
    enrollmentCount: 0,
    ratingAverage: 0,
    ratingCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await courseRef.set(course);
  return { id: courseRef.id, ...course };
}

export async function getCourse(courseId: string) {
  const db = getFirestore();
  const doc = await db.collection('courses').doc(courseId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function updateCourse(courseId: string, updates: any) {
  const db = getFirestore();
  updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await db.collection('courses').doc(courseId).update(updates);
  return getCourse(courseId);
}

export async function deleteCourse(courseId: string) {
  const db = getFirestore();
  // Delete all lessons first
  const lessonsSnapshot = await db.collection('courses')
    .doc(courseId)
    .collection('lessons')
    .get();
  
  const batch = db.batch();
  lessonsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  batch.delete(db.collection('courses').doc(courseId));
  await batch.commit();
}

export async function listCourses(filters?: any) {
  const db = getFirestore();
  let query: any = db.collection('courses').where('isPublished', '==', true);
  
  if (filters?.createdBy) {
    query = db.collection('courses').where('createdBy', '==', filters.createdBy);
  }
  if (filters?.difficulty) {
    query = query.where('difficulty', '==', filters.difficulty);
  }
  
  const snapshot = await query.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================================================
// LESSON OPERATIONS
// ============================================================================

export async function createLesson(courseId: string, lessonData: any) {
  const db = getFirestore();
  const lessonsRef = db.collection('courses').doc(courseId).collection('lessons').doc();
  
  const lesson = {
    id: lessonsRef.id,
    courseId,
    title: lessonData.title,
    description: lessonData.description || '',
    duration: lessonData.duration || 0,
    videoUrl: lessonData.videoUrl || '',
    transcript: lessonData.transcript || '',
    order: lessonData.order || 0,
    isPublished: lessonData.isPublished !== false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await lessonsRef.set(lesson);
  return { id: lessonsRef.id, ...lesson };
}

export async function getLesson(courseId: string, lessonId: string) {
  const db = getFirestore();
  const doc = await db.collection('courses')
    .doc(courseId)
    .collection('lessons')
    .doc(lessonId)
    .get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function updateLesson(courseId: string, lessonId: string, updates: any) {
  const db = getFirestore();
  updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await db.collection('courses')
    .doc(courseId)
    .collection('lessons')
    .doc(lessonId)
    .update(updates);
  return getLesson(courseId, lessonId);
}

export async function deleteLesson(courseId: string, lessonId: string) {
  const db = getFirestore();
  await db.collection('courses')
    .doc(courseId)
    .collection('lessons')
    .doc(lessonId)
    .delete();
}

export async function listLessons(courseId: string) {
  const db = getFirestore();
  const snapshot = await db.collection('courses')
    .doc(courseId)
    .collection('lessons')
    .orderBy('order', 'asc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================================================
// ENROLLMENT OPERATIONS
// ============================================================================

export async function createEnrollment(courseId: string, userId: string) {
  const db = getFirestore();
  const enrollmentRef = db.collection('enrollments').doc();
  
  const enrollment = {
    id: enrollmentRef.id,
    courseId,
    userId,
    enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
    progress: 0,
    isCompleted: false,
    completedAt: null,
    lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await enrollmentRef.set(enrollment);
  
  // Increment course enrollment count
  await db.collection('courses').doc(courseId).update({
    enrollmentCount: admin.firestore.FieldValue.increment(1),
  });
  
  return { id: enrollmentRef.id, ...enrollment };
}

export async function getEnrollment(courseId: string, userId: string) {
  const db = getFirestore();
  const snapshot = await db.collection('enrollments')
    .where('courseId', '==', courseId)
    .where('userId', '==', userId)
    .limit(1)
    .get();
  return snapshot.docs[0] ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
}

export async function deleteEnrollment(enrollmentId: string) {
  const db = getFirestore();
  const enrollment = await db.collection('enrollments').doc(enrollmentId).get();
  if (enrollment.exists) {
    const data = enrollment.data();
    await enrollment.ref.delete();
    
    // Decrement course enrollment count
    if (data?.courseId) {
      await db.collection('courses').doc(data.courseId).update({
        enrollmentCount: admin.firestore.FieldValue.increment(-1),
      });
    }
  }
}

export async function getUserEnrollments(userId: string) {
  const db = getFirestore();
  const snapshot = await db.collection('enrollments')
    .where('userId', '==', userId)
    .orderBy('enrolledAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCourseEnrollments(courseId: string) {
  const db = getFirestore();
  const snapshot = await db.collection('enrollments')
    .where('courseId', '==', courseId)
    .orderBy('enrolledAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================================================
// ACTIVITY TRACKING
// ============================================================================

export async function logActivity(userId: string, activityData: any) {
  const db = getFirestore();
  const activityRef = db.collection('activity_logs').doc();
  
  const activity = {
    id: activityRef.id,
    userId,
    type: activityData.type, // 'lesson_view', 'quiz_attempt', 'assignment_submit', etc.
    courseId: activityData.courseId || null,
    lessonId: activityData.lessonId || null,
    metadata: activityData.metadata || {},
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  await activityRef.set(activity);
  return activity;
}

export async function getUserActivity(userId: string, limit = 100) {
  const db = getFirestore();
  const snapshot = await db.collection('activity_logs')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================================================
// QUIZ OPERATIONS
// ============================================================================

export async function createQuiz(courseId: string, quizData: any) {
  const db = getFirestore();
  const quizRef = db.collection('quizzes').doc();
  
  const quiz = {
    id: quizRef.id,
    courseId,
    title: quizData.title,
    description: quizData.description || '',
    totalPoints: quizData.totalPoints || 100,
    passingScore: quizData.passingScore || 60,
    questions: quizData.questions || [],
    isPublished: quizData.isPublished !== false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await quizRef.set(quiz);
  return { id: quizRef.id, ...quiz };
}

export async function getQuiz(quizId: string) {
  const db = getFirestore();
  const doc = await db.collection('quizzes').doc(quizId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function listCourseQuizzes(courseId: string) {
  const db = getFirestore();
  const snapshot = await db.collection('quizzes')
    .where('courseId', '==', courseId)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================================================
// QUIZ ATTEMPT OPERATIONS
// ============================================================================

export async function createQuizAttempt(quizData: any) {
  const db = getFirestore();
  const attemptRef = db.collection('quiz_attempts').doc();
  
  const attempt = {
    id: attemptRef.id,
    quizId: quizData.quizId,
    userId: quizData.userId,
    answers: quizData.answers || [],
    score: quizData.score || 0,
    passed: quizData.passed || false,
    attemptNumber: quizData.attemptNumber || 1,
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await attemptRef.set(attempt);
  return { id: attemptRef.id, ...attempt };
}

export async function getUserQuizAttempts(userId: string, quizId: string) {
  const db = getFirestore();
  const snapshot = await db.collection('quiz_attempts')
    .where('userId', '==', userId)
    .where('quizId', '==', quizId)
    .orderBy('submittedAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================================================
// ASSIGNMENT OPERATIONS
// ============================================================================

export async function createAssignment(courseId: string, assignmentData: any) {
  const db = getFirestore();
  const assignmentRef = db.collection('assignments').doc();
  
  const assignment = {
    id: assignmentRef.id,
    courseId,
    title: assignmentData.title,
    description: assignmentData.description || '',
    dueDate: assignmentData.dueDate,
    maxPoints: assignmentData.maxPoints || 100,
    rubric: assignmentData.rubric || [],
    isPublished: assignmentData.isPublished !== false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await assignmentRef.set(assignment);
  return { id: assignmentRef.id, ...assignment };
}

export async function getAssignment(assignmentId: string) {
  const db = getFirestore();
  const doc = await db.collection('assignments').doc(assignmentId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function listCourseAssignments(courseId: string) {
  const db = getFirestore();
  const snapshot = await db.collection('assignments')
    .where('courseId', '==', courseId)
    .orderBy('dueDate', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ============================================================================
// ASSIGNMENT SUBMISSION OPERATIONS
// ============================================================================

export async function createAssignmentSubmission(submissionData: any) {
  const db = getFirestore();
  const submissionRef = db.collection('assignment_submissions').doc();
  
  const submission = {
    id: submissionRef.id,
    assignmentId: submissionData.assignmentId,
    userId: submissionData.userId,
    content: submissionData.content || '',
    files: submissionData.files || [],
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    isLate: submissionData.isLate || false,
  };

  await submissionRef.set(submission);
  return { id: submissionRef.id, ...submission };
}

export async function getUserAssignmentSubmission(assignmentId: string, userId: string) {
  const db = getFirestore();
  const snapshot = await db.collection('assignment_submissions')
    .where('assignmentId', '==', assignmentId)
    .where('userId', '==', userId)
    .limit(1)
    .get();
  return snapshot.docs[0] ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
}

// ============================================================================
// LEADERBOARD OPERATIONS
// ============================================================================

export async function updateLeaderboardEntry(userId: string, courseId: string, score: number) {
  const db = getFirestore();
  const entryRef = db.collection('leaderboard_entries').doc(`${courseId}_${userId}`);
  
  await entryRef.set({
    userId,
    courseId,
    score,
    rank: 0, // Will be calculated by admin
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function getLeaderboard(courseId: string, limit = 100) {
  const db = getFirestore();
  const snapshot = await db.collection('leaderboard_entries')
    .where('courseId', '==', courseId)
    .orderBy('score', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map((doc, idx) => ({
    id: doc.id,
    rank: idx + 1,
    ...doc.data(),
  }));
}

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export async function countUsers(role?: string) {
  const db = getFirestore();
  let query: any = db.collection('users');
  if (role) {
    query = query.where('role', '==', role.toUpperCase());
  }
  const snapshot = await query.count().get();
  return snapshot.data().count;
}

export async function countCourses() {
  const db = getFirestore();
  const snapshot = await db.collection('courses').count().get();
  return snapshot.data().count;
}

export async function countEnrollments(courseId?: string) {
  const db = getFirestore();
  let query: any = db.collection('enrollments');
  if (courseId) {
    query = query.where('courseId', '==', courseId);
  }
  const snapshot = await query.count().get();
  return snapshot.data().count;
}

export async function getSystemMetrics() {
  const db = getFirestore();
  
  const userCount = await countUsers();
  const courseCount = await countCourses();
  const enrollmentCount = await countEnrollments();
  
  // Get active users this month
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activeUsersSnapshot = await db.collection('activity_logs')
    .where('timestamp', '>=', thirtyDaysAgo)
    .get();
  
  const uniqueActiveUsers = new Set(activeUsersSnapshot.docs.map(doc => doc.data().userId));
  
  return {
    totalUsers: userCount,
    totalCourses: courseCount,
    totalEnrollments: enrollmentCount,
    activeUsersThisMonth: uniqueActiveUsers.size,
    engagementRate: enrollmentCount > 0 ? ((uniqueActiveUsers.size / userCount) * 100).toFixed(2) : 0,
  };
}
