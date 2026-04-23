-- Add learning layer metadata to Module
ALTER TABLE "Module" ADD COLUMN "learningLayers" TEXT[] DEFAULT ARRAY['LEARN', 'APPLY', 'ENGAGE_LIVE', 'SHOW_PROGRESS'];
ALTER TABLE "Module" ADD COLUMN "ageGroup" VARCHAR(50);
ALTER TABLE "Module" ADD COLUMN "subjectStrand" VARCHAR(100);
ALTER TABLE "Module" ADD COLUMN "competencies" TEXT[];
ALTER TABLE "Module" ADD COLUMN "estimatedWeeks" INT DEFAULT 1;

-- Extend Lesson with layer information
ALTER TABLE "Lesson" ADD COLUMN "learningLayer" VARCHAR(50) DEFAULT 'LEARN';
ALTER TABLE "Lesson" ADD COLUMN "instructions" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "learningObjectives" TEXT[];
ALTER TABLE "Lesson" ADD COLUMN "facilitatorNotes" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "prerequisiteIds" TEXT[];

-- Create Activity table for APPLY layer tasks
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT,
    "lessonId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "activityType" VARCHAR(50) NOT NULL DEFAULT 'WORKSHEET',
    "dueDate" TIMESTAMP(3),
    "maxPoints" INTEGER NOT NULL DEFAULT 100,
    "rubric" TEXT,
    "attachments" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Activity_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE,
    CONSTRAINT "Activity_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE SET NULL,
    CONSTRAINT "Activity_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL
);

-- Create ActivitySubmission table
CREATE TABLE "ActivitySubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "content" TEXT,
    "attachments" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE,
    CONSTRAINT "ActivitySubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "ActivitySubmission_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE SET NULL
);

-- Create LiveSession table for ENGAGE_LIVE layer
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "facilitatorId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "maxParticipants" INTEGER,
    "meetingUrl" TEXT,
    "recordingUrl" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    "sessionType" VARCHAR(50) NOT NULL DEFAULT 'CLASSROOM',
    "breakoutGroups" INTEGER DEFAULT 0,
    "hasPolls" BOOLEAN NOT NULL DEFAULT false,
    "hasQandA" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LiveSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE,
    CONSTRAINT "LiveSession_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE SET NULL,
    CONSTRAINT "LiveSession_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User" ("id") ON DELETE RESTRICT
);

-- Create LiveSessionAttendance table
CREATE TABLE "LiveSessionAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "attendanceMinutes" INTEGER DEFAULT 0,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiveSessionAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession" ("id") ON DELETE CASCADE,
    CONSTRAINT "LiveSessionAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Add learning progress tracking
CREATE TABLE "ModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "learnLayerCompleted" BOOLEAN NOT NULL DEFAULT false,
    "applyLayerCompleted" BOOLEAN NOT NULL DEFAULT false,
    "engageLiveLayerCompleted" BOOLEAN NOT NULL DEFAULT false,
    "progressPercentage" FLOAT NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ModuleProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE,
    CONSTRAINT "ModuleProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX "Activity_courseId_idx" ON "Activity"("courseId");
CREATE INDEX "Activity_moduleId_idx" ON "Activity"("moduleId");
CREATE INDEX "Activity_lessonId_idx" ON "Activity"("lessonId");
CREATE UNIQUE INDEX "ActivitySubmission_activityId_userId_key" ON "ActivitySubmission"("activityId", "userId");
CREATE INDEX "ActivitySubmission_activityId_idx" ON "ActivitySubmission"("activityId");
CREATE INDEX "ActivitySubmission_userId_idx" ON "ActivitySubmission"("userId");
CREATE INDEX "LiveSession_courseId_idx" ON "LiveSession"("courseId");
CREATE INDEX "LiveSession_facilitatorId_idx" ON "LiveSession"("facilitatorId");
CREATE INDEX "LiveSessionAttendance_sessionId_idx" ON "LiveSessionAttendance"("sessionId");
CREATE INDEX "LiveSessionAttendance_userId_idx" ON "LiveSessionAttendance"("userId");
CREATE UNIQUE INDEX "ModuleProgress_moduleId_enrollmentId_key" ON "ModuleProgress"("moduleId", "enrollmentId");
