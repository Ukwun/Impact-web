# 🔧 IMPACTAPP WEB - MISSING FEATURES FIX PLAN
**Date:** April 16, 2026  
**Status:** Implementing Critical Fixes  
**Estimated Time:** 3-5 days of focused work

---

## CRITICAL PRIORITY 1 - IMPLEMENTING NOW

### Phase 1A: Course Management API (Day 1)
```
✅ POST /api/courses          - Create course
✅ PUT /api/courses/[id]      - Update course
✅ DELETE /api/courses/[id]   - Delete course
✅ POST /api/courses/[id]/lessons    - Create lesson
✅ PUT /api/courses/[id]/lessons/[id] - Update lesson
✅ DELETE /api/courses/[id]/lessons/[id] - Delete lesson
```

### Phase 1B: Facilitator Dashboard Wiring (Day 1)
```
✅ "Create Course" button → Opens modal → Calls POST /api/courses
✅ "Edit Course" button → Opens modal → Calls PUT /api/courses/[id]
✅ "View Analytics" button → Loads facilitator-specific stats
✅ Load real courses from database (not hardcoded)
```

### Phase 1C: Admin Panel Complete CRUD (Day 2)
```
✅ User Management (ban, deactivate, role change)
✅ Membership Tier CRUD (POST, PUT, DELETE)
✅ Real system alerts (from database)
✅ Real institution statistics
✅ Full dashboard with real data
```

### Phase 1D: File Operations & Authorization (Day 2)
```
✅ Add authorization check to file downloads (MISSING)
✅ POST /api/files/delete - Delete files
✅ GET /api/files/list - List user's files
✅ Security validation on all operations
```

### Phase 1E: Event Management Complete (Day 3)
```
✅ PUT /api/events/[id]   - Update event
✅ DELETE /api/events/[id] - Delete event
✅ Admin interface to manage events
```

### Phase 1F: Landing Page Real Data (Day 3)
```
✅ Impact Numbers → From database (real user counts)
✅ Partners → From database (admin-managed)
✅ Testimonials → From testimonials API (real data)
```

### Phase 1G: Hardcoded Pages to APIs (Day 3-4)
```
✅ Dashboard > Learn → List courses from /api/courses
✅ Dashboard > Community → List circles from /api/circle-member
✅ Remove all Math.random() and dummy data
✅ Real database queries only
```

---

## PRIORITY 2 - IMPORTANT (Days 4-5)

### Phase 2A: Notification System
```
✅ /api/notifications - CRUD
✅ Notification center UI
✅ Real-time notification service
```

### Phase 2B: Global Search
```
✅ /api/search - Global search endpoint
✅ Search across courses, events, users
✅ Advanced filtering
```

### Phase 2C: Data Export
```
✅ /api/admin/export - Export users/analytics
✅ CSV download functionality
```

---

## IMPLEMENTATION DETAILS

### File Structure Changes
```
src/app/api/
├── courses/
│   ├── route.ts          [MODIFY] Add POST
│   ├── [id]/
│   │   ├── route.ts      [MODIFY] Add PUT, DELETE
│   │   └── lessons/
│   │       ├── route.ts  [MODIFY] Create - Add POST
│   │       └── [lessonId]/
│   │           └── route.ts [CREATE] - CRUD
├── admin/
│   ├── users/            [CREATE] User management
│   ├── tiers/            [MODIFY] Add POST, DELETE
│   └── dashboard/        [MODIFY] Real data queries
├── events/
│   ├── [id]/
│   │   └── route.ts      [MODIFY] Add PUT, DELETE
├── files/
│   ├── download/         [MODIFY] Add authorization
│   └── delete/           [CREATE] Delete endpoint
└── notifications/ [CREATE] Full CRUD

src/components/
├── dashboard/
│   ├── FacilitatorDashboard.tsx  [MODIFY] Wire buttons
│   ├── AdminDashboard.tsx        [MODIFY] Real data
├── landing/               [MODIFY] Real data
└── modals/
    ├── CreateCourseModal.tsx     [CREATE]
    ├── EditCourseModal.tsx       [CREATE]
    └── ManageCoursesModal.tsx    [CREATE]
```

---

## API ENDPOINTS TO CREATE/MODIFY

### Courses Management
```
PUT /api/courses/[id]
- Update course title, description, thumbnail
- Update course metadata (difficulty, duration, language)
- Only creator or admin can edit
- Validate all inputs

DELETE /api/courses/[id]
- Soft delete (mark isArchived = true)
- Only creator or admin can delete
- Move to archive, don't permanently delete

POST /api/courses/[id]/lessons
- Create lesson in course
- Only creator or facilitators can add
- Validate lesson data

PUT /api/courses/[id]/lessons/[lessonId]
- Update lesson title, description, content
- Update video URL, materials

DELETE /api/courses/[id]/lessons/[lessonId]
- Soft delete lesson
- Update enrollments if needed
```

### Admin User Management
```
GET /api/admin/users
- List all users with filters
- Support pagination, sorting, search

PUT /api/admin/users/[id]
- Update user role
- Ban/deactivate user
- Only admin can edit

DELETE /api/admin/users/[id]
- Deactivate user account
- Keep data for records

GET /api/admin/dashboard
- Real analytics from database
- User counts, course stats, revenue
- No hardcoded numbers
```

### File Operations
```
GET /api/files/download/[id]
- Add authorization check (CRITICAL FIX)
- Only owner can download their files
- Log downloads for audit

POST /api/files/delete/[id]
- Delete file from S3
- Remove from database
- Only owner or admin can delete

GET /api/files
- List user's uploaded files
- Pagination and filtering
```

### Notifications
```
POST /api/notifications
- Create notification for user
- Support types: alert, achievement, message

GET /api/notifications
- Get user's notifications
- Paginated, filterable

PUT /api/notifications/[id]
- Mark as read
- Archive notification

DELETE /api/notifications/[id]
- Delete notification
```

---

## COMPONENT CHANGES

### FacilitatorDashboard Wiring
```
Create Course Button
├─ Click handler
├─ Opens CreateCourseModal
│  ├─ Form with fields
│  └─ Submit → POST /api/courses
├─ On success → Reload course list
└─ On error → Show error toast

Edit Course Button
├─ Click handler
├─ Opens EditCourseModal  
│  ├─ Pre-fill with current data
│  └─ Submit → PUT /api/courses/[id]
├─ On success → Reload course list
└─ On error → Show error toast
```

### AdminDashboard Real Data
```
Instead of:
- Random Math.random() numbers
- Hardcoded institution stats
- Dummy alert messages

Use:
- SELECT COUNT(*) FROM users
- SELECT COUNT(*) FROM courses WHERE isPublished
- SELECT AVG(progress) FROM enrollments
- SELECT * FROM system_alerts ORDER BY createdAt DESC
```

### Landing Page Real Data
```
Impact Numbers Section
├─ Total Users: SELECT COUNT(*) FROM users
├─ Active Courses: SELECT COUNT(*) FROM courses WHERE isPublished
├─ Completions: SELECT COUNT(*) FROM enrollments WHERE completionStatus = 'completed'
└─ Countries: SELECT COUNT(DISTINCT state) FROM users

Partners Section
├─ Query: SELECT * FROM partners ORDER BY displayOrder
├─ Admin can add/edit/delete partners
└─ Fallback to empty if none

Testimonials Section
├─ Query: GET /api/testimonials
├─ Sort by featured, newest
└─ Admin can manage via dashboard
```

---

## TESTING CHECKLIST

### After Phase 1A (Course CRUD)
- [ ] Can create course via API
- [ ] Can update course via API
- [ ] Can delete course via API
- [ ] Can create lesson in course
- [ ] Can update lesson
- [ ] Can delete lesson
- [ ] Authorization: Only creator/admin can edit

### After Phase 1B (Facilitator Wiring)
- [ ] "Create Course" button opens modal
- [ ] Form fills with course data
- [ ] Submit creates course
- [ ] "Edit Course" works
- [ ] Course list shows real data (not hardcoded)

### After Phase 1C (Admin CRUD)
- [ ] Can create membership tier
- [ ] Can update membership tier
- [ ] Can delete membership tier
- [ ] Can ban user
- [ ] Can change user role
- [ ] Dashboard shows real numbers (not Math.random())

### After Phase 1D (File Auth)
- [ ] File download checks authorization
- [ ] User A cannot download user B's files
- [ ] Admin can download any file
- [ ] File delete removes from S3 and DB
- [ ] Error returned if file not found

### After Phase 1E (Events)
- [ ] Can update event
- [ ] Can delete event
- [ ] Only creator/admin can edit

### After Phase 1F (Landing Page)
- [ ] "50,000 students" is real count from DB
- [ ] Partners shown from database
- [ ] Testimonials shown from API
- [ ] All numbers update when data changes

### After Phase 1G (Dashboard Pages)
- [ ] Learn page shows real courses
- [ ] No hardcoded student counts
- [ ] Community page shows real groups
- [ ] No dummy posts/comments

---

## SECURITY CONSIDERATIONS

1. **Authorization on all mutations**
   - Only owner/creator/admin can modify
   - Check user role on sensitive operations
   - Log all admin actions

2. **File Download Authorization**
   - Verify user owns file before download
   - Check if file is course material (instructor can download)
   - Log file accesses

3. **Input Validation**
   - Validate all POST/PUT inputs
   - Use Zod schemas
   - Sanitize text inputs

4. **Admin Operations**
   - Only admin can ban users
   - Only admin can change roles
   - Log all admin modifications
   - Require confirmation for delete

---

## ERROR HANDLING

All new endpoints must include:
```
try-catch block
├─ Validate authentication (401)
├─ Validate authorization (403)
├─ Validate inputs (400)
├─ Handle database errors (500)
└─ Return meaningful error messages
```

---

## ORDER OF IMPLEMENTATION

**Day 1:**
1. Create POST /api/courses
2. Create PUT /api/courses/[id]
3. Create DELETE /api/courses/[id]
4. Create lesson CRUD endpoints
5. Wire Facilitator Dashboard buttons

**Day 2:**
6. Create Admin user management endpoints
7. Modify /api/admin/tiers to add POST, DELETE
8. Add file authorization checks
9. Create file delete endpoint

**Day 3:**
10. Create event PUT, DELETE endpoints
11. Connect landing page to real data
12. Fix dashboard pages (Learn, Community)

**Day 4-5:**
13. Create notification system (optional but good)
14. Create global search (optional but good)
15. Create data export (optional but good)

---

## DEPENDENCIES & IMPORTS

Most endpoints will need:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth"; // For JWT verification
import { z } from "zod"; // For validation
```

---

## SUCCESS CRITERIA

✅ All POST/PUT/DELETE endpoints implemented  
✅ All UI buttons functional and wired to APIs  
✅ No hardcoded data (except seed data)  
✅ All pages show real database data  
✅ Authorization checks on all mutations  
✅ Error handling on all endpoints  
✅ Tests passing for critical flows  

---

**Starting Implementation:** Phase 1A (Course Management API)
