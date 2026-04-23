// ============================================================================
// SCHEMA ADDITIONS FOR PHASE 1 COMPLETION
// Add to prisma/schema.prisma
// ============================================================================

/**
 * CURRICULUM FRAMEWORK ENUMS
 */

enum CurriculumLevel {
  PRIMARY          // Ages 7-11: Habit formation
  JUNIOR_SECONDARY // Ages 12-14: Practical application
  SENIOR_SECONDARY // Ages 15-18: Enterprise readiness
  IMPACT_UNI       // Ages 18+: Execution and capital awareness
}

enum AgeGroup {
  AGES_7_11
  AGES_12_14
  AGES_15_18
  AGES_18_PLUS
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum ContentReleaseType {
  LEARN         // Introduce concepts
  PRACTICE      // Task-based activity
  LIVE_ENGAGEMENT  // Facilitator-led class
  ASSESSMENT    // Quiz or test
  REINFORCE     // Review or extension
}

/**
 * LEVEL MODEL - Curriculum Framework
 * Represents different learning levels in the programme
 * Maps to age groups and defines progression pathways
 */
model Level {
  id                    String            @id @default(cuid())
  programme             Programme         // IMPACT_SCHOOL, IMPACT_UNI, IMPACT_CIRCLE
  curriculumLevel       CurriculumLevel   // PRIMARY, JUNIOR_SECONDARY, SENIOR_SECONDARY, IMPACT_UNI
  ageGroup              AgeGroup
  
  title                 String            // e.g., "Primary (7-11)"
  description           String?
  order                 Int               // Progression order: 1 (Primary), 2 (Junior), 3 (Senior), 4 (Uni)
  
  // Level-specific metadata
  primaryOutcome        String?           // e.g., "Habit formation"
  signatureShift        String?           // e.g., "From awareness to healthy daily habits"
  minAge                Int?              /// Minimum age
  maxAge                Int?              // Maximum age
  
  // Icon and branding
  icon                  String?           // Learning level indicator
  color                 String?           // Color code for UI
  
  // Relations
  courses               Course[]          // Courses at this level
  modules               Module[]          // Modules at this level
  competencies          Competency[]      // Level-specific competencies
  
  isActive              Boolean           @default(true)
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  @@unique([programme, curriculumLevel])
  @@index([programme])
  @@index([curriculumLevel])
  @@index([ageGroup])
}

/**
 * CYCLE/TERM MODEL - Time-bound Learning Periods
 * Represents time-bound learning cycles within levels/courses
 * e.g., Term 1, Term 2, Semester, Cohort Period
 */
model Cycle {
  id                    String      @id @default(cuid())
  courseId              String
  course                Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Cycle metadata
  title                 String      // e.g., "Term 1 2026", "Cohort A - Jan 2026"
  description           String?
  cycleType             String      @default("TERM")  // TERM, SEMESTER, COHORT, BATCH, SPRINT
  order                 Int         // Sequence within course
  
  // Timeline
  startDate             DateTime    // When cycle begins
  endDate               DateTime    // When cycle ends
  registrationDeadline  DateTime?   // Last day to enroll
  
  // Capacity
  maxStudents           Int?        // null = unlimited
  currentEnrollments    Int         @default(0)
  
  // Content links
  modules               Module[]    // Modules active in this cycle
  liveSessionTemplates  ScheduledContent[] // Recurring schedule
  
  // Status
  isActive              Boolean     @default(true)
  isPublished           Boolean     @default(false)
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@unique([courseId, order])
  @@index([courseId])
  @@index([startDate])
  @@index([endDate])
  @@index([isActive])
}

/**
 * SCHEDULED CONTENT MODEL - Weekly Content Release Pattern
 * Implements the "Weekly Classroom Rhythm"
 * 
 * Example:
 * Monday: Release new lesson video (LEARN)
 * Tuesday: Release worksheet task (PRACTICE)
 * Wednesday: Schedule live class (ENGAGEMENT)
 * Friday: Release quiz (ASSESSMENT)
 * Weekend: Provide replay/extension (REINFORCE)
 */
model ScheduledContent {
  id                    String              @id @default(cuid())
  
  // Link to course or cycle
  courseId              String?
  course                Course?             @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  cycleId               String?
  cycle                 Cycle?              @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  
  moduleId              String?
  module                Module?             @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  lessonId              String?
  lesson                Lesson?             @relation("LessonSchedules", fields: [lessonId], references: [id], onDelete: Cascade)
  
  activityId            String?
  activity              Activity?           @relation(fields: [activityId], references: [id], onDelete: Cascade)
  
  liveSessionId         String?
  liveSession           LiveSession?        @relation(fields: [liveSessionId], references: [id], onDelete: Cascade)
  
  // Release configuration
  dayOfWeek             DayOfWeek
  contentType           ContentReleaseType  // LEARN, PRACTICE, LIVE_ENGAGEMENT, ASSESSMENT, REINFORCE
  releaseTime           String?             // HH:MM format, e.g., "06:00" for 6 AM
  
  // Timing
  weekNumber            Int?                // Week within cycle (1, 2, 3...)
  startDate             DateTime?           // When this schedule takes effect
  endDate               DateTime?           // When this schedule expires
  isRecurring           Boolean             @default(false) // Repeats weekly
  
  // notification & messaging
  notificationMessage   String?             // Auto-message to students
  dueDate               DateTime?           // For assignments/activities
  dueDayOffset          Int         @default(0) // Days from release
  
  isActive              Boolean             @default(true)
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([courseId])
  @@index([cycleId])
  @@index([moduleId])
  @@index([lessonId])
  @@index([dayOfWeek])
  @@index([contentType])
  @@index([isActive])
}

/**
 * PROJECT/SHOWCASE MODEL - Applied Evidence of Learning
 * Allows students to create and share projects demonstrating learning
 * Part of the SHOW_PROGRESS layer
 */
model Project {
  id                    String      @id @default(cuid())
  courseId              String
  course                Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  moduleId              String?
  module                Module?     @relation("ModuleProjects", fields: [moduleId], references: [id], onDelete: SetNull)
  
  // Project metadata
  title                 String
  description           String?
  instructions          String?     // Rich text
  rubric                String?     // JSON rubric for grading
  
  learningObjectives    String[]    @default([])
  competenciesTarget    String[]    @default([])
  
  // Timeline
  releaseDate           DateTime    @default(now())
  dueDate               DateTime?
  submissionDeadline    DateTime?
  
  // Constraints
  minTeamSize           Int         @default(1)
  maxTeamSize           Int?        // null = individual only
  allowPeerReview       Boolean     @default(true)
  allowPublicShowcase   Boolean     @default(true)
  
  maxPoints             Int         @default(100)
  
  // Relations
  submissions           ProjectSubmission[]
  files                 ProjectFile[]
  
  isPublished           Boolean     @default(false)
  isFeatured            Boolean     @default(false) // Display on school showcase
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([courseId])
  @@index([moduleId])
  @@index([dueDate])
}

/**
 * PROJECT SUBMISSION MODEL
 * Student work submission for projects
 */
model ProjectSubmission {
  id                    String      @id @default(cuid())
  projectId             String
  project               Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  userId                String
  user                  User        @relation("ProjectSubmissions", fields: [userId], references: [id], onDelete: Cascade)
  
  enrollmentId          String?
  enrollment            Enrollment? @relation(fields: [enrollmentId], references: [id], onDelete: SetNull)
  
  // Submission content
  title                 String?
  description           String?
  files                 ProjectFile[]
  
  // Status & grading
  isSubmitted           Boolean     @default(false)
  submittedAt           DateTime?
  isLate                Boolean     @default(false)
  
  score                 Int?
  feedback              String?
  rubricScores          String?     // JSON rubric scores
  gradedBy              String?
  gradedAt              DateTime?
  
  // Showcase
  isPublic              Boolean     @default(false)
  views                 Int         @default(0)
  likes                 Int         @default(0)
  peerFeedback          String?
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([isPublic])
  @@index([isSubmitted])
}

/**
 * PROJECT FILE MODEL
 * Files attached to projects
 */
model ProjectFile {
  id                    String      @id @default(cuid())
  projectId             String?
  project               Project?    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  submissionId          String?
  submission            ProjectSubmission? @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  
  fileName              String
  fileUrl               String
  fileSize              Int
  mimeType              String
  
  uploadedAt            DateTime    @default(now())

  @@index([projectId])
  @@index([submissionId])
}

/**
 * COMPETENCY MODEL - Learning Competencies Framework
 * Maps competencies to levels and courses
 * Helps track skill development across programmes
 */
model Competency {
  id                    String      @id @default(cuid())
  levelId               String
  level                 Level       @relation(fields: [levelId], references: [id], onDelete: Cascade)
  
  // Competency metadata
  code                  String      @unique  // e.g., "FL-1.1" for Financial Literacy Level 1
  title                 String      // e.g., "Understanding Money"
  description           String?
  order                 Int         // Position within level
  
  learningIndicators    String[]    @default([]) // How to measure mastery
  assessmentMethods     String[]    @default([]) // How to assess
  
  // Relations
  modules               Module[]    // Modules targeting this competency
  lessons               Lesson[]    // Lessons targeting this competency
  
  isActive              Boolean     @default(true)
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@unique([levelId, code])
  @@index([levelId])
}

/**
 * SUBSCRIPTION FEATURE MODEL - Maps Features to Subscription Tiers
 * Ensures different subscription tiers get appropriate features
 */
model SubscriptionFeature {
  id                    String              @id @default(cuid())
  membershipTierId      String
  membershipTier        MembershipTier      @relation(fields: [membershipTierId], references: [id], onDelete: Cascade)
  
  // Feature metadata
  featureCode           String              // e.g., "LIVE_SESSIONS", "PROJECTS", "COHORT_MANAGEMENT"
  featureName           String
  description           String?
  
  // Limits
  maxAccess             Int?                // null = unlimited
  currentUsage          Int         @default(0)
  
  // Feature details
  isEnabled             Boolean             @default(true)
  priority              Int         @default(0) // Higher = more important
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@unique([membershipTierId, featureCode])
  @@index([membershipTierId])
}

// ============================================================================
// UPDATES TO EXISTING MODELS
// ============================================================================

// Add these fields to the Course model:
/*
  levelId               String?
  level                 Level?      @relation(fields: [levelId], references: [id])
  
  cycleId               String?
  cycle                 Cycle?      @relation(fields: [cycleId], references: [id])
  
  projects              Project[]
  scheduledContent      ScheduledContent[]
  
  competencies          Competency[]
  
  // Metadata additions
  ageGroupTarget        AgeGroup?
  subjectStrand         String?
  estimatedWeeks        Int         @default(8)
  recommendedGrade      String[]    @default([])
*/

// Add these fields to the Module model:
/*
  levelId               String?
  level                 Level?      @relation(fields: [levelId], references: [id])
  
  cycleId               String?
  cycle                 Cycle?      @relation(fields: [cycleId], references: [id])
  
  projects              Project[]   @relation("ModuleProjects")
  scheduledContent      ScheduledContent[]
  
  competencies          Competency[]
*/

// Add these fields to the Lesson model:
/*
  schedules             ScheduledContent[] @relation("LessonSchedules")
  competencies          Competency[]
*/

// Add these fields to the Activity model:
/*
  schedules             ScheduledContent[]
*/

// Add these fields to the LiveSession model:
/*
  schedule              ScheduledContent?
*/

// Add these fields to the User model:
/*
  projectSubmissions    ProjectSubmission[] @relation("ProjectSubmissions")
  levelId               String?
  level                 Level?      @relation(fields: [levelId], references: [id])
*/

// Add these fields to the MembershipTier model:
/*
  features              SubscriptionFeature[]
*/
