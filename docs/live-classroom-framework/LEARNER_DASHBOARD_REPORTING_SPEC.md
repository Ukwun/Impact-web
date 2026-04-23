# Learner Dashboard and Reporting Specification

## Learner Dashboard Requirements

Sections:
- Current term modules and next live session
- Assignment queue and due dates
- Participation score and attendance summary
- Progression eligibility and blockers
- Recognition panel (badges, certificates, facilitator markers)

## Report Types

- Learner progress report
- Attendance and participation report
- Assignment and project performance report
- Cohort completion report

## API Contracts (Current + New)

- GET /api/facilitator/live-classroom/sessions?courseId=
- GET /api/facilitator/live-classroom/sessions/[sessionId]
- POST /api/facilitator/live-classroom/sessions/[sessionId]/attendance
- POST /api/facilitator/live-classroom/sessions/[sessionId]/incident
- POST /api/facilitator/live-classroom/sessions/[sessionId]/replay/publish
- GET /api/facilitator/progression/[courseId]
- POST /api/facilitator/progression/[courseId]

## KPI Definitions

- Activation rate: learners attending first live session / enrolled learners
- Retention rate: learners active in last 14 days / enrolled learners
- Attendance rate: attended sessions / scheduled sessions
- Completion rate: learners meeting progression threshold / enrolled learners

## Low-Bandwidth Requirements

- Text-first fallback for agenda and instructions
- Deferred media loading
- Minimal payload view for attendance and progression state
