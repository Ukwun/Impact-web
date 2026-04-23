// Database Service - Realistic data operations for ImpactApp
// This service provides all database queries for the platform

import { prisma } from './prisma';
import type {
  User,
  Course,
  Assignment,
  Project,
  Achievement,
  UserProgress,
  Leaderboard,
  Notification,
} from '@prisma/client';

// ============================================================================
// USER OPERATIONS - Core user data and preferences
// ============================================================================

export const UserService = {
  // Get user profile with all related data
  async getProfile(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: { course: true },
        },
        achievements: {
          include: { achievement: true },
        },
        leaderboardEntries: true,
        notifications: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  // Update user profile
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
      location?: string;
      verified?: boolean;
    }
  ) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  // Get user by email (for auth)
  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  // List all users (for admin)
  async listUsers(skip = 0, take = 20) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return { users, total, pages: Math.ceil(total / take) };
  },
};

// ============================================================================
// COURSE OPERATIONS - Learning content management
// ============================================================================

export const CourseService = {
  // Get all courses with filters
  async listCourses(filters?: { status?: string; category?: string }, skip = 0, take = 12) {
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: filters,
        skip,
        take,
        include: {
          lessons: { select: { id: true } },
          facilitator: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where: filters }),
    ]);

    return {
      courses: courses.map((c) => ({
        ...c,
        lessonCount: c.lessons.length,
      })),
      total,
      pages: Math.ceil(total / take),
    };
  },

  // Get course with all content
  async getCourseDetails(courseId: string) {
    return await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        facilitator: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        lessons: {
          include: {
            quizzes: { select: { id: true, title: true } },
          },
          orderBy: { order: 'asc' },
        },
        enrollments: {
          select: { userId: true },
        },
      },
    });
  },

  // Enroll user in course
  async enrollStudent(courseId: string, userId: string) {
    return await prisma.courseEnrollment.create({
      data: {
        courseId,
        userId,
      },
      include: { course: true },
    });
  },

  // Get user's enrolled courses
  async getUserCourses(userId: string) {
    return await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            facilitator: { select: { firstName: true, lastName: true } },
            lessons: { select: { id: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  },
};

// ============================================================================
// ASSIGNMENT OPERATIONS - Project tracking and submissions
// ============================================================================

export const AssignmentService = {
  // Get assignment with student submissions
  async getAssignment(assignmentId: string) {
    return await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: { select: { title: true } },
        submissions: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });
  },

  // Submit assignment
  async submitAssignment(assignmentId: string, studentId: string, submissionData: {
    fileUrl?: string;
    content?: string;
    notes?: string;
  }) {
    return await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        ...submissionData,
      },
    });
  },

  // Get student's submissions
  async getStudentSubmissions(studentId: string) {
    return await prisma.assignmentSubmission.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: { course: { select: { title: true } } },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  },
};

// ============================================================================
// PROGRESS TRACKING - Learning analytics
// ============================================================================

export const ProgressService = {
  // Get user's learning progress
  async getUserProgress(userId: string, courseId?: string) {
    return await prisma.userProgress.findMany({
      where: {
        userId,
        ...(courseId && { courseId }),
      },
      include: {
        lesson: { select: { title: true } },
        course: { select: { title: true } },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });
  },

  // Update progress
  async updateProgress(userId: string, courseId: string, lessonId: string, progress: number) {
    return await prisma.userProgress.upsert({
      where: {
        userId_courseId_lessonId: {
          userId,
          courseId,
          lessonId,
        },
      },
      update: {
        progressPercentage: progress,
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        lessonId,
        progressPercentage: progress,
      },
    });
  },

  // Get learning statistics
  async getLearningStats(userId: string) {
    const [completedLessons, totalEnrolled, achievementCount] = await Promise.all([
      prisma.userProgress.count({
        where: {
          userId,
          progressPercentage: 100,
        },
      }),
      prisma.courseEnrollment.count({
        where: { userId },
      }),
      prisma.userAchievement.count({
        where: { userId },
      }),
    ]);

    return {
      completedLessons,
      enrolledCourses: totalEnrolled,
      achievements: achievementCount,
      lastActive: new Date(),
    };
  },
};

// ============================================================================
// ACHIEVEMENT OPERATIONS - Gamification and recognition
// ============================================================================

export const AchievementService = {
  // Award achievement to user
  async awardAchievement(userId: string, achievementId: string) {
    try {
      return await prisma.userAchievement.create({
        data: {
          userId,
          achievementId,
        },
        include: {
          achievement: true,
        },
      });
    } catch (error: any) {
      // Handle duplicate achievement
      if (error.code === 'P2002') {
        return await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId,
            },
          },
          include: { achievement: true },
        });
      }
      throw error;
    }
  },

  // Get user's achievements
  async getUserAchievements(userId: string) {
    return await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { awardedAt: 'desc' },
    });
  },

  // Check if achievement criterion met
  async checkAndAwardAchievements(userId: string) {
    const stats = await ProgressService.getLearningStats(userId);
    const awarded = [];

    // Award "First Course" achievement
    if (stats.enrolledCourses >= 1) {
      try {
        const achievement = await prisma.achievement.findFirst({
          where: { code: 'FIRST_COURSE' },
        });
        if (achievement) {
          awarded.push(await this.awardAchievement(userId, achievement.id));
        }
      } catch (error) {
        // Already awarded
      }
    }

    return awarded;
  },
};

// ============================================================================
// LEADERBOARD OPERATIONS - Ranking and competition
// ============================================================================

export const LeaderboardService = {
  // Get global leaderboard
  async getGlobalLeaderboard(skip = 0, take = 10) {
    return await prisma.leaderboard.findMany({
      skip,
      take,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { points: 'desc' },
    });
  },

  // Get course-specific leaderboard
  async getCourseLeaderboard(courseId: string, take = 10) {
    return await prisma.leaderboard.findMany({
      where: { courseId },
      take,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { points: 'desc' },
    });
  },

  // Update user points
  async addPoints(userId: string, courseId: string, points: number) {
    return await prisma.leaderboard.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        points: { increment: points },
      },
      create: {
        userId,
        courseId,
        points,
      },
    });
  },
};

// ============================================================================
// NOTIFICATION OPERATIONS - User communications
// ============================================================================

export const NotificationService = {
  // Create notification
  async createNotification(
    userId: string,
    data: {
      type: string;
      title: string;
      message: string;
      relatedId?: string;
    }
  ) {
    return await prisma.notification.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  // Get user's notifications
  async getUserNotifications(userId: string, unreadOnly = false) {
    return await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },
};

// ============================================================================
// ANALYTICS OPERATIONS - Platform insights
// ============================================================================

export const AnalyticsService = {
  // Get platform statistics
  async getPlatformStats() {
    const [totalUsers, activeCourses, totalEnrollments, totalAssignments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: 'ACTIVE' } }),
      prisma.courseEnrollment.count(),
      prisma.assignment.count(),
    ]);

    return {
      totalUsers,
      activeCourses,
      totalEnrollments,
      totalAssignments,
      averageEnrollmentsPerCourse: totalEnrollments / (activeCourses || 1),
    };
  },

  // Get course analytics
  async getCourseAnalytics(courseId: string) {
    const [enrollmentCount, submissionCount, averageProgress] = await Promise.all([
      prisma.courseEnrollment.count({ where: { courseId } }),
      prisma.assignmentSubmission.count({
        where: {
          assignment: { courseId },
        },
      }),
      prisma.userProgress.aggregate({
        where: { courseId },
        _avg: { progressPercentage: true },
      }),
    ]);

    return {
      totalEnrollments: enrollmentCount,
      submissions: submissionCount,
      averageProgress: averageProgress._avg.progressPercentage || 0,
      completionRate: ((enrollmentCount > 0 ? submissionCount / enrollmentCount : 0) * 100).toFixed(2),
    };
  },

  // Get user activity
  async getUserActivity(userId: string, days = 30) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    return await prisma.userProgress.findMany({
      where: {
        userId,
        lastAccessedAt: {
          gte: sinceDate,
        },
      },
      select: {
        lastAccessedAt: true,
        progressPercentage: true,
      },
      orderBy: { lastAccessedAt: 'asc' },
    });
  },
};
