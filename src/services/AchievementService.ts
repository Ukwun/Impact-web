/**
 * Achievement management utility service
 * Provides helper functions for working with achievements throughout the app
 */

interface AchievementReward {
  badge: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class AchievementService {
  private baseUrl = "/api/achievements";

  /**
   * Unlock an achievement for a user
   */
  async unlockAchievement(
    userId: string,
    achievement: AchievementReward,
    token: string
  ): Promise<AchievementResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...achievement,
        }),
      });

      if (!res.ok) {
        return {
          success: false,
          error: `HTTP ${res.status}`,
        };
      }

      return res.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Fetch user's achievements
   */
  async getUserAchievements(
    token: string
  ): Promise<AchievementResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return {
          success: false,
          error: `HTTP ${res.status}`,
        };
      }

      return res.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Predefined achievement templates
   */
  static readonly ACHIEVEMENTS = {
    // Learning Milestones
    FIRST_COURSE: {
      badge: "first-course",
      title: "Course Starter",
      description: "Complete your first course",
      icon: "🎓",
    },
    FIVE_COURSES: {
      badge: "five-courses",
      title: "Course Collector",
      description: "Complete 5 courses",
      icon: "📚",
    },
    TEN_COURSES: {
      badge: "ten-courses",
      title: "Learning Champion",
      description: "Complete 10 courses",
      icon: "🏆",
    },

    // Engagement
    FIRST_COMMENT: {
      badge: "first-comment",
      title: "Community Voice",
      description: "Make your first forum post",
      icon: "💬",
    },
    HELPFUL_MEMBER: {
      badge: "helpful-member",
      title: "Helpful Member",
      description: "Receive 10 upvotes from the community",
      icon: "👍",
    },

    // Skill Development
    FIRST_SKILL: {
      badge: "first-skill",
      title: "Skill Builder",
      description: "Master your first skill",
      icon: "⚡",
    },
    POLYMATH: {
      badge: "polymath",
      title: "Polymath",
      description: "Complete courses in 5+ different categories",
      icon: "🧠",
    },

    // Consistency
    WEEK_WARRIOR: {
      badge: "week-warrior",
      title: "Week Warrior",
      description: "Log in 7 days in a row",
      icon: "🔥",
    },
    DAILY_LEARNER: {
      badge: "daily-learner",
      title: "Daily Learner",
      description: "Complete a lesson every day for 30 days",
      icon: "📅",
    },

    // Milestones
    FIFTY_POINTS: {
      badge: "fifty-points",
      title: "Point Collector",
      description: "Earn 50 points",
      icon: "⭐",
    },
    HUNDRED_POINTS: {
      badge: "hundred-points",
      title: "Point Master",
      description: "Earn 100 points",
      icon: "💎",
    },

    // Special
    EARLY_ADOPTER: {
      badge: "early-adopter",
      title: "Early Adopter",
      description: "Join ImpactEdu in the first month",
      icon: "🚀",
    },
  };

  /**
   * Check if an achievement was recently unlocked
   */
  static wasRecentlyUnlocked(
    achievements: any[],
    badge: string,
    withinMinutes = 5
  ): boolean {
    const achievement = achievements.find((a) => a.badge === badge);
    if (!achievement) return false;

    const unlockedTime = new Date(achievement.unlockedAt).getTime();
    const now = Date.now();
    const diffMinutes = (now - unlockedTime) / (1000 * 60);

    return diffMinutes <= withinMinutes;
  }

  /**
   * Sort achievements by unlock date (newest first)
   */
  static sortByUnlockDate(achievements: any[]): any[] {
    return [...achievements].sort((a, b) => {
      const timeA = new Date(a.unlockedAt).getTime();
      const timeB = new Date(b.unlockedAt).getTime();
      return timeB - timeA;
    });
  }

  /**
   * Filter achievements by category
   */
  static filterByCategory(
    achievements: any[],
    category: "milestone" | "engagement" | "skill" | "consistency"
  ): any[] {
    const categoryMap: Record<string, string[]> = {
      milestone: ["first-course", "five-courses", "ten-courses", "fifty-points", "hundred-points"],
      engagement: ["first-comment", "helpful-member"],
      skill: ["first-skill", "polymath"],
      consistency: ["week-warrior", "daily-learner"],
    };

    const badges = categoryMap[category] || [];
    return achievements.filter((a) => badges.includes(a.badge));
  }
}

export default AchievementService;

/**
 * Example usage:
 *
 * // Unlock achievement
 * const service = new AchievementService();
 * const result = await service.unlockAchievement(
 *   userId,
 *   AchievementService.ACHIEVEMENTS.FIRST_COURSE,
 *   token
 * );
 *
 * // Fetch achievements
 * const data = await service.getUserAchievements(token);
 *
 * // Sort achievements
 * const sorted = AchievementService.sortByUnlockDate(data.data.achievements);
 *
 * // Filter by category
 * const milestones = AchievementService.filterByCategory(
 *   data.data.achievements,
 *   "milestone"
 * );
 */
