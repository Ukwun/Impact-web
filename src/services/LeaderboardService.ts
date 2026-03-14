/**
 * Leaderboard Service
 * Handles leaderboard entry updates and scoring logic
 */

interface LeaderboardUpdateData {
  userId: string;
  activityType: 'course_completed' | 'quiz_passed' | 'assignment_submitted' | 'perfect_score' | 'login_streak' | 'study_time' | 'login';
  points?: number;
  metadata?: Record<string, any>;
}

interface LeaderboardEntry {
  userId: string;
  totalScore: number;
  coursesCompleted: number;
  quizzesPassed: number;
  assignmentsSubmitted: number;
  perfectScores: number;
  streakDays: number;
  studyTimeMinutes: number;
  lastActivityAt: Date;
}

class LeaderboardService {
  private baseUrl = "/api/leaderboard";

  /**
   * Activity point values
   */
  static readonly POINTS = {
    COURSE_COMPLETED: 100,
    QUIZ_PASSED: 25,
    ASSIGNMENT_SUBMITTED: 15,
    PERFECT_SCORE: 50,
    LOGIN_STREAK_DAY: 5,
    STUDY_TIME_MINUTE: 1,
  };

  /**
   * Update leaderboard entry for user activity
   */
  async updateLeaderboardEntry(
    data: LeaderboardUpdateData,
    token: string
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Calculate points if not provided
      let points = data.points || 0;
      if (points === 0) {
        points = this.calculatePoints(data.activityType, data.metadata);
      }

      const response = await fetch(`${this.baseUrl}/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: data.userId,
          activityType: data.activityType,
          points,
          metadata: data.metadata,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
        };
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Calculate points for different activity types
   */
  private calculatePoints(activityType: string, metadata?: Record<string, any>): number {
    switch (activityType) {
      case 'course_completed':
        return LeaderboardService.POINTS.COURSE_COMPLETED;
      case 'quiz_passed':
        return LeaderboardService.POINTS.QUIZ_PASSED;
      case 'assignment_submitted':
        return LeaderboardService.POINTS.ASSIGNMENT_SUBMITTED;
      case 'perfect_score':
        return LeaderboardService.POINTS.PERFECT_SCORE;
      case 'login_streak':
        // Points for maintaining streak
        return (metadata?.streakDays || 0) * LeaderboardService.POINTS.LOGIN_STREAK_DAY;
      case 'study_time':
        // Points per minute of study time
        return (metadata?.minutes || 0) * LeaderboardService.POINTS.STUDY_TIME_MINUTE;
      case 'login':
        return 1; // Small points for daily login
      default:
        return 0;
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
        };
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Batch update multiple leaderboard entries
   */
  async batchUpdateEntries(
    updates: LeaderboardUpdateData[],
    token: string
  ): Promise<{ success: boolean; error?: string; results?: any[] }> {
    const results = [];

    for (const update of updates) {
      const result = await this.updateLeaderboardEntry(update, token);
      results.push(result);
    }

    const hasErrors = results.some(r => !r.success);

    return {
      success: !hasErrors,
      error: hasErrors ? "Some updates failed" : undefined,
      results,
    };
  }

  /**
   * Recalculate leaderboard rankings (admin function)
   */
  async recalculateRankings(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would be a separate API endpoint for recalculating ranks
      const response = await fetch(`${this.baseUrl}/recalculate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
        };
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default LeaderboardService;

/**
 * Example usage:
 *
 * const leaderboardService = new LeaderboardService();
 *
 * // Update when course is completed
 * await leaderboardService.updateLeaderboardEntry({
 *   userId: "user-123",
 *   activityType: "course_completed",
 * }, token);
 *
 * // Update when quiz is passed
 * await leaderboardService.updateLeaderboardEntry({
 *   userId: "user-123",
 *   activityType: "quiz_passed",
 *   metadata: { quizId: "quiz-456", score: 85 }
 * }, token);
 *
 * // Update study time
 * await leaderboardService.updateLeaderboardEntry({
 *   userId: "user-123",
 *   activityType: "study_time",
 *   metadata: { minutes: 30 }
 * }, token);
 */