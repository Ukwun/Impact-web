/**
 * Course Enrollment Types
 * Track which students are enrolled in which courses
 */

export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'paused';

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  progressPercentage: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastAccessedAt?: Date;
  certificateIssued: boolean;
}

export interface CourseProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // seconds
  attempts: number;
  score?: number;
}

export interface StudentEnrollment {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  enrolledAt: Date;
  progressPercentage: number;
  lastAccessedAt?: Date;
  status: EnrollmentStatus;
}

export interface CourseStats {
  totalEnrolled: number;
  activeStudents: number;
  completedCount: number;
  averageProgress: number;
  averageCompletionTime: number; // days
}

export interface StudentProgress {
  userId: string;
  firstName: string;
  lastName: string;
  lessonsCompleted: number;
  totalLessons: number;
  progressPercentage: number;
  timeSpent: number; // hours
  lastAccessed: Date;
  status: EnrollmentStatus;
}

/**
 * Helper functions
 */

export function createEnrollment(
  courseId: string,
  userId: string,
  totalLessons: number
): CourseEnrollment {
  return {
    id: `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    courseId,
    userId,
    status: 'active',
    enrolledAt: new Date(),
    progressPercentage: 0,
    lessonsCompleted: 0,
    totalLessons,
    certificateIssued: false,
  };
}

export function calculateCourseStats(enrollments: CourseEnrollment[]): CourseStats {
  const active = enrollments.filter((e) => e.status === 'active');
  const completed = enrollments.filter((e) => e.status === 'completed');

  const avgProgress =
    enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length
      : 0;

  const avgCompletionTime =
    completed.length > 0
      ? completed.reduce((sum, e) => {
          const start = new Date(e.enrolledAt).getTime();
          const end = new Date(e.completedAt || new Date()).getTime();
          return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }, 0) / completed.length
      : 0;

  return {
    totalEnrolled: enrollments.length,
    activeStudents: active.length,
    completedCount: completed.length,
    averageProgress: Math.round(avgProgress),
    averageCompletionTime: Math.round(avgCompletionTime),
  };
}

export function getEnrollmentStatusColor(status: EnrollmentStatus): string {
  const colors = {
    active: 'green',
    completed: 'blue',
    dropped: 'red',
    paused: 'yellow',
  };
  return colors[status];
}

export function getEnrollmentStatusLabel(status: EnrollmentStatus): string {
  const labels = {
    active: 'Currently Learning',
    completed: 'Course Completed',
    dropped: 'Course Dropped',
    paused: 'Paused',
  };
  return labels[status];
}
