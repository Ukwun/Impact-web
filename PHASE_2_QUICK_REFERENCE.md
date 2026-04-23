# Phase 2 Database Integration - Quick Reference Guide

**TL;DR:** Phase 2 is COMPLETE ✅ - Database fully integrated with 7 service layers and 25+ endpoints

---

## Quick Start (5 minutes)

### 1. Setup Database
```bash
npm run db:migrate    # Create tables
npm run db:push       # Apply schema
npm run db:seed       # Add sample data
npm run db:test       # Verify everything works
```

### 2. Verify Installation
```bash
# Check services are working
npm run dev
curl http://localhost:3000/api/courses
```

### 3. Run Tests
```bash
npm run db:test
# Should show: ✓ 9/9 tests passing
```

---

## 7 Database Services Available

### 1️⃣ UserService
```typescript
import { UserService } from '@/lib/database-service';

// Get user profile
const profile = await UserService.getProfile(userId);

// List all users (paginated)
const users = await UserService.listUsers(0, 10);

// Get user stats
const stats = await UserService.getUserStats(userId);
```

### 2️⃣ CourseService
```typescript
import { CourseService } from '@/lib/database-service';

// List courses with filters
const courses = await CourseService.listCourses(
  { category: 'Math', level: 'Intermediate' },
  0,  // page
  10  // limit
);

// Get course details
const course = await CourseService.getCourseDetails(courseId);

// Enroll user
await CourseService.enrollUser(userId, courseId);

// Search courses
const results = await CourseService.searchCourses('Python');
```

### 3️⃣ ProgressService
```typescript
import { ProgressService } from '@/lib/database-service';

// Get learning stats
const stats = await ProgressService.getLearningStats(userId);
// Returns: completedLessons, achievements, completionRate

// Mark lesson complete
await ProgressService.completeLesson(userId, lessonId);

// Submit assignment
await ProgressService.submitAssignment(
  userId,
  assignmentId,
  { submissionText: '...' }
);
```

### 4️⃣ AchievementService
```typescript
import { AchievementService } from '@/lib/database-service';

// Get user achievements
const achievements = await AchievementService.getUserAchievements(userId);

// Award badge
await AchievementService.awardBadge(userId, badgeId);

// Generate certificate
const cert = await AchievementService.generateCertificate(userId, courseId);
```

### 5️⃣ LeaderboardService
```typescript
import { LeaderboardService } from '@/lib/database-service';

// Get global top performers
const leaders = await LeaderboardService.getGlobalLeaderboard(0, 10);

// Get course leaderboard
const courseLeaders = await LeaderboardService.getCourseLeaderboard(
  courseId,
  0,
  10
);
```

### 6️⃣ NotificationService
```typescript
import { NotificationService } from '@/lib/database-service';

// Get user notifications
const notifications = await NotificationService.getUserNotifications(userId);

// Create notification
await NotificationService.createNotification({
  userId,
  type: 'COURSE_COMPLETED',
  title: 'You completed a course!',
  message: 'Great job finishing Python Basics'
});
```

### 7️⃣ AnalyticsService
```typescript
import { AnalyticsService } from '@/lib/database-service';

// Get platform stats
const stats = await AnalyticsService.getPlatformStats();
// Returns: totalUsers, activeCourses, totalEnrollments, etc.

// Log user activity
await AnalyticsService.trackUserActivity(userId, 'viewed_course');

// Generate report
const report = await AnalyticsService.generateReport({
  startDate: new Date('2026-03-01'),
  endDate: new Date('2026-04-08'),
});
```

---

## 25+ API Endpoints

### Users
```
GET    /api/users/profile              Get user profile
PUT    /api/users/profile              Update profile
GET    /api/users/stats                Get user statistics
GET    /api/users/activity             Get activity log
```

### Courses
```
GET    /api/courses                    List courses
GET    /api/courses/:id                Get course details
POST   /api/courses/:id/enroll         Enroll in course
GET    /api/courses/enrolled           List my courses
GET    /api/courses/search             Search courses
```

### Progress
```
GET    /api/progress/stats             Get learning stats
POST   /api/progress/complete-lesson   Mark lesson complete
POST   /api/progress/submit-assignment Submit assignment
GET    /api/progress/timeline          Get progress timeline
GET    /api/progress/completion        Get completion %
```

### Achievements
```
GET    /api/achievements               Get user achievements
POST   /api/achievements/award         Award badge
GET    /api/achievements/milestones    Check milestones
POST   /api/achievements/certificate   Generate certificate
GET    /api/achievements/leaderboard   Get leaderboard position
```

### Leaderboard
```
GET    /api/leaderboard                Global leaderboard
GET    /api/leaderboard/:courseId      Course leaderboard
GET    /api/leaderboard/topics         Leaderboard categories
POST   /api/leaderboard/update         Update rankings
```

### Notifications
```
GET    /api/notifications              Get notifications
PUT    /api/notifications/:id/read     Mark as read
POST   /api/notifications              Create notification
POST   /api/notifications/bulk         Bulk send
DELETE /api/notifications/:id          Delete notification
```

### Analytics
```
GET    /api/analytics/stats            Platform statistics
POST   /api/analytics/event            Log event
GET    /api/analytics/engagement       Engagement metrics
GET    /api/analytics/report           Generate report
```

---

## In API Routes

```typescript
// Example: Course listing endpoint
import { CourseService } from '@/lib/database-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const result = await CourseService.listCourses(
      { searchQuery: search },
      page,
      limit
    );

    return Response.json(result);
  } catch (error) {
    console.error('Course listing failed:', error);
    return Response.json(
      { error: 'Failed to list courses' },
      { status: 500 }
    );
  }
}
```

## In Server Components

```typescript
// Example: Display courses
import { CourseService } from '@/lib/database-service';

export default async function CoursesPage() {
  const { courses } = await CourseService.listCourses({}, 0, 12);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

---

## Common Patterns

### Pagination
```typescript
// Get page 2, 20 items per page
const { courses, total } = await CourseService.listCourses({}, 1, 20);
console.log(`Showing ${courses.length} of ${total} courses`);
```

### Error Handling
```typescript
import { Prisma } from '@prisma/client';

try {
  await CourseService.enrollUser(userId, courseId);
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }
  }
  throw error;
}
```

### Batch Operations
```typescript
// Award badges to multiple users
const userIds = ['user1', 'user2', 'user3'];
const badgeId = 'badge_first_lesson';

for (const userId of userIds) {
  await AchievementService.awardBadge(userId, badgeId);
}
```

---

## Database Commands

| Command | Purpose |
|---------|---------|
| `npm run db:migrate` | Create/apply migrations |
| `npm run db:push` | Sync schema with database |
| `npm run db:seed` | Load sample data |
| `npm run db:reset` | **DANGER:** Wipe & recreate database |
| `npm run db:test` | Run integration test suite |
| `npx prisma studio` | Visual database browser |

---

## Performance Tips

1. **Use Proper Pagination**
   ```typescript
   // Always paginate large datasets
   const { users } = await UserService.listUsers(0, 100);
   ```

2. **Select Only Needed Fields**
   ```typescript
   // In services, use .select() for efficiency
   const course = await prisma.course.findUnique({
     where: { id: courseId },
     select: { id: true, title: true, description: true }
   });
   ```

3. **Batch Operations**
   ```typescript
   // Instead of loop, use createMany
   await prisma.achievement.createMany({
     data: [/* ... */]
   });
   ```

4. **Cache Results**
   ```typescript
   const cache = new Map();
   if (cache.has(key)) return cache.get(key);
   const result = await expensive_query();
   cache.set(key, result);
   return result;
   ```

---

## Testing

### Run Integration Tests
```bash
npm run db:test

# Output:
# ✓ Database Connection
# ✓ User Service Operations
# ✓ Course Service Operations
# ✓ Progress Tracking Service
# ✓ Leaderboard Service
# ✓ Analytics Service
# ✓ Notification Service
# ✓ Data Integrity Validation
# ✓ Performance Baseline
```

### Manual API Testing
```bash
# Get courses
curl http://localhost:3000/api/courses?page=0&limit=10

# Enroll in course
curl -X POST http://localhost:3000/api/courses/course123/enroll \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123"}'

# Check progress
curl http://localhost:3000/api/progress/stats?userId=user123
```

---

## Environment Setup

Create `.env.local`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/impactapp

# Other services (optional)
SENTRY_DSN=https://...
REDIS_URL=redis://localhost:6379
```

---

## Troubleshooting

### "Can't connect to database"
```bash
# Check connection string
echo $DATABASE_URL

# Test with Prisma
npx prisma db execute --stdin < /dev/null
```

### "Table doesn't exist"
```bash
# Apply migrations
npm run db:push

# If that fails, reset (dev only!)
npm run db:reset
npm run db:seed
```

### "Service returns null"
```typescript
// Check record exists
const exists = await prisma.user.findUnique({
  where: { id: userId }
});
if (!exists) throw new Error('User not found');
```

---

## What's Next?

✅ Phase 2 Complete - Database Integration Done  
🔜 Phase 3 - Advanced Features & Real-time (see NEXT_PRIORITY_ROADMAP.md)

**Key Phase 3 Items:**
- Full-text search
- Real-time notifications (WebSocket)
- Advanced analytics dashboard
- Performance optimization
- Backup & disaster recovery

---

## Files Reference

| File | Purpose |
|------|---------|
| [prisma/schema.prisma](prisma/schema.prisma) | Database schema definition |
| [src/lib/database-service.ts](src/lib/database-service.ts) | All 7 services |
| [src/lib/prisma.ts](src/lib/prisma.ts) | Prisma client singleton |
| [src/app/api/users/route.ts](src/app/api/users/route.ts) | User endpoints |
| [src/app/api/courses/route.ts](src/app/api/courses/route.ts) | Course endpoints |
| [src/app/api/progress/route.ts](src/app/api/progress/route.ts) | Progress endpoints |
| [prisma/test-integration.ts](prisma/test-integration.ts) | Integration tests |
| [PHASE_2_DATABASE_INTEGRATION_COMPLETE.md](PHASE_2_DATABASE_INTEGRATION_COMPLETE.md) | Full documentation |

---

**Last Updated:** 2026-04-08  
**Status:** ✅ Complete & Production Ready
