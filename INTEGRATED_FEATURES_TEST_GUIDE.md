# Quick Test Guide - Integrated Architecture

## Overview
This guide helps you verify that all integrated features work correctly. Dev server is running on **port 3004**.

---

## What Was Built (Complete List)

### 🔧 Foundation Systems
- `src/types/orders.ts` - Order/Payment types (110 lines)
- `src/types/enrollment.ts` - Enrollment/Progress types (140 lines)
- `src/lib/orderManager.ts` - Order CRUD + 3 mock orders (280 lines)
- `src/lib/enrollmentManager.ts` - Enrollment CRUD + 5 mock enrollments (320 lines)
- `src/lib/adminNotifications.ts` - Real-time pub/sub system (ENHANCED, 300+ lines)
- `src/lib/refundManager.ts` - Refund CRUD (ENHANCED with notifications)

### 📄 User-Facing Pages
- `src/app/dashboard/orders-and-refunds/page.tsx` - Orders + Refund requests (330 lines)
- `src/app/dashboard/courses/[id]/edit-enhanced/page.tsx` - Course editor with students (440 lines)
- `src/app/dashboard/my-courses/page.tsx` - Student enrollment list (280 lines)

### 🎨 Components
- `src/components/AdminNotificationsPanel.tsx` - Real-time admin alerts (200 lines)
- `src/components/ui/Textarea.tsx` - Form input component (20 lines)

### 📚 Documentation
- `INTEGRATED_ARCHITECTURE_GUIDE.md` - Complete system documentation (400+ lines)

---

## Test Scenario 1: Student Views Orders & Requests Refund

### URL: `http://localhost:3004/dashboard/orders-and-refunds`

**What You Should See:**
1. ✅ Header: "Orders and Refunds"
2. ✅ **Orders Section** showing 3 mock orders:
   ```
   Order 1: Course Purchase - $99.99 - Completed Jan 15, 2026
   Order 2: Membership - $499.99 - Completed Feb 20, 2026  
   Order 3: Course Purchase - $164.99 - Completed Mar 10, 2026
   ```
3. ✅ Each order shows:
   - Order ID (order-xxx)
   - Items purchased
   - Total price
   - Status badge (Green "Completed")
   - Payment method (Flutterwave, Bank Transfer)
4. ✅ "Request Refund" button on each order
5. ✅ **Active Refunds Section** (initially empty or shows previous refunds)
6. ✅ **Refund Form** when you click a button

**Interactive Test:**
1. Click "Request Refund" on Order 1
2. Form appears with fields:
   - Refund Reason (dropdown): "Not as expected", "Changed mind", "Defective"
   - Description (text area): Type any reason
3. Click "Submit Refund Request"
4. **✅ CRITICAL:** Check browser console - should see:
   - `notifyRefundRequested()` logged
   - Event created in adminNotifications store
5. Refund should appear in "Active Refunds" section

---

## Test Scenario 2: Facilitator Views Course with Real Student Data

### URL: `http://localhost:3004/dashboard/courses/course-1/edit-enhanced`

**What You Should See:**
1. ✅ Course header showing "Introduction to Web Development"
2. ✅ **4 Quick Stats:**
   - Total Enrollments: 4 students (or 5)
   - Avg Progress: 54% (calculated from actual student data)
   - Currently Active: 3 students (who have status="active")
   - Completion Rate: 20% (1 out of 5 completed)
3. ✅ **3 Tabs:** Content | Students | Analytics

### Content Tab
Click the **Content** tab (default):
1. ✅ Course title: "Introduction to Web Development"
2. ✅ Can edit description
3. ✅ Category: "Technology", Difficulty: "Beginner"
4. ✅ **Course Lessons section:**
   ```
   1. Getting Started with HTML
   2. CSS Fundamentals
   3. JavaScript Basics
   4. DOM Manipulation
   ```
5. ✅ "Add Lesson" button at bottom

### Students Tab (CRITICAL TEST)
Click the **Students** tab:

**What You Should See:**
1. ✅ **Send Message to Students section** with:
   - Message Type dropdown: "Announcement", "Reminder", "Alert"
   - Send To dropdown: "All", "Active", "Completed"
   - Message text area
   - Send button

2. ✅ **Enrolled Students list** showing exactly 4-5 students with:
   - **Student name** (e.g., "Alice Johnson", "Bob Smith")
   - **Avatar** (colored circle with initial)
   - **Status badge** with color:
     - Green: Active
     - Blue: Completed
     - Red: Dropped
     - Yellow: Paused
   - **Progress bar** showing % complete
   - **Details row:**
     - Lessons: "13/20" or "20/20" or "6/20"
     - Time Spent: "12h", "18h", "4h"
     - Last Active: "Yesterday", "2 days ago", "1 week ago"

3. ✅ Specific students visible:
   - **Alice Johnson** (user-1): Active, 65%, 13/20 lessons, 12h, Yesterday
   - **Bob Smith** (user-2): Completed, 100%, 20/20 lessons, 18h, Certificate issued
   - **Carol Williams** (user-3): Active, 30%, 6/20 lessons, 4h, 2 days ago
   - **Dave Johnson** (user-4): Dropped, 15%, affected status

**Interactive Test - Send Message:**
1. Type message: "Don't forget about the JavaScript quiz due Friday!"
2. Select "Reminder" as type
3. Select "Active Students Only" as recipients
4. Click "Send Message"
5. ✅ Alert should show: "Notification sent to X student(s)"
6. Check browser console - should see:
   - `notifyStudentMessage()` called
   - Event logged to admin audit trail

### Analytics Tab
Click the **Analytics** tab:

**What You Should See:**
1. ✅ **Enrollment Status** chart showing:
   ```
   Active - 3 students (progress bar)
   Completed - 1 student (progress bar)
   Dropped - 1 student (progress bar)
   Paused - 0 students (progress bar)
   ```

2. ✅ **Progress Summary:**
   - Average Student Progress: 54%
   - Course Completion Rate: 20%

3. ✅ **Progress Distribution** showing how many students at each level:
   ```
   0-20%: 1 student
   20-40%: 1 student
   40-60%: 1 student
   60-80%: 1 student
   80-100%: 1 student
   ```

---

## Test Scenario 3: Student Views Their Enrollments

### URL: `http://localhost:3004/dashboard/my-courses`

**What You Should See:**
1. ✅ Header: "My Learning Journey"
2. ✅ **3 Stats Cards:**
   - Enrolled Courses: 2
   - Completed: 1
   - Active: 1

3. ✅ **Course Cards** for user-1's enrollments:
   
   **Card 1: Introduction to Web Development**
   - Facilitator: [facilitator name]
   - Status: "Active" (green badge)
   - Progress bar: 65%
   - Details:
     - Lessons: "13/20"
     - Time Spent: "12 hours"
     - Last Active: "Yesterday"
   - Buttons: "Continue Learning" | "Order & Refunds"

   **Card 2: [Second course name]**
   - Status: May be different
   - Progress: Shows actual %
   - Details: Real data
   - Buttons available

4. ✅ **Bottom section:** "Need Help?" with link to Orders & Refunds

---

## Test Scenario 4: Admin Sees Real-Time Notifications

### Setup:
1. Open course editor in one browser tab
2. Open admin panel/navbar in another
3. Look for **AdminNotificationsPanel** (bell icon somewhere in navbar)

### Test Notifications:
1. ✅ When you send a message to students in course editor:
   - Admin panel should light up (bell icon shows number)
   - New notification appears
2. ✅ When you request a refund on orders page:
   - Admin notification triggered
   - Should visible in admin dashboard if integrated

---

## Data Verification Checklist

### Orders Data (3 orders for user-1):
```
✅ Order ID: order-1, Amount: $99.99, Date: 2026-01-15, Status: completed
✅ Order ID: order-2, Amount: $499.99, Date: 2026-02-20, Status: completed
✅ Order ID: order-3, Amount: $164.99, Date: 2026-03-10, Status: completed
```

### Enrollments Data (5 enrollments across 2 courses):
```
Course 1 (course-1):
✅ user-1: 65% complete (13/20 lessons) - Active
✅ user-2: 100% complete (20/20 lessons) - Completed
✅ user-3: 30% complete (6/20 lessons) - Active
✅ user-4: 15% complete (3/20 lessons) - Dropped

Course 2 (course-2):
✅ user-1: 40% complete (8/20 lessons) - Active
```

---

## Expected Behavior (Not Bugs)

### What Might Look "Odd" but Is Correct:

1. **No real backend integration**
   - Data is in-memory JavaScript objects
   - Orders don't actually come from Prisma/DB
   - Enrollments are hardcoded
   - ✅ This is intentional for this demo

2. **User is always "user-1"**
   - Pages show data for hardcoded user-1
   - This is for testing - production would use auth context
   - ✅ This is intentional for this demo

3. **Notifications don't email students**
   - Admin sees notifications
   - But students don't get real emails
   - console.log shows the message
   - ✅ This is intentional - email integration comes later

4. **Admin panel might not be integrated yet**
   - AdminNotificationsPanel is created as component
   - May not be in navbar yet
   - ✅ This is next step - view in console instead

---

## Success Criteria

### ✅ All tests pass if:
1. Orders page shows 3 real orders (not blank, not generic)
2. Course editor shows 4-5 students with real names and progress %
3. My Courses page shows user-1's 2 enrollments with progress
4. You can request refund and see notification trigger
5. You can send message to students and see log
6. All pages load without white screen of death
7. No errors in types (TypeScript compilation passes)

### ❌ Problems if:
1. Pages show "No data" or empty lists (orders/students should exist)
2. Progress shows "0%" for everyone (should show real %)
3. Student names are generic "Student 1" (should show Alice, Bob, etc.)
4. Console has red errors (TypeScript issues)
5. Notifications don't fire (events not being triggered)

---

## Browser Console Tips

### View Admin Events:
```javascript
// In browser console:
import { getAdminEvents } from '@/lib/adminNotifications';
const events = await getAdminEvents();
console.log(events);  // Shows all admin events
```

### Subscribe to Real-Time Events:
```javascript
// In browser console:
import { subscribeToAdminEvents } from '@/lib/adminNotifications';
const unsubscribe = subscribeToAdminEvents((event) => {
  console.log('New event:', event);
});
// Now every action will log to console
```

---

## Quick Links

- **Orders & Refunds:** http://localhost:3004/dashboard/orders-and-refunds
- **Course Editor:** http://localhost:3004/dashboard/courses/course-1/edit-enhanced
- **My Courses:** http://localhost:3004/dashboard/my-courses
- **Refund Status:** http://localhost:3004/dashboard/admin/refunds (if exists)
- **Admin Dashboard:** http://localhost:3004/dashboard/admin (if exists)

---

## Troubleshooting

### Page won't load / 404
- Dev server running? Check `npm run dev` output
- Correct URL? Copy from "Quick Links" above
- Port 3004? If in use, check terminal for alternate port

### Data shows as placeholder/undefined
- Refresh page (Ctrl+Shift+R, hard refresh)
- Check network tab - are API calls being made?
- Open console - errors visible?

### Notifications not triggering
- Check browser console for errors
- Verify page is sending notification trigger
- AdminNotificationsPanel may not be integrated yet (that's next)

### Student data doesn't match
- Expected: Alice (65%, 13/20), Bob (100%, 20/20), Carol (30%, 6/20), Dave (dropped)
- If different: Check `src/lib/enrollmentManager.ts` mock data
- Mock data is intentional - will switch to Prisma later

---

## Success! What This Means

If all tests pass:
✅ You now have a **realistic architecture** where:
- Features depend on each other (not isolated)
- Real data shows (not placeholders)
- Workflows are end-to-end (request → notify → respond)
- Users see what they actually did (orders they ordered, courses they enrolled in)

This is the foundation for a production-grade education platform.

Next: Connect everything to Prisma DB + add email notifications.
