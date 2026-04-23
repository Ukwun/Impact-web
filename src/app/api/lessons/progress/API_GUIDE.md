# Lesson Progress API - Complete Implementation Guide

## 📚 Overview

This is a **complete lesson progress tracking system** designed for a realistic educational platform. It handles real-world scenarios like:

- ✅ Students watching videos and tracking progress
- ✅ Resuming from where they left off
- ✅ Auto-completing lessons (95%+ watched)
- ✅ Rewatching lessons
- ✅ Bulk syncing (mobile apps, offline)
- ✅ Instructor dashboards with class analytics
- ✅ Student progress dashboards

## 🗂️ Project Structure

```
src/
├── types/
│   └── lessonProgress.ts              # All TypeScript interfaces & types
├── lib/
│   └── lesson-progress-client.ts      # Frontend client library
├── components/
│   └── lessons/
│       └── LessonProgressPlayer.tsx   # Real video player component
└── app/
    └── api/
        └── lessons/
            └── progress/
                ├── route.ts                              # POST & PUT endpoints
                ├── get/route.ts                          # GET endpoints (student view)
                ├── instructor/
                │   └── [courseId]/route.ts              # Instructor dashboard
                └── __tests__/
                    └── progress.test.ts                 # Comprehensive test scenarios
```

## 🔌 API Endpoints

### 1. **Track Progress** (POST, PUT)
**URL:** `POST /api/lessons/progress`

Track a student's progress as they watch a lesson.

#### Request:
```json
{
  "lessonId": "uuid",
  "enrollmentId": "uuid",
  "secondsWatched": 300,
  "isCompleted": false,
  "viewCount": 1
}
```

#### Response:
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "lessonId": "uuid",
    "enrollmentId": "uuid",
    "secondsWatched": 300,
    "isCompleted": false,
    "completionPercentage": 17,
    "updatedAt": "2026-04-23T10:30:00Z"
  }
}
```

#### Real Scenarios:
- **Video tracking:** Call every 30 seconds while video plays
- **Resuming:** Send current watch position to resume
- **Completion:** Auto-completes at 95%+ watched
- **Manual mark:** Pass `isCompleted: true` to force completion

---

### 2. **Bulk Update Progress** (PUT)
**URL:** `PUT /api/lessons/progress`

Update multiple lessons at once (mobile sync, offline scenarios).

#### Request:
```json
{
  "enrollmentId": "uuid",
  "lessons": [
    {
      "lessonId": "uuid",
      "secondsWatched": 1800,
      "isCompleted": true
    },
    {
      "lessonId": "uuid",
      "secondsWatched": 450,
      "isCompleted": false
    }
  ]
}
```

#### Response:
```json
{
  "success": true,
  "message": "2 lessons updated successfully",
  "data": {
    "updated": 2,
    "failed": 0,
    "total": 2,
    "results": [
      {
        "lessonId": "uuid",
        "success": true,
        "secondsWatched": 1800,
        "completionPercentage": 100,
        "isCompleted": true
      }
    ]
  }
}
```

---

### 3. **Get Student Progress** (GET)
**URL:** `GET /api/lessons/progress`

Get detailed progress with flexible filtering.

#### Query Parameters:
- `type`: "summary" | "course" | "lesson" | "module" (default: "summary")
- `enrollmentId`: (required for course/lesson/module)
- `lessonId`: (required for lesson)
- `moduleId`: (required for module)

#### Examples:

**Get summary of all courses:**
```bash
GET /api/lessons/progress?type=summary
```

Response:
```json
{
  "success": true,
  "type": "summary",
  "data": {
    "enrollments": [
      {
        "enrollmentId": "uuid",
        "courseId": "uuid",
        "courseTitle": "Financial Literacy 101",
        "completionPercentage": 45,
        "lessonsCompleted": 5,
        "totalLessons": 11,
        "timeSpent": 7200,
        "lastAccessedAt": "2026-04-23T10:00:00Z"
      }
    ],
    "summary": {
      "totalCoursesStarted": 2,
      "totalCoursesCompleted": 1,
      "averageCompletionPercentage": 60,
      "totalTimeSpent": 18000,
      "totalHoursSpent": 5
    }
  }
}
```

**Get course progress with all lessons:**
```bash
GET /api/lessons/progress?type=course&enrollmentId=uuid
```

Response includes all lessons in course with completion data.

**Get single lesson progress:**
```bash
GET /api/lessons/progress?type=lesson&enrollmentId=uuid&lessonId=uuid
```

---

### 4. **Instructor Dashboard** (GET)
**URL:** `GET /api/lessons/progress/instructor/[courseId]`

Get class-wide progress overview (instructor only).

#### Response:
```json
{
  "success": true,
  "course": {
    "id": "uuid",
    "title": "Financial Literacy 101",
    "totalLessons": 11,
    "lessons": [...]
  },
  "students": [
    {
      "userId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@school.edu",
      "enrolledAt": "2026-04-01T00:00:00Z",
      "completionPercentage": 45,
      "lessonsCompleted": 5,
      "totalLessons": 11,
      "timeSpent": 7200,
      "atRisk": false,
      "lessons": [
        {
          "lessonId": "uuid",
          "title": "Getting Started",
          "completionPercentage": 100,
          "isCompleted": true
        }
      ]
    }
  ],
  "stats": {
    "totalStudents": 25,
    "classAverageCompletion": 52,
    "studentsAtRisk": 3,
    "averageTimePerStudent": 450,
    "averageTimePerLesson": 41
  }
}
```

---

## 📱 Frontend Usage

### Using the Progress Tracker

```typescript
import { LessonProgressTracker } from '@/lib/lesson-progress-client';

// Create tracker
const tracker = new LessonProgressTracker(lessonId, enrollmentId);
tracker.start();

// In video event listener
videoElement.addEventListener('timeupdate', () => {
  tracker.trackProgress(videoElement.currentTime);
});

// When video finishes
videoElement.addEventListener('ended', () => {
  tracker.trackProgress(videoElement.duration, true);
});

// Stop tracking (optional - auto-handled)
tracker.stop();
```

### Using the API Client

```typescript
import { lessonProgressAPI } from '@/lib/lesson-progress-client';

// Update single lesson
await lessonProgressAPI.updateLessonProgress({
  lessonId: 'xyz',
  enrollmentId: 'abc',
  secondsWatched: 300,
});

// Get user progress
const progress = await lessonProgressAPI.getUserProgress();

// Get course progress
const courseProgress = await lessonProgressAPI.getCourseProgress(enrollmentId);

// Mark complete
await lessonProgressAPI.completeLessonProgress(lessonId, enrollmentId);
```

### Using the Component

```typescript
import { LessonProgressPlayer } from '@/components/lessons/LessonProgressPlayer';

export function CoursePage() {
  return (
    <LessonProgressPlayer
      lessonId="lesson-001"
      enrollmentId="enrollment-001"
      videoUrl="https://example.com/video.mp4"
      duration={30}
      title="Getting Started with Finance"
      courseTitle="Financial Literacy 101"
    />
  );
}
```

---

## 🔐 Authentication & Authorization

All endpoints require authentication via JWT token in `Authorization` header:

```bash
Authorization: Bearer <jwt_token>
```

### Permission Model:

1. **Students** can:
   - ✅ Update their own progress
   - ✅ View their own progress
   - ✅ Bulk update their own lessons
   - ❌ View other students' progress
   - ❌ Access instructor endpoints

2. **Instructors** can:
   - ✅ View class-wide progress
   - ✅ View each student's detailed progress
   - ✅ Mark students' lessons complete (if needed)
   - ❌ Access endpoints for other courses

3. **Admins** can:
   - ✅ Access everything

---

## 🌍 Real-World Scenarios

### Scenario 1: Student Watching Video
```
0s  → Student presses play
30s → API: POST /api/lessons/progress (secondsWatched: 30)
60s → API: POST /api/lessons/progress (secondsWatched: 60)
...
1800s → API: POST /api/lessons/progress (secondsWatched: 1800, isCompleted: true)
        → Database auto-marks as complete
        → Webhook fires: lesson.completed
```

### Scenario 2: Student Resumes After Pause
```
User pauses at 5min → Browser: lessonProgress.secondsWatched = 300
User closes app → Progress saved
User returns tomorrow → Component loads previous progress
                     → Video resumes at 5min (300 seconds)
User continues watching → API updates continue from 5min position
```

### Scenario 3: Mobile App Offline Sync
```
User downloads lessons (offline mode)
User watches: Lesson 1 (30 min), Lesson 2 (10 min), Lesson 3 (2 min)
User goes online
Client: PUT /api/lessons/progress (bulk update all 3 lessons)
Server: Updates all, marks Lesson 1 complete
UI: Shows "All progress synced!"
```

### Scenario 4: Instructor Checking Class
```
Instructor: GET /api/lessons/progress/instructor/{courseId}
Server:
  - Gets all 25 enrolled students
  - Calculates each student's progress
  - Identifies 3 students at-risk (< 30% & < 10 min watched)
  - Shows class average: 52% completion
UI: Instructor sees color-coded student list, identifies who needs help
```

---

## 📊 Database Schema Integration

The endpoints integrate with existing Prisma schema:

```prisma
model LessonProgress {
  id                String      @id @default(cuid())
  lessonId          String
  lesson            Lesson      @relation(fields: [lessonId], references: [id])
  
  enrollmentId      String
  enrollment        Enrollment  @relation(fields: [enrollmentId], references: [id])
  
  secondsWatched    Int         @default(0)
  isCompleted       Boolean     @default(false)
  completedAt       DateTime?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@unique([lessonId, enrollmentId])
}
```

---

## ⚙️ Configuration

### Update Interval
Default: 30 seconds between API calls
Configure in `LessonProgressTracker`:
```typescript
tracker.updateInterval = 60000; // 60 seconds
```

### Auto-Completion Threshold
Default: 95% watched = auto-complete
Edit in `route.ts`:
```typescript
isCompleted: completionPercentage >= 95 // Change this value
```

### At-Risk Threshold
Default: < 30% completion AND < 10 min watched
Edit in instructor route:
```typescript
atRisk: completionPercentage < 30 && totalTimeSpent < 600
```

---

## 🧪 Testing

Run comprehensive test suite:

```bash
npm test src/app/api/lessons/progress/__tests__/progress.test.ts
```

Tests cover 10 realistic scenarios:
1. ✅ Student watches lesson first time
2. ✅ Student resumes watching
3. ✅ Student completes lesson
4. ✅ Student rewatch for review
5. ✅ Bulk progress update (mobile sync)
6. ✅ Student views progress dashboard
7. ✅ Instructor views class progress
8. ✅ Authentication & authorization
9. ✅ Input validation
10. ✅ Edge cases (concurrent updates, etc.)

---

## 🐛 Error Handling

API returns standard error responses:

```json
{
  "success": false,
  "error": "Specific error message",
  "details": {} // In development only
}
```

### Status Codes:
- **200:** Success
- **201:** Created
- **207:** Multi-Status (partial success in bulk)
- **400:** Bad request (validation error)
- **401:** Unauthorized (no/invalid token)
- **403:** Forbidden (no permission)
- **404:** Not found
- **500:** Server error

---

## 🚀 Performance Optimization

1. **Debounced Updates:** Progress updates batched every 5 seconds minimum
2. **Batch Insert:** Multiple lessons updated in single transaction
3. **Indexed Queries:** `lessonId_enrollmentId` unique constraint for fast lookups
4. **Select Optimization:** Only fetching needed columns
5. **Connection Reuse:** Prisma client singleton

---

## 📈 Analytics & Reporting

Track learning metrics:
- Total hours spent per student/course
- Completion rates by lesson/module/course
- Average days to completion
- Rewatch patterns
- At-risk students identification
- Engagement trends

All data available via progress endpoints for dashboards and reports.

---

## 🔄 Webhook Events

Progress system can trigger webhooks:
- `lesson.started` - Student opened lesson
- `lesson.completed` - Student completed lesson (95%+)
- `module.completed` - All lessons in module complete
- `course.completed` - Student completed full course
- `student.at_risk` - Student falling behind

---

## ✨ Key Features

✅ **Real-time tracking** - Updates as student watches  
✅ **Resume capability** - Continue from last position  
✅ **Auto-completion** - Mark complete at 95% watched  
✅ **Bulk operations** - Sync multiple lessons at once  
✅ **Instructor insights** - Class-wide analytics  
✅ **Offline support** - Queue & sync when online  
✅ **Comprehensive validation** - All inputs validated  
✅ **Secure** - JWT auth, ownership verification  
✅ **Well-tested** - 10+ realistic scenarios  
✅ **Production-ready** - Error handling, logging, performance optimized  

---

## 📝 Notes

This implementation is designed for a **realistic educational platform** where:
- Students genuinely watch educational videos
- Instructors need to monitor class progress
- Mobile apps sync online/offline data
- Data integrity and security are critical
- Performance must handle hundreds of concurrent users

All code follows Next.js 14 best practices and integrates seamlessly with the existing ImpactApp ecosystem.
