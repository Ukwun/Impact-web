# Database and CMS Schema

## Existing Core Models Used

- LiveSession
- LiveSessionAttendance
- Enrollment
- QuizAttempt
- ActivitySubmission
- UserAchievement
- Certificate
- ContentMetadata

## Live Classroom Metadata Strategy

ContentMetadata stores operational state for LIVE_SESSION resources:
- longDescription: JSON envelope for sequence, polls, breakouts, incidents, replay state
- facilitatorNotes: lesson plan and facilitation notes
- learnerInstructions: assignment reminders and follow-up prompts
- engageLiveComponentUrl: facilitator classroom route
- progressComponentUrl: replay library route

## Operational JSON Envelope

Fields:
- currentStepKey
- polls[]
- breakouts[]
- incidents[]
- replay { published, publishedAt }

## Progression Data Inputs

Computed per learner from:
- Enrollment.progress
- QuizAttempt.percentageScore
- ActivitySubmission.isSubmitted
- LiveSessionAttendance.attendanceMinutes and attended

## CMS Publication Behavior

- Replay publishing sets recordingUrl on LiveSession
- Associated ContentMetadata replay state toggles published = true
- Session metadata remains editable by facilitator and admin roles
