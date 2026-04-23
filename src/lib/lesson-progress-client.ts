/**
 * Lesson Progress Client Library
 * Simple, realistic API client for tracking lesson progress from the frontend
 * 
 * Usage Examples:
 * 
 * // Track progress as video plays
 * const tracker = new LessonProgressTracker(lessonId, enrollmentId);
 * tracker.start();
 * 
 * // Update progress when video plays (auto-batches updates)
 * const videoElement = document.querySelector('video');
 * videoElement.addEventListener('timeupdate', () => {
 *   tracker.trackProgress(videoElement.currentTime);
 * });
 * 
 * // Get user's progress dashboard
 * const progress = await lessonProgressAPI.getUserProgress();
 * console.log(progress.enrollments); // List of courses
 * 
 * // Get course progress with all lessons
 * const courseProgress = await lessonProgressAPI.getCourseProgress(enrollmentId);
 * console.log(courseProgress.stats.completionPercentage);
 */

import axios, { AxiosInstance } from "axios";

// ============================================================================
// TYPES
// ============================================================================

export interface LessonProgressData {
  lessonId: string;
  enrollmentId: string;
  secondsWatched: number;
  isCompleted: boolean;
  completionPercentage: number;
  updatedAt: string;
}

export interface LessonProgressUpdatePayload {
  lessonId: string;
  enrollmentId: string;
  secondsWatched: number;
  isCompleted?: boolean;
  viewCount?: number;
}

export interface BulkUpdatePayload {
  enrollmentId: string;
  lessons: Array<{
    lessonId: string;
    secondsWatched: number;
    isCompleted?: boolean;
  }>;
}

export interface ProgressSummary {
  enrollments: Array<{
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    completionPercentage: number;
    lessonsCompleted: number;
    totalLessons: number;
    timeSpent: number;
    lastAccessedAt: string;
  }>;
  summary: {
    totalCoursesStarted: number;
    totalCoursesCompleted: number;
    averageCompletionPercentage: number;
    totalTimeSpent: number;
    totalHoursSpent: number;
  };
}

export interface CourseProgressDetail {
  courseId: string;
  title: string;
  lessons: Array<{
    lessonId: string;
    title: string;
    duration: number;
    secondsWatched: number;
    completionPercentage: number;
    isCompleted: boolean;
  }>;
  stats: {
    totalLessons: number;
    lessonsCompleted: number;
    completionPercentage: number;
    totalTimeSpent: number;
  };
}

// ============================================================================
// MAIN API CLIENT
// ============================================================================

export class LessonProgressAPI {
  private api: AxiosInstance;

  constructor(apiBaseURL = "/api") {
    this.api = axios.create({
      baseURL: apiBaseURL,
      timeout: 10000,
    });

    // Add authorization header
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Update progress for a single lesson
   * Call this regularly (e.g., every 30 seconds) while video is playing
   */
  async updateLessonProgress(
    payload: LessonProgressUpdatePayload
  ): Promise<LessonProgressData> {
    const response = await this.api.post("/lessons/progress", payload);
    return response.data.data;
  }

  /**
   * Mark a lesson as complete
   * Call when user finishes watching or manually marks complete
   */
  async completeLessonProgress(
    lessonId: string,
    enrollmentId: string
  ): Promise<LessonProgressData> {
    return this.updateLessonProgress({
      lessonId,
      enrollmentId,
      secondsWatched: 9999999, // Large number to ensure completion
      isCompleted: true,
    });
  }

  /**
   * Bulk update multiple lessons (useful for sync/offline scenarios)
   */
  async bulkUpdateProgress(payload: BulkUpdatePayload) {
    const response = await this.api.put("/lessons/progress", payload);
    return response.data;
  }

  /**
   * Get user's progress across all courses
   */
  async getUserProgress(): Promise<ProgressSummary> {
    const response = await this.api.get("/lessons/progress?type=summary");
    return response.data.data;
  }

  /**
   * Get detailed progress for a specific course
   */
  async getCourseProgress(enrollmentId: string): Promise<CourseProgressDetail> {
    const response = await this.api.get(
      `/lessons/progress?type=course&enrollmentId=${enrollmentId}`
    );
    return response.data.data;
  }

  /**
   * Get progress for a single lesson
   */
  async getLessonProgress(lessonId: string, enrollmentId: string) {
    const response = await this.api.get(
      `/lessons/progress?type=lesson&enrollmentId=${enrollmentId}&lessonId=${lessonId}`
    );
    return response.data.data;
  }

  /**
   * Get progress for all lessons in a module
   */
  async getModuleProgress(enrollmentId: string, moduleId: string) {
    const response = await this.api.get(
      `/lessons/progress?type=module&enrollmentId=${enrollmentId}&moduleId=${moduleId}`
    );
    return response.data.data;
  }
}

// ============================================================================
// LESSON PROGRESS TRACKER (AUTO-TRACKING)
// ============================================================================

/**
 * Automatically track lesson progress as user watches
 * Handles batching, retries, and offline scenarios
 */
export class LessonProgressTracker {
  private lessonId: string;
  private enrollmentId: string;
  private isTracking: boolean = false;
  private updateInterval: number = 30000; // Update every 30 seconds
  private batchQueue: LessonProgressUpdatePayload[] = [];
  private lastUpdateTime: number = 0;
  private api: LessonProgressAPI;

  constructor(lessonId: string, enrollmentId: string) {
    this.lessonId = lessonId;
    this.enrollmentId = enrollmentId;
    this.api = new LessonProgressAPI();
  }

  /**
   * Start tracking progress
   */
  start() {
    if (this.isTracking) return;

    this.isTracking = true;
    console.log(`📍 Started tracking lesson: ${this.lessonId}`);

    // Attach to video element if exists
    const videoElement = document.querySelector(
      "video"
    ) as HTMLVideoElement | null;
    if (videoElement && !videoElement.hasAttribute("data-tracking-enabled")) {
      this.attachToVideo(videoElement);
      videoElement.setAttribute("data-tracking-enabled", "true");
    }
  }

  /**
   * Stop tracking
   */
  stop() {
    this.isTracking = false;
    // Flush remaining updates
    this.flush();
    console.log(`⏹️  Stopped tracking lesson: ${this.lessonId}`);
  }

  /**
   * Attach tracking to video element
   */
  private attachToVideo(video: HTMLVideoElement) {
    // Track progress every 30 seconds
    const interval = setInterval(() => {
      if (this.isTracking && !video.paused) {
        this.trackProgress(video.currentTime);
      }
    }, this.updateInterval);

    // On pause/stop, update final progress
    video.addEventListener("pause", () => {
      if (this.isTracking) {
        this.trackProgress(video.currentTime, false); // Don't auto-complete
      }
    });

    // On completion
    video.addEventListener("ended", () => {
      this.trackProgress(video.duration, true); // Auto-complete
    });

    // Save interval ID for cleanup
    (video as any).__progressTrackingInterval = interval;
  }

  /**
   * Track current progress
   * @param currentTime Current video time in seconds
   * @param isComplete Whether lesson is complete
   */
  async trackProgress(currentTime: number, isComplete?: boolean) {
    if (!this.isTracking) return;

    const now = Date.now();

    // Debounce updates (max once per 5 seconds)
    if (now - this.lastUpdateTime < 5000) {
      return;
    }

    this.lastUpdateTime = now;
    const secondsWatched = Math.round(currentTime);

    try {
      await this.api.updateLessonProgress({
        lessonId: this.lessonId,
        enrollmentId: this.enrollmentId,
        secondsWatched,
        isCompleted: isComplete,
      });

      console.log(
        `✅ Progress tracked: ${secondsWatched}s${isComplete ? " (completed)" : ""}`
      );
    } catch (error) {
      console.error("❌ Failed to track progress:", error);
      // Queue for retry if offline
      this.batchQueue.push({
        lessonId: this.lessonId,
        enrollmentId: this.enrollmentId,
        secondsWatched,
        isCompleted: isComplete,
      });
    }
  }

  /**
   * Flush batched updates (for offline scenarios)
   */
  async flush() {
    if (this.batchQueue.length === 0) return;

    console.log(`📤 Flushing ${this.batchQueue.length} batched updates`);

    try {
      await this.api.bulkUpdateProgress({
        enrollmentId: this.enrollmentId,
        lessons: this.batchQueue,
      });

      this.batchQueue = [];
      console.log("✅ Batched updates flushed");
    } catch (error) {
      console.error("❌ Failed to flush batched updates:", error);
    }
  }
}

// ============================================================================
// PROGRESS DASHBOARD HELPER
// ============================================================================

/**
 * Helper for displaying progress in UI
 */
export class ProgressDashboard {
  private api: LessonProgressAPI;

  constructor() {
    this.api = new LessonProgressAPI();
  }

  /**
   * Get all user courses with progress
   */
  async getCoursesList() {
    const progress = await this.api.getUserProgress();

    return progress.enrollments.map((enrollment) => ({
      ...enrollment,
      completionPercentageDisplay: `${enrollment.completionPercentage}%`,
      estimatedHoursRemaining: Math.ceil(
        enrollment.timeSpent > 0
          ? (enrollment.totalLessons - enrollment.lessonsCompleted) *
              ((enrollment.timeSpent /
                enrollment.lessonsCompleted) /
                3600)
          : 0
      ),
      lastAccessedDisplay: this.formatDate(enrollment.lastAccessedAt),
    }));
  }

  /**
   * Get course details with all lessons
   */
  async getCourseDetails(enrollmentId: string) {
    const progress = await this.api.getCourseProgress(enrollmentId);

    return {
      ...progress,
      lessons: progress.lessons.map((lesson) => ({
        ...lesson,
        completionDisplay: `${lesson.completionPercentage}%`,
        timeSpentDisplay: this.formatSeconds(lesson.secondsWatched),
        statusBadge: lesson.isCompleted
          ? "✅ Completed"
          : lesson.completionPercentage > 0
            ? `📊 ${lesson.completionPercentage}%`
            : "⏳ Not Started",
      })),
    };
  }

  /**
   * Format seconds to readable time
   */
  private formatSeconds(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  /**
   * Format date to relative time
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }
}

// ============================================================================
// OFFLINE SUPPORT
// ============================================================================

/**
 * Queue for tracking progress offline and syncing when online
 */
export class OfflineProgressQueue {
  private queueKey = "lessonProgressOfflineQueue";

  /**
   * Add update to queue
   */
  addToQueue(payload: LessonProgressUpdatePayload) {
    const queue = this.getQueue();
    queue.push(payload);
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  /**
   * Get all queued updates
   */
  getQueue(): LessonProgressUpdatePayload[] {
    const stored = localStorage.getItem(this.queueKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Sync queued updates when online
   */
  async syncQueue() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    const api = new LessonProgressAPI();
    const grouped = this.groupByEnrollment(queue);

    for (const [enrollmentId, lessons] of Object.entries(grouped)) {
      try {
        await api.bulkUpdateProgress({
          enrollmentId,
          lessons: lessons as any,
        });
      } catch (error) {
        console.error(`Failed to sync enrollment ${enrollmentId}:`, error);
        return; // Stop syncing if one fails
      }
    }

    // Clear queue on success
    localStorage.removeItem(this.queueKey);
    console.log("✅ Offline queue synced");
  }

  /**
   * Group updates by enrollment
   */
  private groupByEnrollment(
    updates: LessonProgressUpdatePayload[]
  ): Record<string, any[]> {
    return updates.reduce(
      (acc, update) => {
        if (!acc[update.enrollmentId]) {
          acc[update.enrollmentId] = [];
        }
        acc[update.enrollmentId].push({
          lessonId: update.lessonId,
          secondsWatched: update.secondsWatched,
          isCompleted: update.isCompleted,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const lessonProgressAPI = new LessonProgressAPI();
export const progressDashboard = new ProgressDashboard();
export const offlineProgressQueue = new OfflineProgressQueue();

// Auto-sync when online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("🌐 Back online, syncing progress...");
    offlineProgressQueue.syncQueue();
  });
}

export default {
  LessonProgressAPI,
  LessonProgressTracker,
  ProgressDashboard,
  OfflineProgressQueue,
  lessonProgressAPI,
  progressDashboard,
  offlineProgressQueue,
};
