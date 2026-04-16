# API Client Implementation Guide

## Quick Start

The API client is pre-configured and ready to use. Import it in any component or service:

```typescript
import { apiClient } from '@/services/api';
```

## Real-World Examples

### 1. User Authentication

#### Login with Credentials

```typescript
// pages/auth/login.tsx
import { apiClient } from '@/services/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.login(email, password);
      const { token, user } = response.data;

      // Store authentication data
      localStorage.setItem('AUTH_TOKEN_KEY', token);
      localStorage.setItem('AUTH_USER_KEY', JSON.stringify(user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

#### Register New Account

```typescript
// pages/auth/register.tsx
import { apiClient } from '@/services/api';
import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.register(formData);
      // Auto-login after registration
      const { token, user } = response.data;
      localStorage.setItem('AUTH_TOKEN_KEY', token);
      localStorage.setItem('AUTH_USER_KEY', JSON.stringify(user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
        required
      />
      <input
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
        required
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

### 2. Course Discovery & Browsing

#### Browse All Courses with Filters

```typescript
// components/CourseGrid.tsx
import { apiClient } from '@/services/api';
import { useEffect, useState } from 'react';
import type { Course, SearchFilters } from '@/services/api.types';

interface CourseGridProps {
  filters?: SearchFilters;
}

export default function CourseGrid({ filters }: CourseGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let response;

        if (filters?.searchQuery) {
          response = await apiClient.searchCourses(filters.searchQuery, filters);
        } else {
          response = await apiClient.getCourses();
        }

        setCourses(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <div key={course.id} className="border rounded-lg shadow-md p-4">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}
          <h3 className="text-xl font-bold mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{course.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-600">${course.price}</span>
            <span className="text-yellow-500">★ {course.rating}</span>
          </div>
          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">
            View Course
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### Get Course Recommendations

```typescript
// hooks/useRecommendedCourses.ts
import { apiClient } from '@/services/api';
import { useEffect, useState } from 'react';
import type { Course } from '@/services/api.types';

export function useRecommendedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await apiClient.getRecommendedCourses();
        setCourses(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return { courses, loading, error };
}
```

### 3. Course Learning & Progress

#### Track Lesson Progress

```typescript
// components/LessonPlayer.tsx
import { apiClient } from '@/services/api';
import { useEffect, useRef, useState } from 'react';

interface LessonPlayerProps {
  courseId: string;
  lessonId: string;
  videoUrl: string;
}

export default function LessonPlayer({
  courseId,
  lessonId,
  videoUrl,
}: LessonPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchedDuration, setWatchedDuration] = useState(0);

  // Save progress every 30 seconds
  const saveProgressInterval = setInterval(async () => {
    if (videoRef.current) {
      const duration = Math.floor(videoRef.current.currentTime);
      try {
        await apiClient.updateLessonProgress(courseId, lessonId, {
          progress: Math.round(
            (videoRef.current.currentTime / videoRef.current.duration) * 100
          ),
          watchedDuration: duration,
          completed: videoRef.current.currentTime === videoRef.current.duration,
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  }, 30000);

  useEffect(() => {
    return () => clearInterval(saveProgressInterval);
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        width="100%"
        onTimeUpdate={() => {
          if (videoRef.current) {
            setWatchedDuration(Math.floor(videoRef.current.currentTime));
          }
        }}
      />
      <p className="mt-2 text-gray-600">
        Watched: {Math.floor(watchedDuration / 60)} minutes
      </p>
    </div>
  );
}
```

#### Submit Quiz Answers

```typescript
// components/Quiz.tsx
import { apiClient } from '@/services/api';
import { useState } from 'react';
import type { Quiz } from '@/services/api.types';

interface QuizProps {
  courseId: string;
  lessonId: string;
  quiz: Quiz;
  onComplete?: (score: number, passed: boolean) => void;
}

export default function QuizComponent({
  courseId,
  lessonId,
  quiz,
  onComplete,
}: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quizAnswers = quiz.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || '',
      }));

      const response = await apiClient.completeLessonQuiz(
        courseId,
        lessonId,
        { answers: quizAnswers }
      );

      setResult(response.data);
      setSubmitted(true);
      onComplete?.(response.data.score, response.data.passed);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted && result) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-xl font-bold mb-4">Quiz Results</h3>
        <p className="text-2xl font-bold mb-2">
          Score: {result.score}%
        </p>
        <p
          className={`text-lg font-bold ${
            result.passed ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {result.passed ? '✓ Passed' : '✗ Failed'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {quiz.questions.map((question) => (
        <div key={question.id} className="border-b pb-4">
          <p className="font-semibold mb-2">{question.text}</p>
          {question.type === 'multiple_choice' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <label key={idx} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        [question.id]: e.target.value,
                      })
                    }
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
      >
        {loading ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </form>
  );
}
```

### 4. User Profile Management

#### Display and Edit Profile

```typescript
// components/ProfileSettings.tsx
import { apiClient } from '@/services/api';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/services/api.types';

export default function ProfileSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.getProfile();
        setProfile(response.data);
        setFormData(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.updateProfile(formData);
      setProfile(formData as UserProfile);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Bio</label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full border p-2 rounded"
              rows={4}
            />
          </div>
          <div className="space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormData(profile);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="text-lg font-semibold">
              {profile.firstName} {profile.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="text-lg font-semibold">{profile.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Bio</p>
            <p className="text-lg font-semibold">{profile.bio || 'No bio'}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Upload Profile Picture

```typescript
// components/ProfilePictureUpload.tsx
import { apiClient } from '@/services/api';
import { useState, useRef } from 'react';

export default function ProfilePictureUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      await apiClient.uploadProfilePicture(file);
      // Refresh profile or update UI
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed p-6 rounded-lg">
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 rounded-full mx-auto mb-4"
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="w-full"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={!preview || loading}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? 'Uploading...' : 'Upload Picture'}
      </button>
    </div>
  );
}
```

### 5. Course Reviews & Ratings

#### Submit Course Review

```typescript
// components/CourseReview.tsx
import { apiClient } from '@/services/api';
import { useState } from 'react';

interface CourseReviewProps {
  courseId: string;
  onSubmitSuccess?: () => void;
}

export default function CourseReview({
  courseId,
  onSubmitSuccess,
}: CourseReviewProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.submitCourseReview(courseId, {
        rating,
        title,
        content,
        verified: true,
      });
      // Reset form
      setTitle('');
      setContent('');
      setRating(5);
      onSubmitSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-bold">Write a Review</h3>

      <div>
        <label className="block font-semibold mb-2">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-2 rounded"
        >
          <option value={1}>1 - Needs Improvement</option>
          <option value={2}>2 - Not Great</option>
          <option value={3}>3 - Good</option>
          <option value={4}>4 - Very Good</option>
          <option value={5}>5 - Excellent</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-2">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your thoughts"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Detailed Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share what you liked or didn't like about this course"
          required
          rows={5}
          className="w-full border p-2 rounded"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
```

### 6. Forum & Discussions

#### Create Discussion Thread

```typescript
// components/DiscussionForm.tsx
import { apiClient } from '@/services/api';
import { useState } from 'react';

interface DiscussionFormProps {
  courseId?: string;
  onSuccess?: () => void;
}

export default function DiscussionForm({
  courseId,
  onSuccess,
}: DiscussionFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.createDiscussionThread({
        title,
        content,
        courseId,
        tags,
      });
      setTitle('');
      setContent('');
      setTags([]);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your question or topic?"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Description</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Provide details..."
          required
          rows={4}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 border p-2 rounded"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-red-600 font-bold"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
      >
        {loading ? 'Posting...' : 'Post Discussion'}
      </button>
    </form>
  );
}
```

### 7. Shopping & Payments

#### Course Payment Flow

```typescript
// components/CourseCheckout.tsx
import { apiClient } from '@/services/api';
import { useState } from 'react';
import type { Course } from '@/services/api.types';

interface CourseCheckoutProps {
  course: Course;
  onPaymentSuccess?: (transactionId: string) => void;
}

export default function CourseCheckout({
  course,
  onPaymentSuccess,
}: CourseCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'review' | 'payment'>('review');

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.initiatePayment({
        courseId: course.id,
        amount: course.price,
        currency: 'USD',
        paymentMethod: 'card',
      });

      const { transactionId, paymentUrl } = response.data;

      // Redirect to payment gateway
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Course Checkout</h2>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold">{course.title}</h3>
          <p className="text-gray-600">By {course.instructor.name}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Course Price</span>
            <span className="font-semibold">${course.price}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total</span>
            <span>${course.price}</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <button
          onClick={handleInitiatePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
}
```

## Error Handling Best Practices

Always wrap API calls in try-catch blocks:

```typescript
try {
  const course = await apiClient.getCourse(courseId);
  // Use the course data
} catch (error: any) {
  // Handle specific errors
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 403) {
    // Show access denied message
  } else if (error.status === 404) {
    // Show course not found
  } else {
    // Generic error handling
    console.error('Error:', error.message);
  }
}
```

## Loading States

Always manage loading states for better UX:

```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState('');

const fetchData = async () => {
  setLoading(true);
  setError('');
  try {
    const response = await apiClient.getSomeData();
    setData(response.data);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Caching Strategies

Consider implementing caching for frequently accessed data:

```typescript
const courseCache = new Map<string, any>();

export async function getCourseWithCache(courseId: string) {
  if (courseCache.has(courseId)) {
    return courseCache.get(courseId);
  }

  const response = await apiClient.getCourse(courseId);
  courseCache.set(courseId, response.data);
  return response.data;
}
```

---

**Last Updated:** 2024
