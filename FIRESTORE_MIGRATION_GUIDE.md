# Firebase Firestore Migration Guide - ImpactEdu

## Overview

The ImpactEdu application has been migrated from Prisma (ORM) + PostgreSQL to **Firebase Firestore** (NoSQL Cloud Database). This provides:

- ✅ Real-time synchronization
- ✅ Automatic scaling to millions of concurrent users
- ✅ Built-in authentication and authorization
- ✅ Cloud-native architecture
- ✅ Pay-per-use pricing model

---

## Architecture

### Database Structure

```
Firestore Collections:
├── users/
│   ├── {userId}/
│   │   ├── firstName, lastName, email, avatar
│   │   ├── role, verified, active
│   │   └── createdAt, updatedAt
├── courses/
│   ├── {courseId}/
│   │   ├── title, description, image
│   │   ├── instructorId, category, level
│   │   ├── published, enrollmentCount
│   │   ├── lessons/ (subcollection)
│   │   │   ├── {lessonId}/ 
│   │   │   │   ├── title, description, content
│   │   │   │   ├── videoUrl, duration, order
│   │   │   │   └── materials/ (subcollection)
│   │   ├── quizzes/ (subcollection)
│   │   │   ├── {quizId}/
│   │   │   │   ├── title, description, passingScore
│   │   │   │   ├── questions/ (subcollection)
│   │   │   │   └── attempts/ (subcollection)
│   │   └── assignments/ (subcollection)
│   │       ├── {assignmentId}/
│   │       │   ├── title, description, dueDate
│   │       │   └── submissions/ (subcollection)
├── enrollments/
│   ├── {enrollmentId}/
│   │   ├── userId, courseId
│   │   ├── enrolledAt, completedAt
│   │   └── progress tracking
├── events/
│   ├── {eventId}/
│   │   ├── title, description, startDate, endDate
│   │   ├── location, capacity, registeredCount
│   │   └── registrations/ (subcollection)
└── activity_logs/
    ├── {userId}/
    │   └── {activityId}/ (user activity tracking)
```

---

## Service Files

### Available Services

#### 1. **Users Service** (`/src/services/firestore/users.ts`)
```typescript
import { getUser, getUserByEmail, listUsers, createUser, updateUser, deleteUser, verifyUser } from '@/services/firestore/users';

// Get user by ID
const user = await getUser(userId);

// Get user by email
const user = await getUserByEmail('user@example.com');

// Create new user
const newUser = await createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'LEARNER'
});

// Update user
await updateUser(userId, { verified: true });

// Delete user (soft delete)
await deleteUser(userId);
```

#### 2. **Courses Service** (`/src/services/firestore/courses.ts`)
```typescript
import { getCourse, listCourses, createCourse, updateCourse, deleteCourse } from '@/services/firestore/courses';

// Get course
const course = await getCourse(courseId);

// List courses
const courses = await listCourses({ published: true });

// Create course
const course = await createCourse(instructorId, {
  title: 'Course Title',
  description: 'Course description',
  category: 'Business'
});

// Update course
await updateCourse(courseId, { published: true });

// Delete course (soft delete)
await deleteCourse(courseId);

// Manage enrollment count
await incrementEnrollmentCount(courseId);
await decrementEnrollmentCount(courseId);
```

#### 3. **Lessons Service** (`/src/services/firestore/lessons.ts`)
```typescript
import { getLesson, listLessons, createLesson, updateLesson, deleteLesson } from '@/services/firestore/lessons';

// Get lesson
const lesson = await getLesson(lessonId, courseId);

// List lessons for course
const lessons = await listLessons(courseId);

// Create lesson
const lesson = await createLesson(courseId, {
  title: 'Lesson Title',
  description: 'Lesson description',
  videoUrl: 'https://...',
  duration: 300,
  order: 1
});

// Update lesson
await updateLesson(lessonId, courseId, { title: 'New Title' });

// Delete lesson
await deleteLesson(lessonId, courseId);

// Get lesson with user progress
const lessonWithProgress = await getLessonWithProgress(lessonId, courseId, userId);
```

#### 4. **Assignments Service** (`/src/services/firestore/assignments.ts`)
```typescript
import { getAssignment, listAssignments, submitAssignment, gradeSubmission } from '@/services/firestore/assignments';

// Get assignment
const assignment = await getAssignment(assignmentId, courseId);

// List assignments
const assignments = await listAssignments(courseId);
const lessonAssignments = await listAssignments(courseId, lessonId);

// Submit assignment
const submission = await submitAssignment(
  assignmentId, courseId, userId,
  { submissionUrl: 'https://...', notes: 'My submission' }
);

// Get user's submission
const userSubmission = await getUserSubmission(assignmentId, courseId, userId);

// Grade submission
await gradeSubmission(
  assignmentId, submissionId, courseId,
  score=85, feedback='Great work!'
);

// List all submissions
const submissions = await listSubmissions(assignmentId, courseId);
```

#### 5. **Quizzes Service** (`/src/services/firestore/quizzes.ts`)
```typescript
import { getQuiz, listQuizzes, getQuizQuestions, startQuizAttempt, submitQuiz, getUserQuizAttempts } from '@/services/firestore/quizzes';

// Get quiz
const quiz = await getQuiz(quizId, courseId);

// List quizzes
const quizzes = await listQuizzes(courseId);

// Get quiz questions
const questions = await getQuizQuestions(quizId, courseId);

// Start attempt
const attempt = await startQuizAttempt(quizId, courseId, userId);

// Save answers
await saveQuizAnswers(quizId, attemptId, courseId, { question1: 'A', question2: 'C' });

// Submit quiz
await submitQuiz(quizId, attemptId, courseId, score=92, passingScore=70);

// Get user's attempts
const attempts = await getUserQuizAttempts(quizId, courseId, userId);

// Get quiz statistics
const stats = await getQuizStats(quizId, courseId);
```

#### 6. **Events Service** (`/src/services/firestore/events.ts`)
```typescript
import { getEvent, listEvents, registerForEvent, cancelEventRegistration, markEventAttendance } from '@/services/firestore/events';

// Get event
const event = await getEvent(eventId);

// List events
const upcomingEvents = await getUpcomingEvents();
const pastEvents = await getPastEvents();

// Register for event
const registration = await registerForEvent(eventId, userId);

// Cancel registration
await cancelEventRegistration(eventId, registrationId);

// Mark attendance
await markEventAttendance(eventId, registrationId);

// Get user's registrations
const registrations = await getUserEventRegistrations(userId);

// Get event registrations
const eventRegistrations = await getEventRegistrations(eventId);
```

---

## API Routes Migration

### Updated Routes (Firestore-based)

#### Lessons Endpoints
- ✅ `GET /api/courses/[id]/lessons` - List lessons for course
- ✅ `POST /api/courses/[id]/lessons` - Create new lesson
- ✅ `GET /api/courses/[id]/lessons/[lessonId]` - Get specific lesson
- ✅ `PUT /api/courses/[id]/lessons/[lessonId]` - Update lesson
- ✅ `DELETE /api/courses/[id]/lessons/[lessonId]` - Delete lesson

### Still Using Existing firestore-utils.ts

These API routes can use the existing utilities in `@/lib/firestore-utils.ts`:

#### Core Operations
```typescript
// From firestore-utils.ts
import {
  createLesson, deleteLesson, getLesson, listLessons, updateLesson,
  createCourse, deleteCourse, getCourse, listCourses, updateCourse,
  createEnrollment, getEnrollment, deleteEnrollment,
  logActivity, getUserActivity
} from '@/lib/firestore-utils';
```

---

## Migration Checklist

### Phase 1: API Routes ✅
- [x] Lessons endpoints migrated
- [ ] Quizzes endpoints
- [ ] Assignments endpoints
- [ ] Events endpoints
- [ ] User administration endpoints

### Phase 2: Components
- [ ] Update components to use new services
- [ ] Ensure real-time updates with Firestore listeners
- [ ] Add optimistic UI updates

### Phase 3: Features
- [ ] Activity tracking
- [ ] Leaderboard calculations
- [ ] Achievement tracking
- [ ] Analytics dashboard

---

## Using Firestore Services in Components

### Example: Lesson List Component

```typescript
'use client';
import { useEffect, useState } from 'react';
import { listLessons } from '@/services/firestore/lessons';

export function LessonList({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const data = await listLessons(courseId);
        setLessons(data);
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {lessons.map((lesson) => (
        <li key={lesson.id}>{lesson.title}</li>
      ))}
    </ul>
  );
}
```

### Example: Quiz Submit

```typescript
async function handleQuizSubmit(quizId: string, courseId: string, userId: string, answers: Record<string, any>) {
  try {
    // Get quiz details
    const quiz = await getQuiz(quizId, courseId);
    
    // Start attempt
    const attempt = await startQuizAttempt(quizId, courseId, userId);
    
    // Save answers
    await saveQuizAnswers(quizId, attempt.id, courseId, answers);
    
    // Calculate score and submit
    const score = calculateScore(answers, quiz);
    const result = await submitQuiz(quizId, attempt.id, courseId, score, quiz.passingScore);
    
    return result;
  } catch (error) {
    console.error('Quiz submission failed:', error);
    throw error;
  }
}
```

---

## Environment Variables Required

```bash
# Firebase Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side, keep secret)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## Testing Migration

### Check Firestore Connection

```typescript
// In API route or server component
import { db, auth } from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';

export async function testConnection() {
  try {
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    console.log(`✅ Connected to Firestore - Found ${snapshot.docs.length} courses`);
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
}
```

### Sample Test Workflow

```bash
# 1. Build project
npm run build

# 2. Check for errors
# Should show "Build succeeded"

# 3. Test API endpoints
curl http://localhost:3000/api/courses

# 4. Register test user and login

# 5. Complete full course workflow
# - View courses → Enroll → View lessons → Complete quiz
```

---

## Performance Optimization

### Firestore Best Practices

1. **Subcollections vs. Root Collections**
   - Use subcollections for data that's always accessed with parent (lessons under courses)
   - Use root collections for frequently queried independent data (users)

2. **Indexing**
   - Firestore auto-creates single-field indexes
   - Create composite indexes for complex queries in Firebase Console

3. **Pagination**
   - Use `limit()` and `startAfter()` for large result sets
   - Load results in batches of 20-50 documents

4. **Real-time Updates**
   - Use `onSnapshot()` for real-time listening instead of repeated polling
   - Unsubscribe when components unmount

### Example: Real-time Lesson List

```typescript
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export function RealtimeLessonList({ courseId }) {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'courses', courseId, 'lessons'),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLessons(data);
    });

    return () => unsubscribe();
  }, [courseId]);

  return <LessonListUI lessons={lessons} />;
}
```

---

## Common Patterns

### Create with Auto-generated ID
```typescript
const docRef = doc(collection(db, 'courses'));
const courseId = docRef.id; // Get generated ID before saving
await setDoc(docRef, { title, description });
```

### Conditional Query
```typescript
const constraints = [];
if (filters?.published) {
  constraints.push(where('published', '==', true));
}
if (filters?.instructorId) {
  constraints.push(where('instructorId', '==', filters.instructorId));
}
const q = query(collection(db, 'courses'), ...constraints);
```

### Atomic Updates
```typescript
// Use updateDoc for atomic field updates
await updateDoc(doc(db, 'courses', courseId), {
  enrollmentCount: increment(1),
  updatedAt: serverTimestamp()
});
```

---

## Troubleshooting

### Issue: "No Firestore database found"
**Solution:** 
1. Check Firebase project ID in environment variables
2. Create Firestore database in Firebase Console
3. Ensure security rules allow reads/writes

### Issue: "Missing or insufficient permissions"
**Solution:**
1. Update Firestore security rules to allow authenticated access
2. Check that user is properly authenticated
3. Verify role-based access control

### Issue: "Subcollection queries are slow"
**Solution:**
1. Create a Firestore composite index for the query
2. Consider denormalizing data if querying frequently
3. Use pagination with `limit()` and `startAfter()`

---

## Next Steps

1. **Migrate remaining API routes** (quizzes, assignments, events)
2. **Add real-time listeners** in components for live updates
3. **Implement offline support** with Firestore offline persistence
4. **Optimize queries** based on actual usage patterns
5. **Set up monitoring** in Firebase Console
6. **Deploy to production** with Netlify + Firebase

---

## Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/database/admin/start)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)

---

**Last Updated:** April 18, 2026
**Migration Status:** In Progress (75% Complete)
**Next Phase:** API Routes (Quizzes, Assignments, Events)
