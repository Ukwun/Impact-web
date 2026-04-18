# 🔴 REAL-TIME ANALYSIS: WHAT'S ACTUALLY MISSING
**Impact Edu - Project Autopsy**  
**Date: April 18, 2026**  
**Status: Identifying gap between docs and reality**

---

## ✅ WHAT ALREADY EXISTS (APIs Implemented)

### Course Management API - 100% CODED ✅
```
✅ GET    /api/courses              (list all published courses)
✅ POST   /api/courses              (create course - ADMIN/FACILITATOR)
✅ GET    /api/courses/[id]         (get course details + lessons)
✅ PUT    /api/courses/[id]         (update course - creator/admin)
✅ DELETE /api/courses/[id]         (soft delete/archive - creator/admin)

✅ GET    /api/courses/[id]/lessons (get all lessons in course)
✅ POST   /api/courses/[id]/lessons (create lesson - creator/admin)
✅ GET    /api/courses/[id]/lessons/[lessonId]       (lesson details)
✅ PUT    /api/courses/[id]/lessons/[lessonId]       (update lesson)
✅ DELETE /api/courses/[id]/lessons/[lessonId]       (delete lesson)
```

### Event Management API - PARTIALLY DONE ⚠️
```
✅ GET    /api/events               (list events)
✅ POST   /api/events               (create event)
✅ GET    /api/admin/events         (admin list - FIXED YESTERDAY)
✅ PUT    /api/admin/events/[id]    (admin update - FIXED YESTERDAY)
✅ DELETE /api/admin/events/[id]    (admin delete - FIXED YESTERDAY)
```

### Other Endpoints - MOSTLY EXIST
```
✅ Assignments API
✅ Quizzes API
✅ Lessons completion tracking
✅ File upload (S3)
✅ Authentication
```

---

## ❌ WHAT'S ACTUALLY MISSING (Real Gaps)

### 1. HARDCODED DATA IN UI (CRITICAL) 🔴
**File:** `src/app/dashboard/facilitator/page.tsx`  
**Problem:** Dashboard uses hardcoded courses and stats instead of API

```tsx
❌ HARDCODED DATA:
   const courses = [
     { id: 1, title: 'Financial Literacy...', students: 45, ... },
     { id: 2, title: 'Digital Skills...', students: 38, ... },
     ...
   ];

NEEDS: useEffect hook to fetch from /api/courses?filter=facilitator
```

**Estimated Fix Time:** 1-2 hours

---

### 2. CREATE COURSE BUTTON NOT FUNCTIONAL 🔴
**File:** `src/app/dashboard/facilitator/page.tsx`  
**Problem:** "Create Course" button links to `/dashboard/courses` but that page doesn't exist

```tsx
❌ CURRENT:
   <Link href="/dashboard/courses" className="...">
     + Create Course
   </Link>

NEEDS: 
1. Modal component (CourseFormModal) 
2. Form with title, description, category, difficulty
3. POST to /api/courses (endpoint exists!)
4. Refresh courses list after creation
```

**Estimated Fix Time:** 2-3 hours

---

### 3. EDIT COURSE BUTTON NOT WIRED 🔴
**File:** `src/app/dashboard/facilitator/page.tsx`  
**Problem:** No click handler on edit button

```tsx
❌ CURRENT: Button exists but does nothing

NEEDS:
1. Click handler that opens UpdateCourseModal
2. Modal pre-fills with course data
3. PUT to /api/courses/[id] (endpoint exists!)
4. Refresh the course in the list
```

**Estimated Fix Time:** 1-2 hours

---

### 4. HARDCODED DATA ON LANDING PAGE 🔴
**File:** `src/app/page.tsx` (Landing page)  
**Problem:** Impact numbers and testimonials are static

```jsx
❌ HARDCODED:
   "50,000 Students"      (needs real count from /api/public/metrics)
   "1,250 Schools"        (needs real count)
   "Testimonials"         (needs data from database)
```

**Estimated Fix Time:** 1-2 hours

---

### 5. ADMIN DASHBOARD - HARDCODED STATS 🔴
**File:** `src/app/dashboard/admin/page.tsx`  
**Problem:** Uses Math.random() and fake data instead of real analytics

```tsx
❌ CURRENT:
   value: `${Math.random() * 100000}` (random numbers!)

NEEDS:
1. Fetch real user counts
2. Real course counts
3. Real enrollment data
4. Real revenue data (if payments enabled)
```

**Estimated Fix Time:** 2-3 hours

---

### 6. ADMIN USER MANAGEMENT MISSING 🔴
**File:** Missing entirely  
**Problem:** Can't ban users, deactivate, or change roles

```
NEEDS API:
- GET /api/admin/users (list all users with filters)
- PUT /api/admin/users/[id]/role (change role)
- PUT /api/admin/users/[id]/status (activate/deactivate)
- DELETE /api/admin/users/[id] (soft delete)
```

**Estimated Fix Time:** 3-4 hours

---

### 7. MEMBERSHIP TIERS MANAGEMENT 🔴
**File:** Missing implementation in UI  
**Problem:** API exists but no admin interface

```
NEEDS:
- GET /api/admin/tiers (list tiers)
- POST /api/admin/tiers (create - endpoint missing!)
- PUT /api/admin/tiers/[id] (update)
- DELETE /api/admin/tiers/[id] (delete - endpoint missing!)

UI:
- Page at /dashboard/admin/tiers
- Create/Edit/Delete modals
- Tier preview
```

**Estimated Fix Time:** 3-4 hours

---

### 8. FILE DOWNLOAD AUTHORIZATION 🔴
**File:** `src/lib/s3-client.ts`  
**Problem:** TODO comment - no auth check when downloading

```ts
❌ CURRENT:
   // TODO: Add authorization check here

NEEDS:
1. Check user has access to file
2. Check assignment/course enrollment
3. Verify file ownership
```

**Estimated Fix Time:** 1 hour

---

### 9. FILE DELETION ENDPOINT 🔴
**File:** Missing entirely

```
NEEDS:
- DELETE /api/files/[key]
- Check authorization
- Delete from S3
```

**Estimated Fix Time:** 1 hour

---

### 10. FLUTTER APP NOT WIRED (MAJOR) 🔴
**Problem:** Flutter app uses mock data instead of real API

```
NEEDS:
1. All API integration (20+ endpoints)
2. Missing screens (profile edit, quiz UI)
3. Firebase notifications setup
4. Offline support
```

**Estimated Fix Time:** 20-30 hours

---

## 📊 PRIORITY REORDERING

### MUST FIX THIS WEEK (11-13 hours)
| Priority | Fix | Time | Effort |
|----------|-----|------|--------|
| 🔴 P1 | Replace hardcoded dashboard data | 2h | Easy |
| 🔴 P1 | Wire "Create Course" button | 2h | Easy |
| 🔴 P1 | Wire "Edit Course" button | 2h | Easy |
| 🔴 P1 | Replace hardcoded landing page | 2h | Easy |
| 🔴 P1 | Fix admin dashboard stats | 2h | Easy |
| 🔴 P2 | File authorization checks | 1h | Medium |
| 🔴 P2 | File deletion endpoint | 1h | Medium |

### CAN DEFER (6-8 hours next week)
| Priority | Fix | Time | Effort |
|----------|-----|------|--------|
| 🟡 P2 | Admin user management | 3-4h | Medium |
| 🟡 P2 | Membership tiers UI | 3-4h | Medium |

### SEPARATE PROJECT (Flutter - 20-30 hours)
```
Flutter app requires dedicated sprint
Not blocking web launch
Plan separate from this week
```

---

## 🚀 REAL-TIME FIX PLAN - TODAY

### Task 1: Fix Facilitator Dashboard (1.5 hours)
**Status:** NOT STARTED

**Steps:**
1. ⏳ Update `src/app/dashboard/facilitator/page.tsx`
   - Remove hardcoded courses array
   - Add `useEffect` to fetch from `/api/courses?createdBy=me`
   - Replace hardcoded stats with real data

2. ⏳ Fix "Create Course" button
   - Create new modal component: `src/components/CourseFormModal.tsx`
   - Wire button to open modal
   - Form POST to `/api/courses`

3. ⏳ Fix "Edit Course" button
   - Create `UpdateCourseModal.tsx`
   - Wire to PUT `/api/courses/[id]`

**Code Ready To Write:** Yes - just needs wiring

---

### Task 2: Fix Landing Page (1.5 hours)
**Status:** NOT STARTED

**Steps:**
1. ⏳ Create `/api/public/metrics` endpoint
   - Count active users
   - Count programs/courses
   - Count schools
   - Fetch top testimonials

2. ⏳ Update landing page components
   - Replace hardcoded numbers
   - Add useEffect to fetch metrics

**Code Ready To Write:** Partially - metrics endpoint needed

---

### Task 3: Fix Admin Dashboard (1.5 hours)
**Status:** NOT STARTED

**Steps:**
1. ⏳ Update `src/app/dashboard/admin/page.tsx`
   - Fetch real user count
   - Fetch real course count
   - Fetch real revenue (if payments enabled)
   - Replace Math.random() with real queries

**Code Ready To Write:** Yes - just needs wiring

---

### Task 4: File Authorization (1 hour)
**Status:** NOT STARTED

**Steps:**
1. ⏳ Add authorization check to file download
2. ⏳ Create DELETE /api/files/[key] endpoint

**Code Ready To Write:** Yes - straightforward

---

## BOTTOM LINE

**Audit Document (April 13):** ❌ OUTDATED - Most endpoints already built  
**Real Gap:** Course/Admin endpoints exist but **not wired in UI**  
**What's Missing:** Frontend integration, not backend  
**Time to Fix:** 4-5 hours for critical items  
**Confidence:** 🟢 HIGH - Just wire existing APIs

---

## NEXT STEP

Ready to start Task 1? I'll:
1. Update facilitator dashboard to load real courses
2. Create CourseFormModal
3. Wire create/edit buttons
4. Test with real API calls

Should I proceed? 🚀
