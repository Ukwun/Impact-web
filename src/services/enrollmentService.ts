/**
 * ENROLLMENT SERVICE
 * File: src/services/enrollmentService.ts
 * 
 * Handles course enrollment with proper validation and tracking
 * Status: CRITICAL FIX
 */

import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import BadgeService from './badgeService';

export interface EnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  message: string;
  error?: string;
}

export class EnrollmentService {
  /**
   * Enroll user in course
   * @param userId User to enroll
   * @param courseId Course to enroll in
   * @returns Enrollment result with ID and status
   */
  static async enrollUserInCourse(userId: string, courseId: string): Promise<EnrollmentResult> {
    try {
      // Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'INVALID_USER',
        };
      }

      // Validate course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return {
          success: false,
          message: 'Course not found',
          error: 'INVALID_COURSE',
        };
      }

      // Check if already enrolled
      const existing = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (existing) {
        return {
          success: false,
          message: 'User already enrolled in this course',
          enrollmentId: existing.id,
          error: 'ALREADY_ENROLLED',
        };
      }

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          progress: 0,
          isCompleted: false,
        },
      });

      // Check for new enrollment badge
      await BadgeService.checkAllBadges(userId);

      // Create notification
      await this.createEnrollmentNotification(userId, course.title);

      return {
        success: true,
        enrollmentId: enrollment.id,
        message: `Successfully enrolled in ${course.title}`,
      };
    } catch (error) {
      console.error('Error enrolling user:', error);
      return {
        success: false,
        message: 'An error occurred during enrollment',
        error: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Get user's enrollment in a course
   */
  static async getUserEnrollment(userId: string, courseId: string) {
    try {
      return await prisma.enrollment.findFirst({
        where: { userId, courseId },
        include: {
          course: true,
          quizAttempts: true,
          assignmentSubmissions: true,
        },
      });
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
  }

  /**
   * Get all enrollments for a user
   */
  static async getUserEnrollments(userId: string) {
    try {
      return await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnail: true,
              difficulty: true,
              duration: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }
  }

  /**
   * Update enrollment progress
   */
  static async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<boolean> {
    try {
      // Validate progress (0-100)
      if (progress < 0 || progress > 100) {
        return false;
      }

      const enrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          progress: Math.round(progress),
          lastAccessedAt: new Date(),
        },
      });

      // Check if completed
      if (progress >= 100 && !enrollment.isCompleted) {
        await this.markEnrollmentComplete(enrollmentId);
      }

      return !!enrollment;
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      return false;
    }
  }

  /**
   * Mark enrollment as complete
   */
  static async markEnrollmentComplete(enrollmentId: string): Promise<boolean> {
    try {
      const enrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          isCompleted: true,
          progress: 100,
          completedAt: new Date(),
        },
        include: { course: true },
      });

      if (!enrollment.userId) return false;

      // Generate certificate
      await this.generateCompletionCertificate(
        enrollment.userId,
        enrollment.courseId,
        enrollment.course.title
      );

      // Check for completion badges
      await BadgeService.checkAllBadges(enrollment.userId);

      // Create notification
      await this.createCompletionNotification(
        enrollment.userId,
        enrollment.course.title
      );

      return !!enrollment;
    } catch (error) {
      console.error('Error marking enrollment complete:', error);
      return false;
    }
  }

  /**
   * Generate certificate for course completion
   */
  private static async generateCompletionCertificate(
    userId: string,
    courseId: string,
    courseTitle: string
  ): Promise<void> {
    try {
      // Check if certificate already exists
      const existing = await prisma.certificate.findFirst({
        where: { userId, courseId },
      });

      if (existing) return;

      // Calculate final score from quizzes and assignments
      const enrollment = await prisma.enrollment.findFirst({
        where: { userId, courseId },
        include: {
          quizAttempts: { select: { score: true } },
          assignmentSubmissions: { select: { score: true } },
        },
      });

      if (!enrollment) return;

      const quizScores = enrollment.quizAttempts.map((q) => q.score || 0);
      const assignmentScores = enrollment.assignmentSubmissions.map((a) => a.score || 0);

      const avgQuizScore = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b) / quizScores.length : 0;
      const avgAssignmentScore = assignmentScores.length > 0 ? assignmentScores.reduce((a, b) => a + b) / assignmentScores.length : 0;

      const finalScore = Math.round((avgQuizScore + avgAssignmentScore) / 2);

      // Create certificate
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      await prisma.certificate.create({
        data: {
          userId,
          courseId,
          title: courseTitle,
          certificateNumber,
          issuedDate: new Date(),
          qrCode: `qr_${certificateNumber}`,
          certificateUrl: null,
        },
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  }

  /**
   * Create enrollment notification
   */
  private static async createEnrollmentNotification(userId: string, courseName: string): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: `📚 Successfully Enrolled`,
          message: `You've enrolled in ${courseName}. Start learning today!`,
          type: NotificationType.COURSE_ENROLLMENT,
          link: '/dashboard/learn',
        },
      });
    } catch (error) {
      console.error('Error creating enrollment notification:', error);
    }
  }

  /**
   * Create completion notification
   */
  private static async createCompletionNotification(userId: string, courseName: string): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: `🎉 Course Complete!`,
          message: `Congratulations on completing ${courseName}! Check out your certificate.`,
          type: NotificationType.CERTIFICATE_EARNED,
          link: '/dashboard/certificates',
        },
      });
    } catch (error) {
      console.error('Error creating completion notification:', error);
    }
  }

  /**
   * Unenroll user from course
   */
  static async unenrollUser(userId: string, courseId: string): Promise<boolean> {
    try {
      const result = await prisma.enrollment.deleteMany({
        where: {
          userId,
          courseId,
        },
      });

      return result.count > 0;
    } catch (error) {
      console.error('Error unenrolling user:', error);
      return false;
    }
  }
}

export default EnrollmentService;
