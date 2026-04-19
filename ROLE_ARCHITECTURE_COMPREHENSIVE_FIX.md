# 🎯 Role-Based Architecture - Comprehensive Fix Plan

## The Problem (You're Right)

Currently, all 8 roles appear to be using the same/similar functionality with just different UI styling:
- ❌ StudentDashboard shows courses + progress
- ❌ FacilitatorDashboard shows... courses + progress  
- ❌ ParentDashboard shows... courses + progress
- ❌ AdminDashboard shows... courses + progress
- ❌ Similar pattern for all other roles

**This is wrong.** Each role should have a fundamentally different experience with completely different data, APIs, and operations.

---

## The Solution: Role-Specific Architecture

### 1️⃣ STUDENT Role (ImpactSchools)

**Real-life experience:** Learner taking courses from facilitators

**Unique Data & Functions:**
- View enrolled courses (MY courses, not all)
- Track personal progress percentage
- View assignments TO SUBMIT
- Track grades RECEIVED
- View certificates earned
- Join new courses
- View peer leaderboards
- Track study streak
- View personalized recommendations

**Specific API Endpoints:**
- `GET /api/student/dashboard` - dashboard data only
- `GET /api/student/courses` - enrolled courses only
- `GET /api/student/progress` - personal progress only
- `GET /api/student/assignments` - assignments for current user
- `POST /api/student/enroll` - enroll in new course

**Data: What student sees:**
- 5 enrolled courses with progress
- 3 pending assignments
- 2 grades received
- Personal study streak
- Personalized leaderboard rank

---

### 2️⃣ FACILITATOR Role (Teacher/Course Creator)

**Real-life experience:** Creating and teaching courses to many students

**Unique Data & Functions:**
- View courses THEY CREATED/TEACH
- View students enrolled IN THEIR COURSES
- Grade student submissions
- View class engagement/completion rates
- Create new lessons/assignments
- Manage course content
- View student performance analytics
- Communicate with students
- View teaching effectiveness metrics

**Specific API Endpoints:**
- `GET /api/facilitator/dashboard` - teaching metrics
- `GET /api/facilitator/courses` - courses they teach
- `GET /api/facilitator/classes` - class rosters
- `GET /api/facilitator/submissions` - student submissions to grade
- `POST /api/facilitator/grade` - grade an assignment
- `POST /api/facilitator/courses` - create new course
- `GET /api/facilitator/analytics` - class analytics

**Data: What facilitator sees:**
- 3 courses I teach
- 47 total students across classes
- 12 pending submissions to grade
- 85% class completion rate
- Top 5 performing students

---

### 3️⃣ PARENT Role

**Real-life experience:** Monitoring child's learning progress

**Unique Data & Functions:**
- View CHILD'S enrolled courses (not own)
- Track CHILD'S progress only
- View CHILD'S grades
- See CHILD'S assignments status
- View attendance (if available)
- Communicate with facilitators about child
- Set learning goals for child
- View child's achievements
- Get alerts on child's performance

**Specific API Endpoints:**
- `GET /api/parent/dashboard` - child's overview
- `GET /api/parent/child/:id/progress` - specific child progress
- `GET /api/parent/child/:id/grades` - child's grades
- `GET /api/parent/alerts` - performance alerts
- `POST /api/parent/message` - contact facilitator

**Data: What parent sees:**
- Child: Sarah - 85% progress in Math
- Child: Tom - 92% progress in Science
- Performance alerts: "Sarah needs help with Quiz 3"
- Latest grades for each child

---

### 4️⃣ SCHOOL_ADMIN Role

**Real-life experience:** Managing entire school institution

**Unique Data & Functions:**
- View all students (those registered at school)
- View all facilitators at school
- View all courses offered at school
- See institutional statistics
- Manage user registrations/approvals
- View school-wide reports
- Generate attendance reports
- Manage school settings
- View performance metrics
- Communicate with staff

**Specific API Endpoints:**
- `GET /api/admin/school/dashboard` - institutional metrics
- `GET /api/admin/school/users` - all users at school
- `GET /api/admin/school/students` - student list
- `GET /api/admin/school/facilitators` - facilitator list
- `GET /api/admin/school/reports` - school reports
- `POST /api/admin/school/approve-user` - approve registrations
- `DELETE /api/admin/school/users/:id` - manage users

**Data: What admin sees:**
- Total Students: 324
- Total Facilitators: 18
- Total Courses: 42
- Completion Rate: 78%
- New Registrations: 12 pending approval

---

### 5️⃣ MENTOR Role

**Real-life experience:** Providing personalized mentorship

**Unique Data & Functions:**
- View list of mentees
- Schedule mentoring sessions
- Track mentee progress
- Provide 1-on-1 guidance
- Share resources with mentees
- View mentee achievements
- Give mentee feedback
- Track mentorship effectiveness

**Specific API Endpoints:**
- `GET /api/mentor/dashboard` - mentorship overview
- `GET /api/mentor/mentees` - list of mentees
- `GET /api/mentor/mentees/:id/progress` - mentee progress
- `POST /api/mentor/sessions` - schedule session
- `POST /api/mentor/feedback` - provide feedback
- `GET /api/mentor/analytics` - mentorship analytics

**Data: What mentor sees:**
- 8 active mentees
- 2 sessions this week scheduled
- Mentee: Alex - 76% course progress
- Pending feedback requests: 3

---

### 6️⃣ ADMIN Role (System Administrator)

**Real-life experience:** Managing entire platform

**Unique Data & Functions:**
- System-wide statistics
- All users management
- System health monitoring
- Alert/incident management
- Platform settings
- Analytics across all schools
- User role management
- System performance metrics
- Backup/security management

**Specific API Endpoints:**
- `GET /api/admin/dashboard` - system overview
- `GET /api/admin/users` - all platform users
- `GET /api/admin/alerts` - system alerts (we just implemented this!)
- `GET /api/admin/analytics` - platform analytics
- `PUT /api/admin/user/:id/role` - change user role
- `POST /api/admin/backup` - system backup
- `GET /api/admin/system-health` - system status

**Data: What admin sees:**
- Total Users: 1,245
- Total Schools: 8
- System Health: 99.2% uptime
- Critical Alerts: 1
- New Support Tickets: 5

---

### 7️⃣ UNI_MEMBER Role (University Student)

**Real-life experience:** Accessing university-specific resources and networks

**Unique Data & Functions:**
- View university courses
- Connect with university peers
- Access research resources
- View university events
- Join research projects
- View scholarship opportunities
- Access career services
- Network with alumni

**Specific API Endpoints:**
- `GET /api/uni/dashboard` - university overview
- `GET /api/uni/courses` - university courses
- `GET /api/uni/peers` - connect with peers
- `GET /api/uni/events` - university events
- `GET /api/uni/opportunities` - scholarships/careers

---

### 8️⃣ CIRCLE_MEMBER Role (Professional Community)

**Real-life experience:** Professional networking and development

**Unique Data & Functions:**
- Access professional community
- Join professional networks
- Attend professional events
- Share expertise/insights
- Find mentors/collaborators
- View job opportunities
- Access professional development resources
- Build professional profile

**Specific API Endpoints:**
- `GET /api/circle/dashboard` - professional overview
- `GET /api/circle/networks` - professional networks
- `GET /api/circle/events` - professional events
- `GET /api/circle/opportunities` - job/collaboration
- `POST /api/circle/profile` - manage profile

---

## Current State vs. Desired State

### What Exists Now (Broken):
```
StudentDashboard.tsx ──┬─→ useUserProgress() ──→ /api/progress (STUDENT only)
                       └─→ Shows courses, progress
FacilitatorDashboard.tsx ──→ ALSO useUserProgress() (BROKEN 403!)
ParentDashboard.tsx ──────→ ALSO useUserProgress() (Wrong child data!)
SchoolAdminDashboard.tsx ──→ ALSO useUserProgress() (Wrong scope!)
... all copying the same pattern
```

### What Needs to Exist (Fixed):
```
StudentDashboard.tsx ────────→ useStudentData() ──→ /api/student/dashboard
FacilitatorDashboard.tsx ─────→ useFacilitatorData() ──→ /api/facilitator/dashboard
ParentDashboard.tsx ──────────→ useParentData() ──→ /api/parent/dashboard
SchoolAdminDashboard.tsx ─────→ useSchoolAdminData() ──→ /api/admin/school/dashboard
MentorDashboard.tsx ──────────→ useMentorData() ──→ /api/mentor/dashboard
AdminDashboard.tsx ───────────→ useAdminData() ──→ /api/admin/dashboard
UniversityMemberDashboard.tsx ─→ useUniversityData() ──→ /api/uni/dashboard
CircleMemberDashboard.tsx ─────→ useCircleData() ──→ /api/circle/dashboard
```

---

## Implementation Roadmap

### Phase 1: Fix Immediate Errors ✅
- ✅ Remove useUserProgress from FacilitatorDashboard
- Next: Fix remaining role dashboards

### Phase 2: Create Role-Specific Hooks (2-3 hours)
Create in `src/hooks/useRoleDashboards.ts`:
- `useStudentData()` - for students
- `useFacilitatorData()` - **PARTIALLY EXISTS**, enhance it
- `useParentData()` - for parents
- `useSchoolAdminData()` - **PARTIALLY EXISTS**, use it
- `useMentorData()` - for mentors
- `useAdminData()` - **EXISTS**, verify it works
- `useUniversityData()` - for university members
- `useCircleData()` - for circle members

### Phase 3: Create Role-Specific API Endpoints (4-5 hours)
- Create `/api/student/dashboard`
- Create `/api/facilitator/dashboard`
- Create `/api/parent/dashboard`
- Ensure `/api/admin/school/dashboard`
- Create `/api/mentor/dashboard`
- Verify `/api/admin/dashboard` works
- Create `/api/uni/dashboard`
- Create `/api/circle/dashboard`

### Phase 4: Update Dashboard Components (3-4 hours)
- Refactor each dashboard to use ONLY its role-specific hook
- Remove cross-role data fetching
- Add role-specific functionality buttons/features
- Test each one independently

### Phase 5: Testing & QA (2-3 hours)
- Test login as each role
- Verify no 403 errors
- Verify no cross-role data leakage
- Verify each has unique functionality

---

## Why This Matters

**For Users:**
- Each role sees THEIR data, not generic data
- Facilitators see student submissions to grade, not courses to enroll
- Parents see children's progress, not their own
- Admins see platform metrics, not personal progress
- **It feels like a REAL product with real different user types**

**For Security:**
- Students can't see facilitator data
- Parents can only see their children
- Admins see appropriate scope
- No data leakage between roles

**For Real-life Experience:**
- Users understand their role immediately
- Each dashboard is purposeful and relevant
- Operations make sense for that role
- No "why is this button here?" confusion

---

## Success Criteria

When complete, each role logged in should see:
- ✅ ONLY their role-relevant data
- ✅ ONLY their role-relevant operations
- ✅ NO 403 errors from cross-role API calls
- ✅ Dashboard that makes sense for that job
- ✅ Different experience from other roles

---

## Next Steps

1. **Immediate (Today):** ✅ Fix facilitator dashboard (DONE)
2. **Short-term (Next 2-3 hours):** Create role-specific hooks & APIs
3. **Medium-term (Next 3-4 hours):** Update all dashboard components
4. **Final (Next 2-3 hours):** Test all 8 roles independently

**Goal:** By end of session, each of 8 roles has a genuinely differentdashboard with appropriate data and functions.
