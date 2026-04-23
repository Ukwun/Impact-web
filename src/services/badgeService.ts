/**
 * BADGE SYSTEM SERVICE
 * Handles automatic badge awarding based on user achievements
 * 
 * File: src/services/badgeService.ts
 * Status: CRITICAL IMPLEMENTATION
 * Priority: P1
 */

import { prisma } from '@/lib/prisma';

export interface BadgeCriteria {
  type: 'COURSE_COMPLETION' | 'QUIZ_SCORE' | 'STREAK' | 'ASSIGNMENT_GRADE' | 'PARTICIPATION' | 'CHALLENGE';
  threshold: number;
  metadata?: Record<string, any>;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: BadgeCriteria;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

/**
 * AVAILABLE BADGES IN SYSTEM
 */
export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  // Learning Badges
  FIRST_LESSON: {
    id: 'first-lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎓',
    color: 'blue',
    criteria: { type: 'COURSE_COMPLETION', threshold: 1 },
    rarity: 'COMMON',
  },

  COURSE_COMPLETER: {
    id: 'course-complete',
    name: 'Course Master',
    description: 'Complete an entire course',
    icon: '🏆',
    color: 'gold',
    criteria: { type: 'COURSE_COMPLETION', threshold: 100 },
    rarity: 'RARE',
  },

  PERFECT_QUIZ: {
    id: 'perfect-quiz',
    name: 'Quiz Ace',
    description: 'Score 100% on a quiz',
    icon: '💯',
    color: 'green',
    criteria: { type: 'QUIZ_SCORE', threshold: 100 },
    rarity: 'UNCOMMON',
  },

  HIGH_SCORER: {
    id: 'high-scorer',
    name: 'Top Scholar',
    description: 'Average score above 85%',
    icon: '⭐',
    color: 'yellow',
    criteria: { type: 'QUIZ_SCORE', threshold: 85 },
    rarity: 'RARE',
  },

  WEEK_STREAK: {
    id: 'week-streak',
    name: 'Consistency Champion',
    description: 'Learn for 7 consecutive days',
    icon: '🔥',
    color: 'red',
    criteria: { type: 'STREAK', threshold: 7 },
    rarity: 'UNCOMMON',
  },

  MONTH_STREAK: {
    id: 'month-streak',
    name: 'Legendary Learner',
    description: 'Learn for 30 consecutive days',
    icon: '⚡',
    color: 'purple',
    criteria: { type: 'STREAK', threshold: 30 },
    rarity: 'EPIC',
  },

  ASSIGNMENT_MASTER: {
    id: 'assignment-master',
    name: 'Task Master',
    description: 'Score A+ on 5 assignments',
    icon: '✅',
    color: 'green',
    criteria: { type: 'ASSIGNMENT_GRADE', threshold: 5 },
    rarity: 'UNCOMMON',
  },

  DISCUSSION_LEADER: {
    id: 'discussion-leader',
    name: 'Voices Matter',
    description: 'Active participant in 10 live sessions',
    icon: '💬',
    color: 'blue',
    criteria: { type: 'PARTICIPATION', threshold: 10 },
    rarity: 'UNCOMMON',
  },

  CHALLENGE_WINNER: {
    id: 'challenge-winner',
    name: 'Challenge Champion',
    description: 'Win 3 learning challenges',
    icon: '🎯',
    color: 'gold',
    criteria: { type: 'CHALLENGE', threshold: 3 },
    rarity: 'RARE',
  },
};

/**
 * Badge Service
 * Handles all badge-related operations
 */
export class BadgeService {
  /**
   * Check if user qualifies for a badge
   * @param userId User ID to check
   * @param badgeId Badge to check against
   * @returns true if user qualifies for badge
   */
  static async checkBadgeEligibility(userId: string, badgeId: string): Promise<boolean> {
    const badge = BADGE_DEFINITIONS[badgeId];
    if (!badge) return false;

    const criteria = badge.criteria;

    switch (criteria.type) {
      case 'COURSE_COMPLETION':
        return await this.checkCourseCompletion(userId, criteria.threshold);

      case 'QUIZ_SCORE':
        return await this.checkQuizScore(userId, criteria.threshold);

      case 'STREAK':
        return await this.checkStreak(userId, criteria.threshold);

      case 'ASSIGNMENT_GRADE':
        return await this.checkAssignmentGrade(userId, criteria.threshold);

      case 'PARTICIPATION':
        return await this.checkParticipation(userId, criteria.threshold);

      case 'CHALLENGE':
        return await this.checkChallengeWins(userId, criteria.threshold);

      default:
        return false;
    }
  }

  /**
   * Award badge to user
   */
  static async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      const badge = BADGE_DEFINITIONS[badgeId];
      if (!badge) return false;

      // Check if already awarded
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_badge: {
            userId,
            badge: badgeId,
          },
        },
      });

      if (existing) return false;

      // Create achievement
      const achievement = await prisma.userAchievement.create({
        data: {
          userId,
          badge: badgeId,
          title: badge.name,
          description: badge.description,
          icon: badge.icon,
        },
      });

      // Update user leaderboard
      await this.updateLeaderboardOnBadge(userId);

      // Create notification
      await this.createBadgeNotification(userId, badge);

      return !!achievement;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  /**
   * Check if user has completed courses
   */
  private static async checkCourseCompletion(userId: string, minCount: number): Promise<boolean> {
    const completedCourses = await prisma.enrollment.count({
      where: {
        userId,
        isCompleted: true,
      },
    });

    return completedCourses >= minCount;
  }

  /**
   * Check quiz score achievement
   */
  private static async checkQuizScore(userId: string, minScore: number): Promise<boolean> {
    const quizzes = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { score: true },
    });

    if (minScore === 100) {
      // Perfect quiz
      return quizzes.some((q) => q.score === 100);
    } else {
      // Average score
      const avgScore = quizzes.length > 0 ? quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length : 0;
      return avgScore >= minScore;
    }
  }

  /**
   * Check consecutive learning days
   */
  private static async checkStreak(userId: string, minDays: number): Promise<boolean> {
    const activities = await prisma.liveSessionAttendance.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    if (activities.length < minDays) return false;

    let streak = 1;
    let lastDate = new Date(activities[0].createdAt);
    lastDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < activities.length; i++) {
      const currentDate = new Date(activities[i].createdAt);
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        streak++;
        if (streak >= minDays) return true;
      } else if (dayDiff > 1) {
        break;
      }

      lastDate = currentDate;
    }

    return streak >= minDays;
  }

  /**
   * Check assignment grade achievement
   */
  private static async checkAssignmentGrade(userId: string, minCount: number): Promise<boolean> {
    const aGrades = await prisma.assignmentSubmission.count({
      where: {
        userId,
        score: { gte: 90 },
      },
    });

    return aGrades >= minCount;
  }

  /**
   * Check live session participation
   */
  private static async checkParticipation(userId: string, minSessions: number): Promise<boolean> {
    const sessions = await prisma.liveSessionAttendance.count({
      where: { userId },
    });

    return sessions >= minSessions;
  }

  /**
   * Check challenge wins
   */
  private static async checkChallengeWins(userId: string, minWins: number): Promise<boolean> {
    const achievements = await prisma.userAchievement.count({
      where: {
        userId,
        badge: { contains: 'challenge' },
      },
    });

    return achievements >= minWins;
  }

  /**
   * Update user leaderboard counters after unlocking badge
   */
  private static async updateLeaderboardOnBadge(userId: string): Promise<void> {
    try {
      const entry = await prisma.leaderboardEntry.findUnique({
        where: { userId },
      });

      if (entry) {
        await prisma.leaderboardEntry.update({
          where: { userId },
          data: {
            totalScore: entry.totalScore + 10,
            lastActivityAt: new Date(),
          },
        });
      } else {
        await prisma.leaderboardEntry.create({
          data: {
            userId,
            totalScore: 10,
            lastActivityAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  /**
   * Create badge notification
   */
  private static async createBadgeNotification(userId: string, badge: BadgeDefinition): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: `🎉 Achievement Unlocked: ${badge.name}`,
          message: badge.description,
          type: 'SYSTEM',
          link: '/dashboard/achievements',
          relatedId: badge.id,
        },
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Get all badges for a user
   */
  static async getUserBadges(userId: string) {
    try {
      return await prisma.userAchievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  }

  /**
   * Check all badges for a user and award eligible ones
   */
  static async checkAllBadges(userId: string): Promise<string[]> {
    const awardedBadges: string[] = [];

    for (const badgeId of Object.keys(BADGE_DEFINITIONS)) {
      const isEligible = await this.checkBadgeEligibility(userId, badgeId);
      if (isEligible) {
        const awarded = await this.awardBadge(userId, badgeId);
        if (awarded) {
          awardedBadges.push(badgeId);
        }
      }
    }

    return awardedBadges;
  }
}

export default BadgeService;
