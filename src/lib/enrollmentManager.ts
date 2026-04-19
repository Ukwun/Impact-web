/**
 * Enrollment Manager
 * Server-side functions for managing course enrollments
 */

import {
  CourseEnrollment,
  StudentProgress,
  StudentEnrollment,
  createEnrollment,
  calculateCourseStats,
  CourseStats,
} from '@/types/enrollment';

// Mock Enrollments Data
const mockEnrollments: CourseEnrollment[] = [
  {
    id: 'enroll-1',
    courseId: 'course-1',
    userId: 'user-1',
    status: 'active',
    enrolledAt: new Date('2026-03-15'),
    progressPercentage: 65,
    lessonsCompleted: 13,
    totalLessons: 20,
    lastAccessedAt: new Date('2026-04-18'),
    certificateIssued: false,
  },
  {
    id: 'enroll-2',
    courseId: 'course-1',
    userId: 'user-2',
    status: 'completed',
    enrolledAt: new Date('2026-01-10'),
    completedAt: new Date('2026-03-12'),
    progressPercentage: 100,
    lessonsCompleted: 20,
    totalLessons: 20,
    lastAccessedAt: new Date('2026-03-12'),
    certificateIssued: true,
  },
  {
    id: 'enroll-3',
    courseId: 'course-1',
    userId: 'user-3',
    status: 'active',
    enrolledAt: new Date('2026-03-20'),
    progressPercentage: 30,
    lessonsCompleted: 6,
    totalLessons: 20,
    lastAccessedAt: new Date('2026-04-17'),
    certificateIssued: false,
  },
  {
    id: 'enroll-4',
    courseId: 'course-1',
    userId: 'user-4',
    status: 'dropped',
    enrolledAt: new Date('2026-02-28'),
    progressPercentage: 15,
    lessonsCompleted: 3,
    totalLessons: 20,
    lastAccessedAt: new Date('2026-03-05'),
    certificateIssued: false,
  },
  {
    id: 'enroll-5',
    courseId: 'course-2',
    userId: 'user-1',
    status: 'active',
    enrolledAt: new Date('2026-03-20'),
    progressPercentage: 40,
    lessonsCompleted: 8,
    totalLessons: 20,
    lastAccessedAt: new Date('2026-04-18'),
    certificateIssued: false,
  },
];

const mockStudentData = [
  { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  { id: 'user-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
  { id: 'user-3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
  { id: 'user-4', firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com' },
];

/**
 * Get enrollments for a course
 */
export async function getCourseEnrollments(
  courseId: string,
  limit = 50,
  offset = 0
): Promise<{ enrollments: StudentEnrollment[]; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const courseEnrollments = mockEnrollments.filter((e) => e.courseId === courseId);

  const studentEnrollments = courseEnrollments.map((enrollment) => {
    const student = mockStudentData.find((s) => s.id === enrollment.userId);
    return {
      id: enrollment.id,
      userId: enrollment.userId,
      firstName: student?.firstName || 'Unknown',
      lastName: student?.lastName || 'Student',
      email: student?.email || '',
      enrolledAt: enrollment.enrolledAt,
      progressPercentage: enrollment.progressPercentage,
      lastAccessedAt: enrollment.lastAccessedAt,
      status: enrollment.status,
    };
  });

  return {
    enrollments: studentEnrollments.slice(offset, offset + limit),
    total: studentEnrollments.length,
  };
}

/**
 * Get enrollment for a user-course combo
 */
export async function getEnrollment(courseId: string, userId: string): Promise<CourseEnrollment | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return (
    mockEnrollments.find((e) => e.courseId === courseId && e.userId === userId) ||
    null
  );
}

/**
 * Get student progress details
 */
export async function getStudentProgress(courseId: string): Promise<StudentProgress[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockEnrollments
    .filter((e) => e.courseId === courseId)
    .map((enrollment) => {
      const student = mockStudentData.find((s) => s.id === enrollment.userId);
      const days = Math.ceil(
        (new Date().getTime() - new Date(enrollment.enrolledAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const hoursPerDay = enrollment.lastAccessedAt ? 1.5 : 0;
      const totalHours = days * hoursPerDay;

      return {
        userId: enrollment.userId,
        firstName: student?.firstName || 'Unknown',
        lastName: student?.lastName || 'Student',
        lessonsCompleted: enrollment.lessonsCompleted,
        totalLessons: enrollment.totalLessons,
        progressPercentage: enrollment.progressPercentage,
        timeSpent: Math.round(totalHours * 10) / 10,
        lastAccessed: enrollment.lastAccessedAt || new Date(),
        status: enrollment.status,
      };
    })
    .sort((a, b) => b.progressPercentage - a.progressPercentage);
}

/**
 * Enroll user in course
 */
export async function enrollUserInCourse(
  courseId: string,
  userId: string,
  totalLessons: number
): Promise<CourseEnrollment> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const enrollment = createEnrollment(courseId, userId, totalLessons);
  mockEnrollments.push(enrollment);

  return enrollment;
}

/**
 * Update enrollment progress
 */
export async function updateEnrollmentProgress(
  courseId: string,
  userId: string,
  lessonsCompleted: number
): Promise<CourseEnrollment | null> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const enrollment = mockEnrollments.find(
    (e) => e.courseId === courseId && e.userId === userId
  );

  if (!enrollment) return null;

  enrollment.lessonsCompleted = lessonsCompleted;
  enrollment.progressPercentage = Math.min(
    100,
    Math.round((lessonsCompleted / enrollment.totalLessons) * 100)
  );
  enrollment.lastAccessedAt = new Date();

  // Auto-complete if all lessons done
  if (lessonsCompleted >= enrollment.totalLessons && enrollment.status === 'active') {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    enrollment.certificateIssued = true;
  }

  return enrollment;
}

/**
 * Get course statistics
 */
export async function getCourseStatistics(courseId: string): Promise<CourseStats> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const enrollments = mockEnrollments.filter((e) => e.courseId === courseId);
  return calculateCourseStats(enrollments);
}

/**
 * Get all enrollments for a user
 */
export async function getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return mockEnrollments
    .filter((e) => e.userId === userId)
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
}

/**
 * Complete enrollment (issue certificate)
 */
export async function completeEnrollment(
  courseId: string,
  userId: string
): Promise<CourseEnrollment | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const enrollment = mockEnrollments.find(
    (e) => e.courseId === courseId && e.userId === userId
  );

  if (!enrollment) return null;

  enrollment.status = 'completed';
  enrollment.completedAt = new Date();
  enrollment.progressPercentage = 100;
  enrollment.certificateIssued = true;

  return enrollment;
}

/**
 * Drop enrollment
 */
export async function dropEnrollment(courseId: string, userId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const enrollment = mockEnrollments.find(
    (e) => e.courseId === courseId && e.userId === userId
  );

  if (!enrollment) return false;

  enrollment.status = 'dropped';
  return true;
}
