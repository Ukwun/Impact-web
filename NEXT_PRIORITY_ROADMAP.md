# 🎯 PRIORITY ACTION PLAN - NEXT STEPS
**Impact Edu - Roadmap to Production**  
**Date: April 18, 2026**  
**Status: READY FOR EXECUTION**

---

## 📊 CURRENT STATE

✅ **Course Management** - FULLY WORKING (APIs + UI)  
✅ **Facilitator Dashboard** - FULLY WORKING (Real data + modal)  
✅ **Landing Page** - FULLY WORKING (Real metrics + partners + testimonials)  
✅ **Event Management** - FULLY WORKING (APIs fixed)  

⚠️ **Admin Dashboard** - NEEDS WORK (2 hours)  
⚠️ **File Operations** - NEEDS WORK (1.5 hours)  
⚠️ **Admin User Management** - NEEDS WORK (3 hours)  

---

## 🚀 QUICK WIN TARGETS (1.5 hours total)

### Target 1: Fix Admin Dashboard (1-2 hours)
**Priority:** CRITICAL  
**Effort:** Easy  
**Impact:** Admin can see real platform metrics

**What to do:**
1. Open `src/app/dashboard/admin/page.tsx`
2. Find the hardcoded stats (should see `Math.random()`)
3. Add useEffect to fetch from `/api/public/metrics`
4. Replace hardcoded values with real data
5. Test: Dashboard should show real numbers

**Acceptance Criteria:**
- [ ] Admin page shows real user count
- [ ] Shows real course count
- [ ] Shows real engagement metrics
- [ ] No `Math.random()` left in code

**Time:** 1-2 hours (30 min coding + 30 min testing)

---

### Target 2: File Download Authorization (30 minutes)
**Priority:** HIGH (Security gap)  
**Effort:** Easy  
**Impact:** Prevents unauthorized file access

**What to do:**
1. Find: `src/lib/s3-client.ts` or file download handler
2. Look for: `// TODO: Add authorization check`
3. Add check:
   ```ts
   // Verify user owns the file or is enrolled in course
   const assignment = await prisma.assignment.findUnique({
     where: { id: fileAssignmentId }
   });
   
   if (assignment.submittedById !== userId && user.role !== 'ADMIN') {
     throw new Error('Unauthorized');
   }
   ```
4. Test: Try to download unauthorized file → should fail

**Acceptance Criteria:**
- [ ] Auth check implemented
- [ ] Only owner can download
- [ ] Admins can always access
- [ ] Returns 403 for unauthorized users

**Time:** 30 minutes

---

### Target 3: File Deletion Endpoint (1 hour)
**Priority:** HIGH  
**Effort:** Easy  
**Impact:** Complete file management CRUD

**What to do:**
1. Create: `src/app/api/files/[key]/route.ts`
2. Implement DELETE method:
   ```ts
   export async function DELETE(
     req: NextRequest,
     { params }: { params: { key: string } }
   ) {
     // Verify auth
     // Check authorization
     // Delete from S3
     // Delete from database
     // Return success
   }
   ```
3. Reference: Similar to `/api/admin/events/[id]/route.ts` we just created

**Acceptance Criteria:**
- [ ] DELETE endpoint works
- [ ] Auth verified
- [ ] File deleted from S3
- [ ] Database record cleaned up
- [ ] Returns proper status codes

**Time:** 1 hour

---

## 📋 MEDIUM PRIORITY TARGETS (4-5 hours)

### Target 4: Admin User Management (3-4 hours)
**Priority:** MEDIUM  
**Effort:** Medium  
**Impact:** Admin can manage user accounts

**What to do:**

1. **Create API endpoints:**
   - `GET /api/admin/users` - List users with filters
   - `PUT /api/admin/users/[id]/role` - Change user role
   - `PUT /api/admin/users/[id]/status` - Activate/deactivate
   - `DELETE /api/admin/users/[id]` - Soft delete user

2. **Create UI page:**
   - Create: `src/app/dashboard/admin/users/page.tsx`
   - Show user list with search/filters
   - Action buttons: Change Role, Deactivate, Delete
   - Modal for role change confirmation

3. **Wire buttons to API calls**

**Acceptance Criteria:**
- [ ] API endpoints fully working
- [ ] Admin page lists all users
- [ ] Can search/filter users
- [ ] Can change user role
- [ ] Can deactivate users
- [ ] Can delete users
- [ ] Proper error handling

**Time:** 3-4 hours

---

### Target 5: Membership Tiers Management (2-3 hours)
**Priority:** MEDIUM  
**Effort:** Medium  
**Impact:** Admin can manage membership tiers

**What to do:**

1. **Check existing API** (in `/api/admin/tiers`)
   - GET - ✅ Should exist
   - POST - ❌ May be missing
   - PUT - ✅ Should exist
   - DELETE - ❌ May be missing
   - Add missing methods

2. **Create admin page:**
   - `src/app/dashboard/admin/tiers/page.tsx`
   - List tiers with cards
   - Buttons: Edit, Delete, Create New
   - Modal for create/edit form

3. **Form fields:**
   - Tier name (e.g., "Starter", "Premium")
   - Description
   - Price
   - Features included
   - Limits (storage, users, etc)

**Acceptance Criteria:**
- [ ] Can list all tiers
- [ ] Can create new tier
- [ ] Can edit existing tier
- [ ] Can delete tier
- [ ] Form validation works
- [ ] API integration complete

**Time:** 2-3 hours

---

## 🔄 EXECUTION ORDER

### Session 1 (Tomorrow, 2-3 hours):
```
1. ✅ Admin Dashboard stats (1-2h)
2. ✅ File authorization (30min)
3. ✅ File deletion endpoint (1h)
   CHECKPOINT: Test all 3 together
```

### Session 2 (Next Day, 3-4 hours):
```
1. ✅ Admin user management API (1.5-2h)
2. ✅ Admin user management UI (1.5-2h)
   CHECKPOINT: Full CRUD working
```

### Session 3 (Following Day, 2-3 hours):
```
1. ✅ Membership tiers API (30min)
2. ✅ Membership tiers UI (1.5-2h)
   CHECKPOINT: Admin fully functional
```

### Total: ~7-10 hours of work spread across 3 sessions

---

## 🏗️ TEMPLATE CODE

### Admin Dashboard Fix (Template)
```tsx
'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/public/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data.data);
    };
    fetchStats();
  }, []);

  // Always show real data instead of Math.random()
  return (
    <div>
      {stats && (
        <>
          <div>Users: {stats.metrics.totalUsers}</div>
          <div>Courses: {stats.metrics.totalCourses}</div>
          ...
        </>
      )}
    </div>
  );
}
```

---

## ✅ SUCCESS CRITERIA FOR LAUNCH

Before going live, verify:

- [ ] ✅ Course creation/editing fully working
- [ ] ✅ Facilitator dashboard shows real data
- [ ] ✅ Landing page shows real metrics
- [ ] ✅ File upload working (with AWS creds)
- [ ] ✅ File download with auth checks
- [ ] ✅ File deletion working
- [ ] ✅ Email service working (with Resend key)
- [ ] ✅ Admin dashboard real stats
- [ ] ✅ Admin can manage users
- [ ] ✅ Admin can manage tiers
- [ ] ✅ Full end-to-end testing done
- [ ] ✅ Error handling on all forms
- [ ] ✅ Mobile responsive verified
- [ ] ✅ All environment variables set

---

## 🎓 LEARNING RESOURCES

If you need help implementing any of these:

**API Patterns:**
- Reference: `/api/admin/events/[id]/route.ts` (just created)
- Reference: `/api/courses/[id]/route.ts` (update/delete patterns)

**Component Patterns:**
- Reference: `CourseFormModal.tsx` (form + modal pattern)
- Reference: `HeroSection.tsx` (data fetching pattern)

**Dashboard Patterns:**
- Reference: `FacilitatorDashboard.tsx` (list + real data)
- Reference: `AdminDashboard.tsx` (stats layout)

---

## 💬 QUESTIONS FOR YOU

When you're ready to continue, let me know:

1. **Which do you want to tackle first?**
   - Admin Dashboard stats (easiest)
   - File operations (quick security wins)
   - User management (more complex but needed)

2. **Should I start on any of these now?**
   - I can start Admin Dashboard in next message
   - Or wait for your input on priority

3. **Flutter app - separate?**
   - Should we plan a dedicated 2-3 day sprint?
   - Or do it after web is complete?

---

## 🎯 BOTTOM LINE

**You have:**
- ✅ All course management working
- ✅ All landing page metrics live
- ✅ Facilitator dashboard functional
- ✅ Event management complete

**You need (7-10 hours more):**
- Admin dashboard real stats (1-2h)
- File operations complete (1.5h)
- User management (3-4h)
- Tier management (2-3h)

**Then you can:**
- 🚀 Launch to production
- 📱 Start Flutter mobile app
- 📊 Manage real users and data

Ready to continue? Just say the word! 💪
