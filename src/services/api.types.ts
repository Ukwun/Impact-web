/**
 * API Type Definitions
 * Comprehensive TypeScript types for all API endpoints and responses
 */

// ============================================================================
// Global Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
  lastLogin?: string;
  role: "student" | "instructor" | "admin";
  isActive: boolean;
}

export interface UserProfile extends User {
  phone?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: {
    newsletter: boolean;
    notifications: "all" | "important" | "none";
    theme: "light" | "dark";
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// ============================================================================
// Course Types
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  Category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in minutes
  price: number;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  instructorId: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  tags?: string[];
}

export interface CourseDetail extends Course {
  overview: string;
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string;
  lessons: Lesson[];
  reviews: Review[];
  materials?: CourseMaterial[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number; // in minutes
  videoUrl?: string;
  content?: string;
  sequence: number;
  isPublished: boolean;
  references?: Reference[];
  quizzes?: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  userId: string;
  progress: number; // 0-100
  watchedDuration: number; // in seconds
  completed: boolean;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface CourseMaterial {
  id: string;
  lessonId: string;
  type: "pdf" | "document" | "code" | "other";
  title: string;
  url: string;
  downloadUrl?: string;
}

export interface Reference {
  id: string;
  title: string;
  url: string;
  type: "article" | "documentation" | "video" | "other";
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: "multiple_choice" | "short_answer" | "true_false";
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
}

export interface QuizResponse {
  quizId: string;
  userId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
  score: number;
  passed: boolean;
  completedAt: string;
}

// ============================================================================
// Discussion Types
// ============================================================================

export interface DiscussionThread {
  id: string;
  courseId?: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  replyCount: number;
  upvotes: number;
  isPinned: boolean;
  isResolved?: boolean;
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  isAcceptedAnswer?: boolean;
}

export interface CreateThreadRequest {
  title: string;
  content: string;
  courseId?: string;
  tags?: string[];
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | "homework_reminder"
  | "course_update"
  | "new_message"
  | "discussion_reply"
  | "certificate_earned"
  | "course_recommendation";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string; // ID of related entity (course, discussion, etc.)
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

// ============================================================================
// Review & Rating Types
// ============================================================================

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  rating: number; // 1-5
  title: string;
  content: string;
  verified: boolean; // User completed course
  helpful: number; // Number of helpful votes
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateReviewRequest {
  rating: number;
  title: string;
  content: string;
  verified?: boolean;
}

// ============================================================================
// Progress & Stats Types
// ============================================================================

export interface CourseProgress {
  courseId: string;
  courseName: string;
  instructorName: string;
  status: "not_started" | "in_progress" | "completed";
  completionPercentage: number;
  lessonsTotal: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  timeSpent: number; // in minutes
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface LearningStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  coursesInProgress: number;
  lessonsCompleted: number;
  totalHoursLearned: number;
  currentStreak: number; // days
  longestStreak: number; // days
  averageRating: number;
  certificatesEarned: number;
  totalPoints: number;
}

export interface UserActivity {
  date: string;
  lessonsCompleted: number;
  minutesLearned: number;
  quizzesCompleted: number;
}

// ============================================================================
// Payment & Subscription Types
// ============================================================================

export interface Payment {
  id: string;
  userId: string;
  courseId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitiateRequest {
  courseId?: string;
  tierId?: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  renewalDate?: string;
  autoRenew: boolean;
  cancelledAt?: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxCourses?: number;
}

// ============================================================================
// Instructor Types
// ============================================================================

export interface InstructorProfile extends UserProfile {
  bio: string;
  expertise: string[];
  coursesCreated: number;
  studentsCount: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  bankAccount?: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
  };
}

export interface InstructorDashboard {
  totalStudents: number;
  totalEarnings: number;
  activeSubscribers: number;
  totalReviews: number;
  averageRating: number;
  coursesCreated: number;
  recentEnrollments: {
    courseId: string;
    courseName: string;
    studentName: string;
    enrolledAt: string;
  }[];
  earnings: {
    month: string;
    amount: number;
  }[];
}

// ============================================================================
// Certificate Types
// ============================================================================

export interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  courseName: string;
  instructorName: string;
  completedAt: string;
  certificateUrl: string;
  credentialId: string;
  credentialUrl?: string;
}

// ============================================================================
// Search & Discovery Types
// ============================================================================

export interface SearchFilters {
  level?: "beginner" | "intermediate" | "advanced";
  price?: {
    min: number;
    max: number;
  };
  rating?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  category?: string;
  instructor?: string;
  sortBy?: "relevance" | "rating" | "newest" | "price";
  sortOrder?: "asc" | "desc";
}

export interface SearchResults<T> {
  query: string;
  results: T[];
  total: number;
  facets?: {
    categories: { name: string; count: number }[];
    levels: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
  };
}

// ============================================================================
// Community Types
// ============================================================================

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  coursesCreated?: number;
  coursesCompleted?: number;
  followers: number;
  following: number;
  isFollowing?: boolean;
}

// ============================================================================
// Admin Types
// ============================================================================

export interface AdminDashboard {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingModerations: number;
  reportedContent: number;
  monthlyActiveUsers: number;
  conversionRate: number;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsEvent {
  eventType: string;
  userId: string;
  courseId?: string;
  lessonId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PageViewAnalytics {
  pageUrl: string;
  viewCount: number;
  uniqueVisitors: number;
  averageTimeSpent: number;
  bounceRate: number;
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  User,
  UserProfile,
  AuthResponse,
  Course,
  CourseDetail,
  Lesson,
  LessonProgress,
  Quiz,
  Question,
  DiscussionThread,
  DiscussionReply,
  Notification,
  Review,
  CourseProgress,
  LearningStats,
  Payment,
  Subscription,
  SubscriptionTier,
  InstructorProfile,
  InstructorDashboard,
  Certificate,
  SearchFilters,
  SearchResults,
  UserFollow,
  UserPublicProfile,
  AdminDashboard,
  UserReport,
  AnalyticsEvent,
  PageViewAnalytics,
};
