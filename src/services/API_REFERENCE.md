# API Client Reference Guide

## Overview

The `ApiClient` class in `src/services/api.ts` provides a centralized interface for all backend API communications. It includes automatic retry logic, token management, error handling, and request/response interception.

## Features

- **Automatic Token Management**: Injects JWT tokens in request headers
- **Retry Logic**: Automatically retries failed requests with exponential backoff (3 attempts)
- **Error Handling**: Comprehensive error handling with specific codes for different error types
- **Timeout Protection**: 30-second default timeout for all requests
- **Auth Interception**: Auto-redirects to login on 401 errors
- **Form Data Support**: Built-in support for file uploads and multipart form data

## Configuration

```typescript
// Base URL configuration (from environment variables)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// Token storage keys
const AUTH_TOKEN_KEY = "AUTH_TOKEN_KEY";      // Stored in localStorage
const AUTH_USER_KEY = "AUTH_USER_KEY";        // Stored in localStorage
```

## Authentication Endpoints

### `login(email: string, password: string)`
Authenticates user with email and password.

```typescript
const response = await apiClient.login("user@example.com", "password");
// Returns: { token, user, expiresIn }
```

### `register(data: any)`
Creates a new user account.

```typescript
const response = await apiClient.register({
  email: "newuser@example.com",
  password: "securePassword123",
  firstName: "John",
  lastName: "Doe"
});
```

### `logout()`
Clears authentication tokens from localStorage.

```typescript
await apiClient.logout();
```

### `changePassword(oldPassword: string, newPassword: string)`
Updates user password.

```typescript
await apiClient.changePassword("oldPass123", "newPass456");
```

## User Profile Endpoints

### `getProfile()`
Retrieves current user's profile information.

```typescript
const profile = await apiClient.getProfile();
// Returns: { id, email, firstName, lastName, avatar, bio, joinDate }
```

### `updateProfile(data: any)`
Updates current user's profile.

```typescript
await apiClient.updateProfile({
  firstName: "Jane",
  lastName: "Smith",
  bio: "Learning enthusiast",
  avatar: "url-to-avatar"
});
```

### `uploadProfilePicture(file: File)`
Uploads a new profile picture.

```typescript
const fileInput = document.getElementById('profilePic') as HTMLInputElement;
const file = fileInput.files?.[0];
if (file) {
  await apiClient.uploadProfilePicture(file);
}
```

### `getUserProfile(userId: string)`
Retrieves another user's public profile.

```typescript
const userProfile = await apiClient.getUserProfile("user123");
```

## Course Endpoints

### `getCourses()`
Retrieves all available courses.

```typescript
const courses = await apiClient.getCourses();
// Returns: Array of { id, title, description, instructor, level, duration, rating, price }
```

### `getCourse(id: string)`
Retrieves detailed information about a specific course.

```typescript
const course = await apiClient.getCourse("course123");
// Returns: { id, title, description, lessons, materials, instructor, reviews, rating }
```

### `searchCourses(query: string, filters?: any)`
Searches courses by keyword with optional filters.

```typescript
const results = await apiClient.searchCourses("JavaScript", {
  level: "beginner",
  price: { min: 0, max: 100 },
  rating: { min: 4 }
});
```

### `getRecommendedCourses()`
Gets personalized course recommendations.

```typescript
const recommendations = await apiClient.getRecommendedCourses();
```

### `getCoursesByCategory(category: string)`
Retrieves courses in a specific category.

```typescript
const courses = await apiClient.getCoursesByCategory("programming");
```

### `getTrendingCourses()`
Gets currently trending courses.

```typescript
const trending = await apiClient.getTrendingCourses();
```

### `startCourse(courseId: string)`
Enrolls user in a course.

```typescript
await apiClient.startCourse("course123");
```

## Lesson & Progress Endpoints

### `updateLessonProgress(courseId: string, lessonId: string, progress: any)`
Updates progress for a specific lesson.

```typescript
await apiClient.updateLessonProgress("course123", "lesson456", {
  progress: 75,
  watchedDuration: 1200,
  completed: false
});
```

### `completeLessonQuiz(courseId: string, lessonId: string, answers: any)`
Submits quiz answers for a lesson.

```typescript
await apiClient.completeLessonQuiz("course123", "lesson456", {
  answers: [
    { questionId: "q1", answer: "b" },
    { questionId: "q2", answer: "d" }
  ]
});
```

### `getCourseProgress(courseId: string)`
Retrieves overall progress in a course.

```typescript
const progress = await apiClient.getCourseProgress("course123");
// Returns: { courseName, completionPercentage, lessonsCompleted, quizScore, timeSpent }
```

## Discussion & Forum Endpoints

### `getDiscussions(courseId?: string)`
Retrieves forum discussions, optionally filtered by course.

```typescript
// Get all discussions
const discussions = await apiClient.getDiscussions();

// Get discussions for specific course
const courseDiscussions = await apiClient.getDiscussions("course123");
```

### `createDiscussionThread(data: any)`
Creates a new discussion thread.

```typescript
await apiClient.createDiscussionThread({
  title: "How to debug async code?",
  content: "I'm having trouble with promises...",
  courseId: "course123",
  tags: ["javascript", "async"]
});
```

### `getDiscussionThread(threadId: string)`
Retrieves a specific discussion thread with all replies.

```typescript
const thread = await apiClient.getDiscussionThread("thread789");
```

### `addDiscussionReply(threadId: string, content: string)`
Posts a reply to a discussion thread.

```typescript
await apiClient.addDiscussionReply("thread789", "Have you tried using async/await?");
```

### `upvoteDiscussionPost(postId: string)`
Upvotes a discussion post.

```typescript
await apiClient.upvoteDiscussionPost("post123");
```

## Notification Endpoints

### `getNotifications(limit: number = 20, offset: number = 0)`
Retrieves user notifications with pagination.

```typescript
const notifications = await apiClient.getNotifications(10, 0);
// Returns: Array of { id, type, message, timestamp, read, relatedId }
```

### `markNotificationAsRead(notificationId: string)`
Marks a single notification as read.

```typescript
await apiClient.markNotificationAsRead("notif123");
```

### `markAllNotificationsAsRead()`
Marks all notifications as read.

```typescript
await apiClient.markAllNotificationsAsRead();
```

### `deleteNotification(notificationId: string)`
Deletes a notification.

```typescript
await apiClient.deleteNotification("notif123");
```

## Wishlist Endpoints

### `getWishlist()`
Retrieves user's wishlist of courses.

```typescript
const wishlist = await apiClient.getWishlist();
// Returns: Array of course objects
```

### `addToWishlist(courseId: string)`
Adds a course to the wishlist.

```typescript
await apiClient.addToWishlist("course123");
```

### `removeFromWishlist(courseId: string)`
Removes a course from the wishlist.

```typescript
await apiClient.removeFromWishlist("course123");
```

## Review & Rating Endpoints

### `submitCourseReview(courseId: string, review: any)`
Submits a detailed review for a course.

```typescript
await apiClient.submitCourseReview("course123", {
  rating: 5,
  title: "Excellent course!",
  content: "This course helped me understand the concepts...",
  verified: true
});
```

### `getCourseReviews(courseId: string, limit: number = 10)`
Retrieves reviews for a course.

```typescript
const reviews = await apiClient.getCourseReviews("course123", 20);
```

### `rateCourse(courseId: string, rating: number)`
Quick-rates a course (1-5 stars).

```typescript
await apiClient.rateCourse("course123", 4);
```

## Analytics Endpoints

### `trackEvent(eventType: string, data: any)`
Tracks custom events for analytics.

```typescript
await apiClient.trackEvent("lesson_watched", {
  courseId: "course123",
  lessonId: "lesson456",
  duration: 1200,
  timestamp: new Date()
});
```

### `getLearningStats()`
Retrieves user's learning statistics.

```typescript
const stats = await apiClient.getLearningStats();
// Returns: { coursesEnrolled, coursesCompleted, lessonsCompleted, totalHours, averageRating }
```

## Payment & Subscription Endpoints

### `initiatePayment(data: any)`
Initiates a payment transaction.

```typescript
const paymentResponse = await apiClient.initiatePayment({
  courseId: "course123",
  amount: 49.99,
  currency: "USD",
  paymentMethod: "card"
});
// Returns: { transactionId, paymentUrl, expiresAt }
```

### `verifyPayment(paymentId: string)`
Verifies a payment transaction status.

```typescript
const verification = await apiClient.verifyPayment("txn123");
// Returns: { status, amount, paidAt, courseId }
```

### `getSubscriptions()`
Retrieves user's active subscriptions.

```typescript
const subscriptions = await apiClient.getSubscriptions();
// Returns: Array of subscription objects
```

### `subscribeToTier(tierId: string)`
Upgrades or subscribes to a tier.

```typescript
await apiClient.subscribeToTier("premium_tier");
```

### `cancelSubscription(subscriptionId: string)`
Cancels an active subscription.

```typescript
await apiClient.cancelSubscription("sub123");
```

## Instructor Endpoints

### `createCourse(data: any)`
Creates a new course (instructor only).

```typescript
const course = await apiClient.createCourse({
  title: "Advanced TypeScript",
  description: "Master TypeScript features...",
  category: "programming",
  price: 79.99,
  level: "advanced"
});
```

### `updateCourse(courseId: string, data: any)`
Updates course content (instructor only).

```typescript
await apiClient.updateCourse("course123", {
  title: "Advanced TypeScript 2024",
  description: "Updated course description"
});
```

### `deleteCourse(courseId: string)`
Deletes a course (instructor only).

```typescript
await apiClient.deleteCourse("course123");
```

### `addLesson(courseId: string, lessonData: any)`
Adds a lesson to a course.

```typescript
await apiClient.addLesson("course123", {
  title: "Understanding Types",
  description: "Learn about TypeScript types",
  duration: 25,
  sequence: 1
});
```

### `uploadLessonMedia(courseId: string, lessonId: string, file: File)`
Uploads video or media for a lesson.

```typescript
const videoFile = document.getElementById('videoInput')?.files?.[0];
if (videoFile) {
  await apiClient.uploadLessonMedia("course123", "lesson456", videoFile);
}
```

### `getInstructorDashboard()`
Retrieves instructor's dashboard data.

```typescript
const dashboard = await apiClient.getInstructorDashboard();
// Returns: { coursesCreated, students, earnings, reviews, enrollments }
```

## Community Endpoints

### `searchUsers(query: string)`
Searches for users by name or username.

```typescript
const users = await apiClient.searchUsers("john");
```

### `followUser(userId: string)`
Follows another user.

```typescript
await apiClient.followUser("user123");
```

### `unfollowUser(userId: string)`
Unfollows a user.

```typescript
await apiClient.unfollowUser("user123");
```

### `getFollowers()`
Retrieves the current user's followers.

```typescript
const followers = await apiClient.getFollowers();
```

### `getFollowing()`
Retrieves users the current user is following.

```typescript
const following = await apiClient.getFollowing();
```

## Admin Endpoints

### `getAdminDashboard()`
Retrieves admin dashboard overview (admin only).

```typescript
const dashboard = await apiClient.getAdminDashboard();
// Returns: { totalUsers, totalCourses, revenue, activeSubscriptions, disputes }
```

### `getUsersList(limit: number = 20, offset: number = 0)`
Lists all users with pagination (admin only).

```typescript
const users = await apiClient.getUsersList(50, 0);
```

### `suspendUser(userId: string, reason: string)`
Suspends a user account (admin only).

```typescript
await apiClient.suspendUser("user123", "Violation of terms of service");
```

### `getCourseModeration()`
Retrieves courses pending moderation (admin only).

```typescript
const pendingCourses = await apiClient.getCourseModeration();
```

## Generic Methods

### `get(url: string, config?: any)`
Makes a GET request to any endpoint.

```typescript
const data = await apiClient.get("/custom-endpoint", { params: { filter: "value" } });
```

### `post(url: string, data?: any, config?: any)`
Makes a POST request to any endpoint.

```typescript
const response = await apiClient.post("/custom-endpoint", { key: "value" });
```

### `put(url: string, data?: any, config?: any)`
Makes a PUT request to any endpoint.

```typescript
const response = await apiClient.put("/custom-endpoint", { updatedKey: "newValue" });
```

### `delete(url: string, config?: any)`
Makes a DELETE request to any endpoint.

```typescript
await apiClient.delete("/custom-endpoint");
```

## Error Handling

The client includes comprehensive error handling:

```typescript
try {
  await apiClient.getCourse("invalid-id");
} catch (error: any) {
  console.error("Error code:", error.code);
  console.error("Status:", error.status);
  console.error("Message:", error.message);
  
  // Specific error types:
  // - 401: Authentication failed, redirects to login
  // - 403: Forbidden/Access denied
  // - 5xx: Server errors (automatically retried)
  // - Network errors: Automatically retried with exponential backoff
}
```

## Error Response Format

```typescript
interface ApiError {
  message: string;      // User-friendly error message
  status: number;       // HTTP status code
  code?: string;        // Error code (e.g., 'ECONNABORTED')
}
```

## Retry Logic

Failed requests are automatically retried with exponential backoff:
- **Retryable errors:**
  - Network timeouts (ECONNABORTED)
  - DNS failures (ENOTFOUND)
  - 5xx server errors
- **Max retries:** 3 attempts
- **Backoff:** 1s, 2s, 4s delays

## Usage in React Components

```typescript
import { apiClient } from '@/services/api';
import { useEffect, useState } from 'react';

export function CoursePage() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getCourse("course123");
        setCourse(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{course?.title}</div>;
}
```

## Best Practices

1. **Always use try-catch blocks** when calling API methods
2. **Handle network errors gracefully** - provide fallback UI
3. **Use loading states** to improve UX during data fetching
4. **Cache responses** when appropriate to reduce API calls
5. **Validate input data** before making requests
6. **Monitor error logs** to identify recurring issues
7. **Implement request debouncing** for search endpoints
8. **Use pagination** for large data sets

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## API Response Format

All endpoints follow a consistent response format:

```typescript
// Success response
{
  data: { /* endpoint-specific data */ },
  status: 200,
  message: "Success"
}

// Error response
{
  message: "Error description",
  status: 400,
  code: "INVALID_INPUT"
}
```

---

**Last Updated:** 2024
**Version:** 1.0
