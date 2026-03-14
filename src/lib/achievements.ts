/**
 * Achievement checking utilities
 * Defines all available achievements and their conditions
 */

export interface Achievement {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  condition: (data: any) => boolean;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_course: {
    id: "first_course",
    badge: "first_course",
    title: "First Steps",
    description: "Complete your first course",
    icon: "🎓",
    points: 10,
    condition: (data) => data.completedCourses >= 1,
  },
  five_courses: {
    id: "five_courses",
    badge: "five_courses",
    title: "Scholar",
    description: "Complete 5 courses",
    icon: "📚",
    points: 50,
    condition: (data) => data.completedCourses >= 5,
  },
  perfect_score: {
    id: "perfect_score",
    badge: "perfect_score",
    title: "Perfect Score",
    description: "Achieve 100% on a quiz",
    icon: "⭐",
    points: 25,
    condition: (data) => data.perfectScores >= 1,
  },
  quiz_master: {
    id: "quiz_master",
    badge: "quiz_master",
    title: "Quiz Master",
    description: "Complete 10 quizzes",
    icon: "🧠",
    points: 40,
    condition: (data) => data.quizzesCompleted >= 10,
  },
  assignment_champion: {
    id: "assignment_champion",
    badge: "assignment_champion",
    title: "Assignment Champion",
    description: "Get A+ on 5 assignments",
    icon: "🥇",
    points: 60,
    condition: (data) => data.assignmentsWithGradeA >= 5,
  },
  early_bird: {
    id: "early_bird",
    badge: "early_bird",
    title: "Early Bird",
    description: "Complete a course within 7 days of enrollment",
    icon: "🌅",
    points: 20,
    condition: (data) => data.earlyCompletions >= 1,
  },
  streaker: {
    id: "streaker",
    badge: "streaker",
    title: "On Fire",
    description: "Login for 7 consecutive days",
    icon: "🔥",
    points: 30,
    condition: (data) => data.loginStreak >= 7,
  },
  mentor_star: {
    id: "mentor_star",
    badge: "mentor_star",
    title: "Mentor Star",
    description: "Help 5 other students",
    icon: "⭐",
    points: 50,
    condition: (data) => data.mentorSessions >= 5,
  },
  leaderboard_top_10: {
    id: "leaderboard_top_10",
    badge: "leaderboard_top_10",
    title: "Rising Star",
    description: "Reach top 10 in leaderboard",
    icon: "🌟",
    points: 100,
    condition: (data) => data.leaderboardRank <= 10,
  },
  leaderboard_top_1: {
    id: "leaderboard_top_1",
    badge: "leaderboard_top_1",
    title: "Leaderboard Champion",
    description: "Rank #1 on leaderboard",
    icon: "👑",
    points: 500,
    condition: (data) => data.leaderboardRank === 1,
  },
};

/**
 * Calculate user's achievement progress
 */
export function calculateAchievementProgress(
  userStats: any
): { earned: string[]; available: string[] } {
  const earned: string[] = [];
  const available: string[] = [];

  Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
    if (achievement.condition(userStats)) {
      earned.push(key);
    } else {
      available.push(key);
    }
  });

  return { earned, available };
}

/**
 * Get achievement details by badge
 */
export function getAchievementByBadge(badge: string): Achievement | null {
  return ACHIEVEMENTS[badge] || null;
}

/**
 * Calculate total points earned
 */
export function calculateTotalPoints(unlockedBadges: string[]): number {
  return unlockedBadges.reduce((total, badge) => {
    const achievement = ACHIEVEMENTS[badge];
    return total + (achievement?.points || 0);
  }, 0);
}
