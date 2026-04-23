/**
 * Lesson Progress & Tracking Types
 * Comprehensive types for tracking student lesson progress with realistic learning scenarios
 */

/**
 * Detailed lesson progress for a specific lesson
 * Tracks viewing time, completion status, and learning metrics
 */
export interface LessonProgress {
  id: string;
  lessonId: string;
  enrollmentId: string;
  
  // Viewing/Engagement metrics
  secondsWatched: number;        // Total time spent watching (from 0 to lesson duration)
  percentageCompleted: number;   // 0-100% of lesson watched
  lastAccessedAt: Date;
  
  // Completion status
  isCompleted: boolean;
  completedAt?: Date;
  
  // Learning context
  viewCount: number;             // How many times lesson was accessed (rewatching)
  sessionCount: number;          // How many separate sessions
  averageSessionDuration: number; // seconds per session
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update payload for tracking lesson progress
 * Realistic scenarios: partial viewing, rewatching, jumping around, resuming
 */
export interface UpdateLessonProgressPayload {
  secondsWatched: number;  // Required: current watch position
  isCompleted?: boolean;   // Optional: mark as complete
  completedAt?: Date;      // Optional: when marked complete
  viewCount?: number;      // Optional: increment if new view
}

/**
 * Batch update multiple lessons
 * Used for: bulk completing lessons, importing progress, syncing data
 */
export interface BulkLessonProgressPayload {
  lessons: Array<{
    lessonId: string;
    secondsWatched: number;
    isCompleted?: boolean;
    completedAt?: Date;
  }>;
}

/**
 * Lesson progress statistics for a course/module
 * Shows overall learning progress
 */
export interface LessonProgressStats {
  courseId: string;
  enrollmentId: string;
  
  totalLessons: number;
  lessonsCompleted: number;
  lessonsInProgress: number;
  lessonsNotStarted: number;
  
  completionPercentage: number;  // 0-100
  averageProgress: number;       // of all lessons
  totalTimeSpent: number;        // seconds across all lessons
  
  estimatedCompletionDays: number; // based on current pace
  lastAccessedAt?: Date;
}

/**
 * Lesson with progress info (for listing)
 * Used in dashboards and progress views
 */
export interface LessonWithProgress {
  id: string;
  title: string;
  description?: string;
  duration: number;              // lesson duration in minutes
  order: number;
  moduleId?: string;
  
  // Progress info
  progress: LessonProgress | null;
  isCompleted: boolean;
  percentageWatched: number;     // 0-100
  secondsWatched: number;
  secondsRemaining: number;      // duration - secondsWatched
  lastAccessedAt?: Date;
}

/**
 * Module progress with all lessons
 * Shows complete module state
 */
export interface ModuleWithLessonsProgress {
  id: string;
  title: string;
  courseId: string;
  order: number;
  
  lessons: LessonWithProgress[];
  
  // Module-level stats
  totalLessons: number;
  lessonsCompleted: number;
  completionPercentage: number;
  totalDuration: number;         // sum of all lesson durations
  timeSpent: number;             // seconds spent in module
  isModuleCompleted: boolean;
  lastAccessedAt?: Date;
}

/**
 * Course progress view with all modules and lessons
 * Complete course learning state
 */
export interface CourseProgressView {
  id: string;
  title: string;
  enrollmentId: string;
  
  modules: ModuleWithLessonsProgress[];
  
  // Course-level stats
  totalLessons: number;
  lessonsCompleted: number;
  completionPercentage: number;
  totalDuration: number;
  timeSpent: number;
  
  courseInProgress: boolean;
  courseCompleted: boolean;
  lastAccessedAt?: Date;
  completedAt?: Date;
}

/**
 * Detailed progress response for API
 * Used in GET endpoints
 */
export interface LessonProgressResponse {
  success: boolean;
  data?: LessonProgress | LessonProgressStats | CourseProgressView | LessonWithProgress[];
  error?: string;
  message?: string;
}

/**
 * Progress update response
 * Used in POST/PUT endpoints
 */
export interface ProgressUpdateResponse {
  success: boolean;
  message: string;
  data?: {
    lessonId: string;
    secondsWatched: number;
    isCompleted: boolean;
    completionPercentage: number;
    updatedAt: Date;
  };
  error?: string;
}

/**
 * Realistic progress tracking scenarios
 */
export enum ProgressTrackingScenario {
  // Student starts watching a new lesson
  START_LESSON = "START_LESSON",
  
  // Student resumes watching from where they left off
  RESUME_LESSON = "RESUME_LESSON",
  
  // Student watches entire lesson and marks complete
  COMPLETE_LESSON = "COMPLETE_LESSON",
  
  // Student jumps around in lesson (not sequential viewing)
  JUMP_IN_LESSON = "JUMP_IN_LESSON",
  
  // Student rewatches lesson for review
  REWATCH_LESSON = "REWATCH_LESSON",
  
  // Student abandons lesson midway
  ABANDON_LESSON = "ABANDON_LESSON",
  
  // Instructor marks student's lesson as complete
  INSTRUCTOR_MARK_COMPLETE = "INSTRUCTOR_MARK_COMPLETE",
  
  // Bulk update (import or sync multiple lessons)
  BULK_UPDATE = "BULK_UPDATE",
}

/**
 * Learning analytics summary
 * For dashboard and reporting
 */
export interface LearningAnalytics {
  userId: string;
  courseId: string;
  
  // Time metrics
  totalTimeSpent: number;        // seconds
  averageDailyEngagement: number; // seconds
  streakDays: number;            // consecutive days of engagement
  lastEngagementDate: Date;
  
  // Progress metrics
  coursesStarted: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  certificatesEarned: number;
  
  // Engagement metrics
  viewCount: number;
  sessionCount: number;
  averageSessionLength: number;  // seconds
  
  // Estimated completion
  estimatedCompletionDate?: Date;
  completionPercentage: number;
}

/**
 * Progress webhooks for notifications
 */
export interface ProgressWebhookEvent {
  type:
    | "lesson.started"
    | "lesson.completed"
    | "lesson.paused"
    | "module.completed"
    | "course.completed";
  userId: string;
  courseId: string;
  lessonId?: string;
  moduleId?: string;
  timestamp: Date;
  data: any;
}
