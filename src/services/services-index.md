# ImpactEdu Web API Services - Complete Documentation

## Overview

This directory contains a production-grade API client for the ImpactEdu platform. It includes automatic token management, retry logic, comprehensive error handling, and support for all platform features.

## Quick Navigation

| Document | Purpose |
|----------|---------|
| **[api.ts](./api.ts)** | Main API client implementation |
| **[api.types.ts](./api.types.ts)** | TypeScript type definitions |
| **[API_REFERENCE.md](./API_REFERENCE.md)** | Complete API endpoint documentation |
| **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** | Real-world usage examples |
| **[services-index.md](./services-index.md)** | This file |

## API Client Features

### ✅ Core Features
- **Automatic Token Management** - JWT tokens automatically injected in headers
- **Retry Logic** - Exponential backoff for failed requests (max 3 attempts)
- **Error Handling** - Comprehensive error categorization and handling
- **Form Data Support** - Built-in multipart/form-data support for file uploads
- **Auth Interception** - Auto-redirect to login on 401 errors
- **Timeout Protection** - 30-second default timeout for all requests

### 🔐 Authentication
- User registration & login
- Password management
- Token-based JWT authentication
- Automatic logout on auth failures

### 📚 Course Management
- Browse & search courses
- Get personalized recommendations
- Filter by category, level, price, rating
- View trending courses
- Enroll in courses

### 📖 Learning Features
- Track lesson progress
- Submit quiz answers
- Track learning statistics
- Manage course progress
- Complete lessons and earn certificates

### 💬 Community Features
- Create discussion threads
- Reply to discussions
- Upvote helpful posts
- Search users
- Follow/unfollow users
- Networking capabilities

### 📣 Notifications
- Get user notifications with pagination
- Mark notifications as read
- Delete notifications
- Different notification types

### 🎯 Reviews & Ratings
- Submit detailed course reviews
- Quick rate courses (1-5 stars)
- View reviews for courses
- Helpful voting system

### 🎬 Instructor Features
- Create courses
- Add lessons with media
- Upload video content
- Manage course settings
- View instructor dashboard with stats

### 💳 Payments & Subscriptions
- Initiate payments
- Verify payment status
- Subscribe to tiers
- Cancel subscriptions
- Payment history

### 👤 User Profile
- View and edit profile
- Upload profile pictures
- Change password
- Manage preferences

### 📊 Analytics
- Track custom events
- View learning statistics
- Monitor course completion rates
- User activity tracking

## Getting Started

### 1. Import the API Client

```typescript
import { apiClient } from '@/services/api';
```

### 2. Use in Components

```typescript
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';
import type { Course } from '@/services/api.types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.getCourses();
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{courses.length} courses available</div>;
}
```

### 3. Type Safety

All endpoints are fully typed with TypeScript for IDE autocomplete and type checking:

```typescript
import type { Course, User, CourseProgress } from '@/services/api.types';

const course: Course = await apiClient.getCourse('course123');
const user: User = await apiClient.getProfile();
const progress: CourseProgress = await apiClient.getCourseProgress('course123');
```

## API Endpoint Categories

### Authentication Endpoints
```
POST   /auth/register              - Register new user
POST   /auth/login                 - Login user
POST   /users/change-password      - Change password
```

### User Endpoints
```
GET    /users/profile              - Get current user profile
PUT    /users/profile              - Update profile
POST   /users/profile-picture      - Upload profile picture
GET    /users/{userId}             - Get user public profile
GET    /users/search               - Search users
GET    /users/followers            - Get followers
GET    /users/following            - Get following list
POST   /users/{userId}/follow      - Follow user
DELETE /users/{userId}/follow      - Unfollow user
```

### Course Endpoints
```
GET    /courses                    - Get all courses
GET    /courses/{id}               - Get course details
GET    /courses/search             - Search courses
GET    /courses/recommended        - Get recommendations
GET    /courses/category/{cat}     - Get by category
GET    /courses/trending           - Get trending courses
POST   /courses/{id}/start         - Enroll in course
POST   /courses/{id}/rate          - Rate course
POST   /courses/{id}/reviews       - Submit review
GET    /courses/{id}/reviews       - Get reviews
```

### Lesson & Progress Endpoints
```
GET    /courses/{cId}/lessons/{lId}/progress    - Get lesson progress
PUT    /courses/{cId}/lessons/{lId}/progress    - Update progress
POST   /courses/{cId}/lessons/{lId}/quiz        - Submit quiz
GET    /courses/{cId}/progress                  - Get course progress
```

### Discussion Endpoints
```
GET    /discussions                - Get discussions
POST   /discussions                - Create thread
GET    /discussions/{id}           - Get thread
POST   /discussions/{id}/replies   - Add reply
POST   /discussions/posts/{id}/upvote - Upvote post
```

### Notification Endpoints
```
GET    /notifications              - Get notifications
PUT    /notifications/{id}/read    - Mark as read
PUT    /notifications/read-all     - Mark all as read
DELETE /notifications/{id}         - Delete notification
```

### Wishlist Endpoints
```
GET    /wishlist                   - Get wishlist
POST   /wishlist                   - Add to wishlist
DELETE /wishlist/{courseId}        - Remove from wishlist
```

### Payment Endpoints
```
POST   /payments/initiate          - Initiate payment
GET    /payments/{id}/verify       - Verify payment
GET    /subscriptions              - Get subscriptions
POST   /subscriptions              - Subscribe to tier
DELETE /subscriptions/{id}         - Cancel subscription
```

### Instructor Endpoints
```
POST   /instructor/courses         - Create course
PUT    /instructor/courses/{id}    - Update course
DELETE /instructor/courses/{id}    - Delete course
POST   /instructor/courses/{id}/lessons           - Add lesson
POST   /instructor/courses/{id}/lessons/{lId}/media - Upload media
GET    /instructor/dashboard       - Get dashboard
```

### Analytics Endpoints
```
POST   /analytics/track            - Track event
GET    /analytics/learning-stats   - Get stats
```

### Admin Endpoints
```
GET    /admin/dashboard            - Get dashboard
GET    /admin/users                - List users
POST   /admin/users/{id}/suspend   - Suspend user
GET    /admin/moderation/courses   - Get courses for moderation
```

## Error Handling

All errors follow a consistent format:

```typescript
interface ApiError {
  message: string;      // User-friendly message
  status: number;       // HTTP status code
  code?: string;        // Error code (e.g., 'ECONNABORTED')
}
```

### Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response data |
| 400 | Bad Request | Check input validation |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show access denied |
| 404 | Not Found | Show not found message |
| 5xx | Server Error | Auto-retry (3 attempts) |

### Error Handling Example

```typescript
try {
  const course = await apiClient.getCourse(courseId);
} catch (error: any) {
  if (error.status === 401) {
    // Redirect to login
    window.location.href = '/auth/login';
  } else if (error.status === 404) {
    // Show not found
    alert('Course not found');
  } else {
    // Generic error
    console.error('Error:', error.message);
  }
}
```

## Request Retry Logic

Failed requests are automatically retried with exponential backoff:

- **Retryable Errors:**
  - Network timeouts (ECONNABORTED)
  - DNS failures (ENOTFOUND)
  - 5xx server errors

- **Retry Details:**
  - Max retries: 3 attempts
  - Backoff delays: 1s, 2s, 4s
  - Total max wait: ~7 seconds

## Configuration

### Base URL
Set via environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Timeout
Default: 30 seconds

### Token Storage
Uses browser localStorage with these keys:
- `AUTH_TOKEN_KEY` - JWT token
- `AUTH_USER_KEY` - User object (JSON)

## Usage Patterns

### Pattern 1: Simple Data Fetch
```typescript
const courses = await apiClient.getCourses();
```

### Pattern 2: With Error Handling
```typescript
try {
  const course = await apiClient.getCourse(id);
  // Use course
} catch (error: any) {
  console.error('Failed:', error.message);
}
```

### Pattern 3: With Loading State
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      const result = await apiClient.getCourses();
      setData(result.data);
    } finally {
      setLoading(false);
    }
  })();
}, []);
```

### Pattern 4: Form Submission
```typescript
const handleSubmit = async (formData) => {
  try {
    await apiClient.updateProfile(formData);
    // Show success
  } catch (error) {
    // Show error
  }
};
```

## File Upload Example

```typescript
const fileInput = document.getElementById('file') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  await apiClient.uploadProfilePicture(file);
}
```

## Generic Request Methods

For endpoints not explicitly defined:

```typescript
// GET request
const data = await apiClient.get('/custom-endpoint');

// POST request
const data = await apiClient.post('/custom-endpoint', { key: 'value' });

// PUT request
const data = await apiClient.put('/custom-endpoint', { key: 'value' });

// DELETE request
await apiClient.delete('/custom-endpoint');
```

## Component Best Practices

### 1. Use Custom Hooks for Data Fetching
```typescript
export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data
  }, []);

  return { courses, loading, error };
}
```

### 2. Implement Proper Error Boundaries
```typescript
<ErrorBoundary fallback={<div>Failed to load</div>}>
  <CoursesGrid />
</ErrorBoundary>
```

### 3. Use Suspense for Data Loading
```typescript
<Suspense fallback={<Loading />}>
  <CoursesGrid />
</Suspense>
```

### 4. Cache Data When Possible
```typescript
const cache = new Map();

export async function getCourseWithCache(id: string) {
  if (cache.has(id)) return cache.get(id);
  const data = await apiClient.getCourse(id);
  cache.set(id, data);
  return data;
}
```

## Security Considerations

1. **Never store sensitive data in localStorage** except tokens
2. **Always validate inputs** before sending to API
3. **Use HTTPS** in production
4. **Implement CSRF protection** for state-changing requests
5. **Sanitize user inputs** to prevent XSS attacks
6. **Keep tokens short-lived** and refresh regularly
7. **Monitor for suspicious activity** in analytics

## Performance Tips

1. **Debounce search requests** to reduce API calls
2. **Implement pagination** for large data sets
3. **Cache frequently accessed data** (courses, categories)
4. **Use lazy loading** for images and content
5. **Implement request batching** where possible
6. **Monitor API response times** and optimize slow endpoints

## Testing

When testing components that use the API client:

```typescript
import { apiClient } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiClient: {
    getCourses: jest.fn(() => Promise.resolve({ 
      data: [/* mock data */] 
    })),
  },
}));
```

## Monitoring & Debugging

Enable detailed logging by adding to your component:

```typescript
const handleRequest = async () => {
  console.log('Requesting...');
  try {
    const response = await apiClient.getCourses();
    console.log('Success:', response.data);
  } catch (error: any) {
    console.error('Error:', {
      status: error.status,
      message: error.message,
      code: error.code,
    });
  }
};
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial implementation |

## Support & Resource Links

- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Implementation Guide:** [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Type Definitions:** [api.types.ts](./api.types.ts)
- **Main Implementation:** [api.ts](./api.ts)

## Contributing

When adding new API endpoints:

1. Add the method to the `ApiClient` class in `api.ts`
2. Define types in `api.types.ts`
3. Add documentation in `API_REFERENCE.md`
4. Add examples in `IMPLEMENTATION_GUIDE.md`

## FAQ

**Q: How do I handle authentication?**
A: The client automatically manages tokens. After login, tokens are stored in localStorage and automatically included in requests.

**Q: What happens when the token expires?**
A: The client will receive a 401 error and auto-redirect to `/auth/login`.

**Q: How do I upload files?**
A: Use the `uploadProfilePicture()` or `uploadLessonMedia()` methods. The client handles multipart/form-data encoding.

**Q: Can I make requests to any endpoint?**
A: Yes, use the generic `get()`, `post()`, `put()`, `delete()` methods for custom endpoints.

**Q: How do I implement caching?**
A: Use a Map or external caching library like SWR or React Query to cache responses.

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready ✅
