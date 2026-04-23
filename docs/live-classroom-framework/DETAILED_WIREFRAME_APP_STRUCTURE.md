# Detailed Wireframe and Page-by-Page App Structure

## 1. Facilitator Classroom Workspace

Route: /dashboard/facilitator/classroom/[classroomId]

Blocks:
- Header: classroom title, strand, level, publish state
- Curriculum tabs: Modules, Lessons, Activities, Live Classroom
- Live Classroom tab:
  - Session picker
  - Sequence control (7-step flow)
  - Attendance tracker grid
  - Participation score lane
  - Incident/safeguarding notes panel
  - Replay publishing panel

Primary actions:
- Advance sequence step
- Save attendance in batch
- Log incident note
- Publish replay URL

## 2. Learner Live Session and Replay Experience

Route family:
- /dashboard/learn
- /dashboard/resources/library

Blocks:
- Session agenda and challenge prompt
- Assignment briefing and follow-up prompt
- Replay card with published recording URL

## 3. School Admin Monitoring

Route family:
- /dashboard/admin/reports
- /dashboard/admin/analytics

Blocks:
- Cohort attendance rate trend
- Facilitator session quality checks
- Incident escalation queue
- Completion and progression report

## 4. Parent Access (Younger Learners)

Route family:
- /dashboard/parent
- /api/parent/children/[childId]/progress

Blocks:
- Attendance visibility
- Assignment completion visibility
- Certificate and recognition visibility

## 5. Mobile-First Constraints

- Single-column session controls below 768px
- Attendance rows collapse to learner card blocks
- Incident/replay actions use stacked inputs and large tap targets
- Low-bandwidth mode falls back to text agenda and no autoplay media
