# Role-Specific Functionality Roadmap

**Status**: Facilitator role complete ✅ | Other 7 roles: Ready to implement  
**Framework**: Proven pattern established (see FACILITATOR_GRADING_IMPLEMENTATION.md)  
**Estimated Timeline**: 2-3 weeks (5-7 hours per role)

---

## 🎯 Overview

The **Facilitator Dashboard** is now fully functional with real grading, roster management, and messaging. This document outlines how to implement the same **real, working** functionality for the remaining 7 user roles.

Each role will get:
- 2-3 specialized modal components
- 2-3 new API endpoints  
- Enhanced dashboard with real actions
- Real database persistence
- User notifications

## Role Implementation Order (Priority)

```
✅ 1. FACILITATOR    - Complete (Grading, Roster, Messaging)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ 2. PARENT         - Child dashboard, homework view, teacher messaging
⏳ 3. SCHOOL_ADMIN   - Facilitator approval, user management, reports
⏳ 4. STUDENT        - Assignments, submissions, progress tracking (core)
⏳ 5. MENTOR         - Mentee tracking, session scheduling, progress reports
⏳ 6. UNI_MEMBER     - Course browsing, event registration, networking
⏳ 7. CIRCLE_MEMBER  - Member directory, connections, job board
⏳ 8. ADMIN          - System management, alerts, user administration
```

---

## 2️⃣ PARENT Dashboard

### What Parents Need
- View each child's courses and progress separately
- See assignments and due dates
- Check grades and feedback
- Contact facilitator about specific child
- Receive attendance alerts

### Components (3)
```
1. ChildProgressModal
   - Show child: enrollment, assignments, grades, progress %
   - Button to "View Full Details"
   - Show recent feedback from facilitators

2. MessageFacilitatorModal  
   - Select which child/course to message about
   - Subject + message body
   - Sent to course facilitator

3. AttendanceAlertModal
   - Show attendance warnings
   - Options to address/dismiss
   - Links to facilitator
```

### API Endpoints (3)
```
GET /api/parent/children
├─ List user's children with enrollment count
├─ Age, created date, active courses
└─ Returns: [{ id, name, enrollmentCount, activeCoursesCount }]

GET /api/parent/children/[childId]
├─ Full child profile with enrollments
├─ Assignments, submissions, grades
├─ Attendance records
└─ Returns: { child, enrollments[], assignments[], grades[] }

GET /api/parent/children/[childId]/assignments
├─ Child's assignments filtered by status
├─ Due dates, submission status, grades
├─ Allows ?status=pending|submitted|graded
└─ Returns: [{ id, title, dueDate, status, grade}]
```

### Dashboard Changes
- Replace generic cards with child-specific data
- Show: child name, active courses, pending assignments
- Quick action: "View [Child Name]'s Progress"
- Quick action: "Message Facilitator"
- Timeline of recent grades/activities

### Estimated Effort: 5-6 hours
- 2 hours: Component creation
- 1 hour: API endpoints  
- 1 hour: Dashboard enhancements
- 1 hour: Testing & refinement

---

## 3️⃣ SCHOOL_ADMIN Dashboard

### What School Admins Need
- Approve/reject facilitator applications
- Manage all users in school
- Generate reports (enrollment, completion, grades)
- View institutional metrics
- Manage courses and programs
- View payments (if billing involved)

### Components (3)
```
1. FacilitatorApprovalModal
   - Show pending facilitator applications
   - View: Name, email, qualifications, subject areas
   - Actions: Approve, Reject with reason, Request Info
   - Creates notification for applicant

2. ReportGeneratorModal
   - Select report type:
     * Enrollment Report (by course, date range)
     * Completion Report (completion %, time taken)
     * Grades Report (grade distribution, pass/fail)
     * Attendance Report (patterns, trends)
     * Payment Report (revenue, refunds)
   - Export options: PDF, CSV
   - Date range filters

3. UserManagementModal
   - List all users (searchable)
   - Filter by role
   - Actions: Edit, Disable/Enable, Reset Password
   - Show created date, last login, status
```

### API Endpoints (4)
```
GET /api/admin/school/pending-facilitators
├─ List facilitator applications pending approval
├─ Include: name, email, qualifications, appliedDate
└─ Returns: [{ id, name, email, qualified }]

POST /api/admin/school/facilitators/[id]/approve
├─ Approve a facilitator application
├─ Sets facilitator.verified = true
└─ Creates notification for facilitator

POST /api/admin/school/facilitators/[id]/reject
├─ Reject facilitator + reason stored
├─ Creates notification mentioning reason
└─ Allows reapplication after 30 days

GET /api/admin/school/reports
├─ Query params: reportType, startDate, endDate, format(pdf|csv)
├─ Enrollment: Count students per course, over time
├─ Completion: % who finished, avg time, pass rates
├─ Grades: Distribution, avg per course, by facilitator
└─ Returns: Report data or file stream
```

### Dashboard Changes
- KPI cards: Total users, pending approvals, courses, completion rate
- "Pending Approvals" card with count, "Review" button
- "Generate Report" button → opens modal
- "Manage Users" button
- System health metrics

### Estimated Effort: 6-7 hours
- 3 hours: Component creation (complex modals)
- 2 hours: API endpoints (especially reports)
- 1 hour: Dashboard integration
- 1 hour: Testing

---

## 4️⃣ STUDENT Dashboard

### What Students Need
- View enrolled courses
- See assignments and due dates
- Submit assignments
- View grades and feedback
- Track progress/completion
- See certificates earned

### Components (3)
```
1. AssignmentSubmissionModal
   - Show: title, description, due date, rubric
   - File upload or text submission
   - Submit with one click
   - Show submission status

2. GradeViewModal
   - Show: score, feedback, rubric assessment
   - Facilitator comments
   - Option to contact facilitator about grade

3. ProgressTrackerModal
   - Show course progress as % 
   - Breakdown: lectures completed, assignments submitted, grade
   - Estimated time remaining
   - Suggested next steps
```

### API Endpoints (3)
```
GET /api/student/assignments
├─ List all student's assignments
├─ Filters: ?status=pending|submitted|graded
├─ Sort by due date
└─ Returns: [{ id, courseId, title, dueDate, status }]

POST /api/student/assignments/[id]/submit
├─ Submit assignment
├─ Body: { submissionText } or file
├─ Sets: submission.submittedAt = now()
├─ Creates notification for facilitator
└─ Returns: { submissionId, status: "submitted" }

GET /api/student/progress
├─ Overall progress metrics
├─ Per-course: % complete, grade if exists
├─ Certificates earned
└─ Returns: { totalProgress, courses[], certificates[] }
```

### Dashboard Changes
- Course cards showing: progress %, assignments pending, latest grade
- "Assignments" section with due dates and submission buttons
- Quick stats: assignments due, grades pending review
- Progress timeline

### Estimated Effort: 5-6 hours
- Simpler than admin (fewer modals)
- One file upload system
- Standard API patterns

---

## 5️⃣ MENTOR Dashboard

### What Mentors Need
- View list of mentees assigned
- Schedule and track mentoring sessions
- Provide feedback and track progress
- Send messages/files to mentees
- File session notes and reports

### Components (3)
```
1. MenteeProgressModal
   - Show mentee: enrollment, goals, progress
   - Session history with dates
   - Notes from previous sessions
   - Show growth over time

2. SessionScheduler Modal
   - Calendar view for booking sessions
   - Select date/time, duration
   - Location (virtual, in-person, hybrid)
   - Send invite to mentee

3. SessionNotesModal
   - After session: log notes
   - Topics discussed
   - Feedback for mentee
   - Action items
   - Mentee progress rating
```

### API Endpoints (3)
```
GET /api/mentor/mentees
├─ List all mentees mentor is assigned to
├─ Include: name, matchDate, progressScore
└─ Returns: [{ id, name, status, matchDate }]

GET /api/mentor/mentees/[menteeId]/sessions
├─ List all sessions with this mentee
├─ Include dates, notes, ratings
└─ Returns: [{ id, date, duration, notes, rating }]

POST /api/mentor/sessions
├─ Create new session
├─ Body: { menteeId, startTime, endTime, notes, rating }
├─ Creates calendar entry + notification for mentee
└─ Returns: { sessionId, status: "scheduled" }
```

### Dashboard Changes
- Mentee cards with progress rating
- "Schedule Session" buttons
- Session calendar/timeline
- Quick notes/follow-ups

### Estimated Effort: 5-6 hours
- Calendar integration (consider date-picker library)
- Session tracking system
- Progress rating system

---

## 6️⃣ UNI_MEMBER Dashboard

### What Uni Members Need
- Browse university courses
- Register for events/seminars
- View upcoming events calendar
- Download resources/materials
- See research opportunities
- Join study groups

### Components (3)
```
1. CourseDetailModal
   - Show: title, description, facilitator, schedule
   - Prerequisites, attendance, grading
   - "Enroll" button

2. EventRegistrationModal
   - Show: event details, date/time/location
   - Capacity, current registrations
   - "Register for Event" button
   - Calendar integration

3. ResourcesModal
   - Browse available materials
   - Download files or links
   - Organize by course/topic
```

### API Endpoints (3)
```
GET /api/uni-member/courses
├─ List all available university courses
├─ Include: capacity, enrolled count, facilitator
└─ Filters: ?category=research|professional|skills

GET /api/uni-member/events
├─ Upcoming university events
├─ Filters: ?type=seminar|workshop|conference|networking
└─ Calendar format support

POST /api/uni-member/events/[eventId]/register
├─ Register for event
├─ Creates ticket/confirmation
├─ Adds to user calendar
└─ Returns: { registrationId, confirmationEmail }
```

### Dashboard Changes
- Calendar of upcoming events
- Featured courses section
- Quick "Browse Courses" action
- Event registration buttons

### Estimated Effort: 4-5 hours
- Simpler modals
- Calendar integration
- Less backend complexity

---

## 7️⃣ CIRCLE_MEMBER Dashboard

### What Circle Members Need
- Browse member directory
- Send connection requests
- Join working circles (groups)
- Post to feed/timeline
- Find job opportunities
- Network with professionals

### Components (3)
```
1. MemberProfileModal
   - Show: name, expertise, location, introduction
   - Skills/interests
   - "Send Connection" button
   - Portfolio/links

2. JobBoardModal  
   - Browse job listings
   - Filter by category, location, level
   - Post job or apply
   - Save job for later

3. CircleGroupModal
   - Show group details, members
   - Group discussions/posts
   - Join button
   - Pinned resources
```

### API Endpoints (3)
```
GET /api/circle/members
├─ Directory of all circle members
├─ Search by name, skills, location
├─ Include: expertise, connectionStatus
└─ Pagination support

POST /api/circle/members/[memberId]/connect
├─ Send connection request
├─ Creates notification
├─ Can include message
└─ Returns: { requestId, status: "pending" }

GET /api/circle/jobs
├─ List available job opportunities
├─ Filters: ?category=remote|full-time|contract
├─ Show: title, company, posted date, applicants
└─ Returns: [{ id, title, company, description }]
```

### Dashboard Changes
- Member feed/timeline
- "Find Professionals" action
- "Browse Jobs" section
- Active connections
- Group participation stats

### Estimated Effort: 5-6 hours
- Social features are new
- Feed/timeline component needed
- Connection management system

---

## 8️⃣ ADMIN Dashboard

### What Admins Need
- System-wide user management
- Monitor system alerts
- View usage statistics
- Configure system settings
- Manage all courses and content
- View error logs

### Components (3)
```
1. SystemAlertsModal
   - Show all system alerts (already exists)
   - View details, mark resolved
   - See error logs and stack traces
   - Clear older alerts

2. UserManagementModal
   - System-wide user list (not just school)
   - Search, filter by role
   - Edit, disable, delete users
   - Reset passwords, resend invites
   - View user activity logs

3. SettingsModal
   - Configure system settings
   - Email templates
   - Payment provider settings
   - Feature flags
   - Backup schedule
```

### API Endpoints (2-3)
```
GET /api/admin/users
├─ All platform users (paginated)
├─ Filters: role, status, dateRange
├─ Search by email/name
└─ Returns: [{ id, email, role, status, createdAt }]

PUT /api/admin/users/[userId]
├─ Edit any user
├─ Update role, disable/enable
├─ View activity history
└─ Returns: updated user

GET /api/admin/system/health
├─ System metrics
├─ Database size, error counts
├─ API response times
├─ User activity summary
└─ Returns: { health, metrics }
```

### Dashboard Changes
- System health indicators
- User activity graphs
- Recent alerts (already has SystemAlert model)
- Admin quick actions

### Estimated Effort: 4-5 hours
- Builds on existing SystemAlert system
- Reuses user management patterns
- Dashboard already has framework

---

## Implementation Pattern (Proven)

Each role follows this exact pattern:

```
STEP 1: Create Components (2-3 hours)
├─ Modals with forms/displays
├─ Import UI components (Button, Card, etc.)
├─ Props for onClose, onSubmit handlers
└─ Dark theme consistent with platform

STEP 2: Create API Endpoints (1-2 hours)
├─ Verify JWT token and role
├─ Query/update database with Prisma
├─ Return JSON responses
├─ Create notifications where needed
└─ Error handling on each endpoint

STEP 3: Update Dashboard (1 hour)
├─ Import new modals and components
├─ Add state for modal visibility
├─ Add useEffect to load initial data
├─ Add action handlers
├─ Wire action buttons to modals
└─ Handle loading/error states

STEP 4: Database Changes (15-30 mins)
├─ Update Prisma schema if needed
└─ Create migration
```

---

## Shared Infrastructure Created ✅

All roles will use these existing systems:

| System | Status | Used By |
|--------|--------|---------|
| Notification system | ✅ Complete | All roles |
| Message model | ✅ Complete | All roles |
| Toast UI component | ✅ Complete | All roles |
| Modal wrapper component | ✅ Complete | All roles |
| Auth system (JWT + roles) | ✅ Complete | All roles |
| Dark UI theme | ✅ Complete | All roles |
| Button/Card components | ✅ Complete | All roles |
| useToast hook | ✅ Complete | All roles |
| useRouter hook | ✅ Complete | All roles |

**No need to rebuild these** — just use existing infrastructure.

---

## Development Checklist per Role

For each role, before starting:

- [ ] Read this doc section for that role
- [ ] List out the 2-3 components needed
- [ ] List out the 2-3 API endpoints needed
- [ ] Create issue/branch: `feature/[role]-functionality`
- [ ] Component creation (check imports available)
- [ ] API endpoint creation
- [ ] Dashboard updates
- [ ] Build test: `npm run build` passes
- [ ] Git commit with clear message
- [ ] Create testing guide (like FACILITATOR_TESTING_GUIDE.md)
- [ ] Create implementation doc (like FACILITATOR_GRADING_IMPLEMENTATION.md)
- [ ] Mark role as ✅ Complete

---

## Timeline Estimate

```
Facilitator    ✅          1 day (DONE)
Parent         ⏳    ▓     6 hours (1 day)
School Admin   ⏳    ▓     7 hours (1 day)
Student        ⏳    ▓     6 hours (1 day)
Mentor         ⏳    ▓     6 hours (1 day)
Uni Member     ⏳    ▓     5 hours (1 day)
Circle Member  ⏳    ▓     6 hours (1 day)
Admin          ⏳    ▓     5 hours (1 day)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 8 days to complete all 8 roles
```

At 8 hours/day: **1 week full-time effort**

## Dependencies & Prerequisites

✅ All prerequisites are **already complete**:
- JWT auth system working
- Prisma ORM configured
- Notification system ready
- UI components library available
- Dark theme established
- API route structure proven

**No blockers** — can start on next role immediately.

---

## Success Criteria

Each role is "done" when:

- [x] All component files created and build passes
- [x] All API endpoints created and tested
- [x] Dashboard enhanced with real actions
- [x] Users can actually DO their role's job
- [x] Notifications flow to relevant users
- [x] Comprehensive testing guide written
- [x] Implementation doc explains all changes
- [x] Git committed with clear message
- [x] No console errors or warnings
- [x] Network tab shows 200 OK responses

---

## Notes

1. **Copy the pattern from Facilitator** - Don't reinvent. Each role implementation is very similar.

2. **Keep modals focused** - One modal = one specific action.

3. **Real data always** - No mocks. Persist to database and notify users.

4. **Test immediately** - Build after each component/endpoint. Catch errors early.

5. **Document as you go** - Makes next role easier.

6. **Ask: "Can user actually DO their job?"** - If no, keep building.

---

## Next Steps

1. ✅ Review Facilitator implementation (FACILITATOR_GRADING_IMPLEMENTATION.md)
2. ✅ Test Facilitator dashboard
3. ⏳ Pick PARENT as next role (most important for the platform)
4. ⏳ Follow same pattern:
   - Create components
   - Create API endpoints
   - Update dashboard
   - Test thoroughly
   - Document changes
5. ⏳ Move to next role

Ready to build real, working platform that users can actually use! 🚀

---

**Last Updated**: April 8, 2026 | **Status**: Framework proven ✅ Ready for next roles
