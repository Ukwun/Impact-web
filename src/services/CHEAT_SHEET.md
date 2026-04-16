# API Client Cheat Sheet

Quick copy-paste reference for common API client patterns.

## Authentication

### Login
```typescript
try {
  const response = await apiClient.login('user@example.com', 'password');
  localStorage.setItem('AUTH_TOKEN_KEY', response.data.token);
  localStorage.setItem('AUTH_USER_KEY', JSON.stringify(response.data.user));
  router.push('/dashboard');
} catch (error: any) {
  alert('Login failed: ' + error.message);
}
```

### Register
```typescript
const response = await apiClient.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});
```

### Logout
```typescript
await apiClient.logout();
window.location.href = '/auth/login';
```

## Course Operations

### Get All Courses
```typescript
const response = await apiClient.getCourses();
const courses = response.data;
```

### Get Single Course
```typescript
const response = await apiClient.getCourse('course123');
const course = response.data;
```

### Search Courses
```typescript
const response = await apiClient.searchCourses('JavaScript', {
  level: 'beginner',
  price: { min: 0, max: 100 },
  rating: { min: 4 }
});
```

### Get Recommendations
```typescript
const response = await apiClient.getRecommendedCourses();
const recommendations = response.data;
```

### Get Trending Courses
```typescript
const response = await apiClient.getTrendingCourses();
const trending = response.data;
```

### Get Courses by Category
```typescript
const response = await apiClient.getCoursesByCategory('programming');
const courses = response.data;
```

### Enroll in Course
```typescript
await apiClient.startCourse('course123');
```

## User Profile

### Get Profile
```typescript
const response = await apiClient.getProfile();
const profile = response.data;
```

### Update Profile
```typescript
await apiClient.updateProfile({
  firstName: 'Jane',
  lastName: 'Smith',
  bio: 'Learning enthusiast'
});
```

### Upload Profile Picture
```typescript
const file = fileInput.files?.[0];
if (file) {
  await apiClient.uploadProfilePicture(file);
}
```

### Change Password
```typescript
await apiClient.changePassword('oldPassword', 'newPassword');
```

## Learning Progress

### Update Lesson Progress
```typescript
await apiClient.updateLessonProgress('course123', 'lesson456', {
  progress: 75,
  watchedDuration: 1200,
  completed: false
});
```

### Submit Quiz
```typescript
const response = await apiClient.completeLessonQuiz('course123', 'lesson456', {
  answers: [
    { questionId: 'q1', answer: 'b' },
    { questionId: 'q2', answer: 'd' }
  ]
});
// Returns: { score, passed, feedback }
```

### Get Course Progress
```typescript
const response = await apiClient.getCourseProgress('course123');
const progress = response.data;
// Returns: { courseName, completionPercentage, lessonsCompleted, quizScore, timeSpent }
```

## Reviews & Ratings

### Submit Review
```typescript
await apiClient.submitCourseReview('course123', {
  rating: 5,
  title: 'Excellent course!',
  content: 'This course exceeded my expectations...',
  verified: true
});
```

### Get Reviews
```typescript
const response = await apiClient.getCourseReviews('course123', 10);
const reviews = response.data;
```

### Rate Course
```typescript
await apiClient.rateCourse('course123', 4);
```

## Discussions

### Get Discussions
```typescript
// Get all discussions
const response = await apiClient.getDiscussions();

// Get discussions for a course
const response = await apiClient.getDiscussions('course123');
```

### Create Discussion Thread
```typescript
await apiClient.createDiscussionThread({
  title: 'How to debug async code?',
  content: 'I have trouble with promises...',
  courseId: 'course123',
  tags: ['javascript', 'async']
});
```

### Get Discussion Thread
```typescript
const response = await apiClient.getDiscussionThread('thread789');
const thread = response.data;
```

### Add Reply to Discussion
```typescript
await apiClient.addDiscussionReply('thread789', 'Great question!')
```

### Upvote Discussion Post
```typescript
await apiClient.upvoteDiscussionPost('post123');
```

## Notifications

### Get Notifications
```typescript
const response = await apiClient.getNotifications(10, 0);
const notifications = response.data;
```

### Mark as Read
```typescript
await apiClient.markNotificationAsRead('notif123');
```

### Mark All as Read
```typescript
await apiClient.markAllNotificationsAsRead();
```

### Delete Notification
```typescript
await apiClient.deleteNotification('notif123');
```

## Wishlist

### Get Wishlist
```typescript
const response = await apiClient.getWishlist();
const wishlist = response.data;
```

### Add to Wishlist
```typescript
await apiClient.addToWishlist('course123');
```

### Remove from Wishlist
```typescript
await apiClient.removeFromWishlist('course123');
```

## Community

### Search Users
```typescript
const response = await apiClient.searchUsers('john');
const users = response.data;
```

### Get User Profile
```typescript
const response = await apiClient.getUserProfile('user123');
const profile = response.data;
```

### Follow User
```typescript
await apiClient.followUser('user123');
```

### Unfollow User
```typescript
await apiClient.unfollowUser('user123');
```

### Get Followers
```typescript
const response = await apiClient.getFollowers();
const followers = response.data;
```

### Get Following
```typescript
const response = await apiClient.getFollowing();
const following = response.data;
```

## Instructor Features

### Create Course
```typescript
const response = await apiClient.createCourse({
  title: 'Advanced TypeScript',
  description: 'Master TypeScript...',
  category: 'programming',
  price: 79.99,
  level: 'advanced'
});
const newCourse = response.data;
```

### Update Course
```typescript
await apiClient.updateCourse('course123', {
  title: 'Updated Title',
  description: 'Updated description'
});
```

### Delete Course
```typescript
await apiClient.deleteCourse('course123');
```

### Add Lesson
```typescript
const response = await apiClient.addLesson('course123', {
  title: 'Understanding Types',
  description: 'Learn about types...',
  duration: 25,
  sequence: 1
});
```

### Upload Lesson Media
```typescript
const file = fileInput.files?.[0];
if (file) {
  await apiClient.uploadLessonMedia('course123', 'lesson456', file);
}
```

### Get Instructor Dashboard
```typescript
const response = await apiClient.getInstructorDashboard();
const dashboard = response.data;
// Returns: { coursesCreated, students, earnings, reviews, enrollments }
```

## Payments

### Initiate Payment
```typescript
const response = await apiClient.initiatePayment({
  courseId: 'course123',
  amount: 49.99,
  currency: 'USD',
  paymentMethod: 'card'
});
const { transactionId, paymentUrl } = response.data;
window.location.href = paymentUrl;
```

### Verify Payment
```typescript
const response = await apiClient.verifyPayment('txn123');
const verification = response.data;
// Returns: { status, amount, paidAt, courseId }
```

### Subscribe to Tier
```typescript
await apiClient.subscribeToTier('premium_tier');
```

### Get Subscriptions
```typescript
const response = await apiClient.getSubscriptions();
const subscriptions = response.data;
```

### Cancel Subscription
```typescript
await apiClient.cancelSubscription('sub123');
```

## Analytics

### Track Event
```typescript
await apiClient.trackEvent('lesson_watched', {
  courseId: 'course123',
  lessonId: 'lesson456',
  duration: 1200
});
```

### Get Learning Stats
```typescript
const response = await apiClient.getLearningStats();
const stats = response.data;
// Returns: { coursesEnrolled, coursesCompleted, lessonsCompleted, totalHours, averageRating }
```

## Error Handling

### Basic Try-Catch
```typescript
try {
  const result = await apiClient.getSomeData();
} catch (error: any) {
  console.error('Error:', error.message);
}
```

### With Status Code Handling
```typescript
try {
  const result = await apiClient.getCourse('course123');
} catch (error: any) {
  if (error.status === 401) {
    window.location.href = '/auth/login';
  } else if (error.status === 404) {
    alert('Course not found');
  } else if (error.status === 403) {
    alert('Access denied');
  } else {
    alert('Error: ' + error.message);
  }
}
```

## React Component Patterns

### Simple Data Fetch
```typescript
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await apiClient.getCourses();
        setData(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{/* render data */}</div>;
}
```

### Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  
  try {
    await apiClient.updateProfile({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    });
    alert('Updated successfully');
  } catch (error: any) {
    alert('Error: ' + error.message);
  }
};
```

### Loading State During Request
```typescript
const [loading, setLoading] = useState(false);

const handleClick = async () => {
  setLoading(true);
  try {
    await apiClient.startCourse('course123');
    alert('Enrolled successfully');
  } finally {
    setLoading(false);
  }
};
```

## Custom Hooks

```typescript
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiClient.getCourses();
        setCourses(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { courses, loading, error };
}

// Usage:
// const { courses, loading, error } = useCourses();
```

## Generic Methods

```typescript
// For custom endpoints
const data = await apiClient.get('/custom-endpoint');
const result = await apiClient.post('/custom-endpoint', { data });
const updated = await apiClient.put('/custom-endpoint', { data });
await apiClient.delete('/custom-endpoint');
```

## Type Imports

```typescript
import type {
  User,
  Course,
  Lesson,
  CourseProgress,
  DiscussionThread,
  Notification,
  Review,
  Certificate,
  Subscription,
  InstructorDashboard,
  LearningStats,
  SearchFilters,
} from '@/services/api.types';
```

---

**Quick Links:**
- 📖 [API Reference](./API_REFERENCE.md)
- 💡 [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- 📋 [Services Index](./services-index.md)
- 🔧 [Main API Client](./api.ts)
- 📝 [Type Definitions](./api.types.ts)

**Last Updated:** 2024
