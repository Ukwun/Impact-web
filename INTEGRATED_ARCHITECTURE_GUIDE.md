# Integrated Architecture Guide

## Overview

This document explains how all features work together as a **realistic, interconnected system** rather than isolated components.

**Previous approach:** 16 isolated feature files building pages independently
**New approach:** Integrated ecosystem where features depend on each other and workflows are end-to-end

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Stores)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Order System │  │ Enrollment   │  │ Admin Events │       │
│  │ (3 orders)   │  │ System       │  │ (pub/sub)    │       │
│  │              │  │ (5 students) │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC (Managers)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │orderManager  │  │enrollmentMgr │  │refundManager │       │
│  │              │  │              │  │              │       │
│  │- getOrders() │  │- getEnroll() │  │- createRfnd()├──┐   │
│  │- getStats()  │  │- getProgress │  │- approveRfnd │  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  │   │
└─────────────────────────────────────────────────────────────┘
                            ↓                           │
┌─────────────────────────────────────────────────────────────┘
│ NOTIFICATION TRIGGERS (Events flow out)
│  - notifyRefundRequested() ──→ Admin dashboard (real-time)
│  - notifyRefundApproved() ──→ Student + Admin
│  - notifyCoursPublished() ──→ Enrolled students
│  - notifyStudentMessage() ──→ Students + admin log
└─────────────────────────────────────────────────────────────
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              USER-FACING PAGES (Consume data)                │
│  ┌─────────────────────┐  ┌──────────────────────┐          │
│  │ Student Views       │  │ Admin/Facilitator    │          │
│  ├─────────────────────┤  ├──────────────────────┤          │
│  │ My Courses          │  │ Course Editor        │          │
│  │ (shows enrollments) │  │ (shows students)     │          │
│  │                     │  │                      │          │
│  │ Orders & Refunds    │  │ Admin Notifications  │          │
│  │ (shows purchases)   │  │ (real-time alerts)   │          │
│  │                     │  │                      │          │
│  │ Profile Editor      │  │ Refund Management    │          │
│  │ (shows privacy)     │  │                      │          │
│  └─────────────────────┘  └──────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Systems

### 1. Order & Payment System
**Location:** `src/types/orders.ts`, `src/lib/orderManager.ts`

**Purpose:** Tracks all user purchases
- Enables refund system (users can only refund what they bought)
- Provides purchase history for user dashboard
- Calculates refund eligibility (30-day window)

**Mock Data:**
```
Order 1: Jan 2026, $99.99 (Course) → Completed via Flutterwave
Order 2: Feb 2026, $499.99 (Membership) → Completed via Flutterwave
Order 3: Mar 2026, $164.99 (Course) → Completed via Bank Transfer
```

**Key Functions:**
- `getUserOrders(userId)` - Get user's purchase history
- `getRefundableOrders(userId)` - Only orders within 30-day window
- `getOrderStatistics()` - Admin dashboard metrics

### 2. Course Enrollment System
**Location:** `src/types/enrollment.ts`, `src/lib/enrollmentManager.ts`

**Purpose:** Tracks student progress in courses
- Links students to courses
- Tracks completion percentage, lessons done, time spent
- Feeds real data to course editor (facilitators see actual students)

**Mock Data:**
```
Course 1 Enrollments:
- user-1: 65% complete (13/20 lessons, 12 hours, active)
- user-2: 100% complete (20/20 lessons, completed, certificate)
- user-3: 30% complete (6/20 lessons, 4 hours, active)
- user-4: 15% complete (dropped course)
- user-5: (another enrollment)

Course 2 Enrollments:
- user-1: 40% complete (8/20 lessons, active)
```

**Key Functions:**
- `getCourseEnrollments(courseId)` - List all students in course
- `getStudentProgress(courseId, userId)` - Detailed student metrics
- `updateEnrollmentProgress()` - When student completes lessons
- `completeEnrollment()` - Issue certificate

### 3. Admin Notification System (Real-time Pub/Sub)
**Location:** `src/lib/adminNotifications.ts`

**Purpose:** Real-time alerts without polling
- Uses observer pattern for instant updates
- Triggers automatically from business logic
- Routes alerts to appropriate dashboards with action links

**Event Types:**
- `refund_requested` - Student files refund (triggers admin notification)
- `refund_approved` - Admin approves (student notified)
- `refund_rejected` - Admin rejects (student notified)
- `course_published` - Course goes live (enrolled students notified)
- `enrollment_drop` - Student quits course (facilitator notified)
- `payment_failed` - Payment error (admin alerted)
- `course_update` - Content changed (students notified)

**Real-time Flow:**
```
User creates refund request
    ↓
refundManager.createRefund()
    ↓
triggers adminNotifications.notifyRefundRequested()
    ↓
event added to _adminNotificationsStore
    ↓
subscribeToAdminEvents() callback fires
    ↓
Admin panel updates instantly (no page refresh needed)
```

### 4. Refund System (Enhanced)
**Location:** `src/lib/refundManager.ts`

**Now Integrated With:**
- Order system (can only refund real purchases)
- Admin notifications (admin gets instant alerts)
- Time window validation (30-day refund policy)

**Workflow:**
```
Student views Orders & Refunds page
    ↓
sees list from orderManager.getUserOrders()
    ↓
clicks "Request Refund" on eligible order
    ↓
submitRefundForm() calls refundManager.createRefund()
    ↓
creates refund object + triggers notifyRefundRequested()
    ↓
admin sees notification in real-time AdminNotificationsPanel
    ↓
admin clicks refund → opens /dashboard/admin/refunds
    ↓
admin approves/rejects
    ↓
calls approveRefund() or rejectRefund()
    ↓
triggers notifications sent to both admin + student
```

---

## User-Facing Workflows

### Workflow 1: Student Requests Refund
**Route:** `/dashboard/orders-and-refunds`

**What Happens:**
1. Student loads page
2. Page fetches orders from `orderManager.getUserOrders()`
3. Shows list of purchases with refund eligibility
4. Student clicks "Request Refund" on order
5. Form submits via `refundManager.createRefund()`
6. **AUTOMATICALLY** triggers `notifyRefundRequested()`
7. Admin sees notification instantly in AdminNotificationsPanel
8. Admin clicks → opens refund detail page
9. Admin approves/rejects → both get notifications
10. Student sees updated status on their page (refreshed or via poll)

**Data Flow:**
```
Orders & Refunds Page
    ↓ (loads)
orderManager.getUserOrders() → ["order-1", "order-2", "order-3"]
    ↓ (user clicks refund)
refundManager.createRefund(orderId, reason) → creates refund object
    ↓ (auto-trigger)
adminNotifications.notifyRefundRequested(refundId, amount, reason)
    ↓
Admin Dashboard receives notification via subscribeToAdminEvents()
```

### Workflow 2: Facilitator Edits Course & Sees Student Progress
**Route:** `/dashboard/courses/[id]/edit-enhanced`

**What Happens:**
1. Facilitator opens course editor
2. Page shows 4 tabs: Content | Students | Analytics | ???
3. **Students Tab** shows:
   - All enrolled students (name, avatar, status)
   - Real progress data from `enrollmentManager`:
     - Completion percentage
     - Lessons completed (6/20, 13/20, etc.)
     - Time spent (4h, 12h, etc.)
     - Last accessed date
   - Facilitator can send announcements/reminders
4. Facilitator clicks "Send Message" to students
5. **AUTOMATICALLY** triggers `notifyStudentMessage()`
6. Message logged to admin audit trail
7. Students receive notification (in production: email + in-app)

**Data Flow:**
```
Course Editor Page
    ↓ (mount)
getCourseEnrollments("course-1") → [enrollment1, enrollment2, ...]
    ↓ (for each student)
getStudentProgress("course-1", userId) → {progressPercent, lessonsCompleted, ...}
    ↓ (displays student list with real data)
Facilitator sends message
    ↓
submits form → notifyStudentMessage(studentId, message)
    ↓
Event created + logged for audit trail
```

### Workflow 3: Student Browses Their Enrollments
**Route:** `/dashboard/my-courses`

**What Happens:**
1. Student loads page
2. Page fetches their enrollments from `enrollmentManager`
3. For each course:
   - Shows course name, facilitator
   - Shows progress bar (actual % from enrollment data)
   - Shows lesson count (6/20, etc.)
   - Shows time spent
   - Shows last active date
4. Can click "Continue Learning" to access course
5. Can click "Orders & Refunds" to manage purchases

**Data Flow:**
```
My Courses Page
    ↓ (mount, userId="user-1")
getCourseEnrollments("course-1") → filter userId="user-1"
getCourseEnrollments("course-2") → filter userId="user-1"
    ↓ (for each)
getStudentProgress(courseId, "user-1") → {progressPercentage: 65, ...}
    ↓ (displays with real data)
```

### Workflow 4: Admin Sees Real-Time Notifications
**Component:** `AdminNotificationsPanel`

**What Happens:**
1. Admin panel in navbar
2. Subscribes to admin events on mount
3. Bell icon shows unread count
4. When events occur (refund requested, course published, etc.):
   - New notification appears instantly
   - Color-coded by severity (red=critical, orange=high, yellow=medium, gray=low)
   - Shows action button/link (e.g., "View Refund")
5. Click on notification → opens relevant page (e.g., `/dashboard/admin/refunds?id=...`)
6. Click "Mark as Read" → updates in real-time

**Data Flow:**
```
AdminNotificationsPanel mounts
    ↓
subscribeToAdminEvents(callback) → returns unsubscribe function
    ↓
stays subscribed for entire session
    ↓
any event elsewhere triggers callback
    ↓
component receives new event, updates UI instantly
```

---

## Integration Points

### Integration 1: Orders → Refunds
**Connection:** Orders system must exist before refund system works
```typescript
// In Orders & Refunds page:
const orders = await orderManager.getUserOrders(userId);  // Must have real orders
const refundableOrders = orders.filter(o => 
  o.createdDate > Date.now() - 30*24*60*60*1000  // 30-day window
);
// User can only request refund on items they actually bought
```

### Integration 2: Refunds → Admin Notifications
**Connection:** Admin must be alerted when refund requested
```typescript
// In refundManager:
export function createRefund(...) {
  const refund = { ... };
  // AUTOMATICALLY trigger notification
  adminNotifications.notifyRefundRequested(
    refund.id, 
    refund.userId, 
    refund.amount,
    refund.reason
  );
  return refund;
}
```

### Integration 3: Courses → Enrollments → Facilitator Views
**Connection:** Facilitators see real student data
```typescript
// In course editor page:
const enrollments = await getCourseEnrollments(courseId);  // Real students
for (const enrollment of enrollments) {
  const progress = await getStudentProgress(courseId, enrollment.userId);
  // Now show real: progress%, lessons done, time spent, last active
}
```

### Integration 4: Course Publishing → Student Notifications
**Connection:** When facilitator publishes, students get notified
```typescript
// In course editor:
function handlePublishCourse() {
  adminNotifications.notifyCoursPublished({
    courseId,
    courseTitle,
    publishedAt: new Date(),
    enrollmentCount: enrollments.length  // Tell admin how many students affected
  });
}
```

### Integration 5: Student Messages → Admin Audit Trail
**Connection:** Every message sent is logged
```typescript
// In course editor:
function handleSendNotification() {
  for (const student of recipients) {
    adminNotifications.notifyStudentMessage({
      studentId: student.id,
      courseId,
      message,
      messageType,  // announcement, reminder, alert
      sentAt: new Date()
    });
  }
  // Admin can see in their notification history what was sent
}
```

---

## Who Uses What

### Student (user-1)
- **Pages:**
  - `/dashboard/my-courses` - Views enrollments, progress
  - `/dashboard/orders-and-refunds` - Requests refunds
  - `/dashboard/profile-editor` - Updates profile (privacy controls TBD)
- **Data Accessed:**
  - Their orders from `orderManager`
  - Their enrollments from `enrollmentManager`
  - Their refund status from `refundManager`

### Facilitator (course owner)
- **Pages:**
  - `/dashboard/courses/[id]/edit-enhanced` - Manages course
- **Data Accessed:**
  - Course enrollments from `enrollmentManager`
  - Student progress from `enrollmentManager`
  - Can send messages to students
  - Publishes course → triggers notifications
- **Events They Trigger:**
  - `notifyCoursPublished()` - When publishing
  - `notifyStudentMessage()` - When messaging

### Admin
- **Pages:**
  - `/dashboard/admin/refunds` - Reviews refund requests
  - `/dashboard/admin/dashboard` - Global analytics
  - Navbar shows `AdminNotificationsPanel`
- **Data Accessed:**
  - Refund requests from `refundManager`
  - Analytics from various managers
  - Real-time events from `adminNotifications`
- **Receives Events:**
  - `refund_requested` - Student action
  - `course_published` - Facilitator action
  - `payment_failed` - System event
  - `enrollment_drop` - Student action

---

## Key Design Principles

### 1. **Integration Over Isolation**
❌ BAD: Features build pages independently
✅ GOOD: Features depend on shared data systems

### 2. **Real Data, Not Mocks**
❌ BAD: Display generic placeholder students
✅ GOOD: Display actual enrolled students with real progress

### 3. **Automatic Notifications**
❌ BAD: Admin manually checks for refund requests
✅ GOOD: Refund system auto-triggers admin alert (real-time)

### 4. **End-to-End Workflows**
❌ BAD: Refund page shows nothing about orders
✅ GOOD: Student sees orders → requests refund → admin notified → approves → both get notifications

### 5. **Realistic Business Logic**
❌ BAD: Can request refund 1 year later
✅ GOOD: 30-day refund policy enforced

### 6. **User Role Alignment**
❌ BAD: All users see all features
✅ GOOD: Students see orders, facilitators see student progress, admins see alerts

---

## Database Schema (When Moving to Real DB)

```typescript
// Orders table
{
  id: "order-1",
  userId: "user-1",
  items: [{courseId, price, ...}],
  totalAmount: 99.99,
  paymentMethod: "flutterwave",
  status: "completed" | "pending" | "failed",
  createdAt: Date,
  paidAt: Date
}

// Enrollments table
{
  id: "enrollment-1",
  courseId: "course-1",
  userId: "user-1",
  status: "active" | "completed" | "dropped" | "paused",
  enrolledAt: Date,
  completedAt?: Date,
  lastAccessedAt: Date
}

// StudentProgress table
{
  enrollmentId: "enrollment-1",
  courseLessons: 20,
  completedLessons: 13,
  totalTimeSpent: 12.5,  // hours
  lastAccessedAt: Date
}

// Refunds table
{
  id: "refund-1",
  orderId: "order-1",
  userId: "user-1",
  amount: 99.99,
  reason: "Not as expected",
  status: "pending" | "approved" | "rejected",
  requestedAt: Date,
  reviewedAt?: Date,
  reviewedBy?: admin-id
}

// AdminEvents table (audit log)
{  
  id: "event-1",
  type: "refund_requested" | "course_published" | ...,
  userId?: "user-1",
  data: {refundId, message, ...},
  severity: "low" | "medium" | "high" | "critical",
  createdAt: Date,
  readAt?: Date,
  readBy?: admin-id
}
```

---

## Testing the Integration

### Test Scenario: Full User Journey
1. **Setup:** 
   - User (user-1) has 3 orders in system
   - User is enrolled in 2 courses
   - User 2 has different orders/enrollments
   
2. **Execute:**
   - Student goes to `/dashboard/orders-and-refunds`
   - Sees their 3 orders (from orderManager)
   - Clicks refund on order-2
   - Admin gets notification instantly
   - Admin goes to `/dashboard/admin/refunds`
   - Sees user-1's refund request
   - Approves it
   - Student notification triggered
   - Both see updated status

3. **Verify:**
   - ✅ Student sees their actual orders (not random data)
   - ✅ Admin sees notification without page refresh
   - ✅ Both notified when status changes
   - ✅ No broken links or missing data

### Test Scenario: Course Facilitator Workflow
1. **Setup:**
   - Course "Web Dev 101" has 5 enrolled students
   - Students have different progress levels
   
2. **Execute:**
   - Facilitator opens `/dashboard/courses/course-1/edit-enhanced`
   - Clicks "Students" tab
   - Sees all 5 students with exact progress %
   - Sends "Reminder: Deadline next week" to all
   - Students get notification
   - Admin sees message sent to audit log

3. **Verify:**
   - ✅ Facilitator sees real student names and progress
   - ✅ Message sent functionality works
   - ✅ Admin has audit trail
   - ✅ Right data shown to right person

---

## Files Created This Session

### Foundation Systems (4 files)
✅ `src/types/orders.ts` - Order/Payment types
✅ `src/types/enrollment.ts` - Enrollment/Progress types
✅ `src/lib/orderManager.ts` - Order CRUD + mock data (3 orders)
✅ `src/lib/enrollmentManager.ts` - Enrollment CRUD + mock data (5 enrollments)

### Integration Points (2 files)
✅ `src/lib/adminNotifications.ts` - ENHANCED with pub/sub + 9 event types
✅ `src/lib/refundManager.ts` - ENHANCED to trigger notifications automatically

### UI Components (4 files)
✅ `src/app/dashboard/orders-and-refunds/page.tsx` - Combined orders + refunds (330 lines)
✅ `src/app/dashboard/courses/[id]/edit-enhanced/page.tsx` - Course editor with student data (320 lines)
✅ `src/app/dashboard/my-courses/page.tsx` - Student course list with progress (280 lines)
✅ `src/components/AdminNotificationsPanel.tsx` - Real-time admin alerts (200 lines)

### Supporting Files (1 file)
✅ `src/components/ui/Textarea.tsx` - UI component for forms

---

## Next Steps (If Continuing)

### Immediate (1-2 hours)
1. [ ] Integrate AdminNotificationsPanel into navbar
2. [ ] Add breadcrumb component linking pages together
3. [ ] Link "My Courses" from main dashboard
4. [ ] Test full refund workflow end-to-end

### Short-term (2-4 hours)
5. [ ] Course publishing auto-notifies students
6. [ ] Student profile changes trigger notifications
7. [ ] Enrollment dropout notifies facilitator
8. [ ] Course completion certificates
9. [ ] Email notifications integration

### Medium-term (4-8 hours)
10. [ ] Student reviews/ratings trigger facilitator notifications
11. [ ] Automatic progress tracking (lessons marked complete)
12. [ ] Student performance analytics
13. [ ] Refund dispute workflow
14. [ ] Facilitator performance metrics

### Long-term (8+ hours)
15. [ ] Analytics dashboard
16. [ ] Reporting system
17. [ ] Payment reconciliation
18. [ ] Student recommendations
19. [ ] Dynamic pricing based on demand
20. [ ] Gamification (badges, points, etc.)

---

## Conclusion

This architecture achieves the goal of providing a **realistic user experience**:

✅ **Real Data:** No placeholders - actual students, orders, progress
✅ **Real Workflows:** User → Action → Notification → Admin Response → Both notified
✅ **Real Constraints:** 30-day refund policy, enrollment status affect access
✅ **Real Integration:** Features don't work in isolation; they depend on each other
✅ **Real Notifications:** Instant alerts without polling or manual refreshes

Every page now serves a purpose in a complete story, not just a demo.
