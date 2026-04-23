-- CreateEnum for CurriculumLevel
CREATE TYPE "CurriculumLevel" AS ENUM ('PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY', 'IMPACTUNI');

-- CreateEnum for SubscriptionStatus
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum for SubscriptionTierType
CREATE TYPE "SubscriptionTierType" AS ENUM ('INDIVIDUAL_BASIC', 'INDIVIDUAL_PREMIUM', 'SCHOOL_STARTER', 'SCHOOL_GROWTH', 'SCHOOL_ENTERPRISE', 'INSTITUTIONAL_PARTNER', 'UNIVERSITY_CAMPUS');

-- CreateEnum for DayOfWeek
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable CurriculumFramework
CREATE TABLE "CurriculumFramework" (
    "id" TEXT NOT NULL,
    "level" "CurriculumLevel" NOT NULL,
    "name" TEXT NOT NULL,
    "signatureShift" TEXT NOT NULL,
    "primaryOutcome" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable CurriculumModule
CREATE TABLE "CurriculumModule" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable ContentMetadata
CREATE TABLE "ContentMetadata" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "curriculumLevel" "CurriculumLevel",
    "learningObjectives" TEXT[],
    "keyCompetencies" TEXT[],
    "prerequisites" TEXT[],
    "estimatedDuration" INTEGER,
    "difficulty" TEXT,
    "tags" TEXT[],
    "description" TEXT,
    "assessmentType" TEXT,
    "assessmentRubric" TEXT,
    "successCriteria" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable SubscriptionPlan
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "tierType" "SubscriptionTierType" NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPrice" DOUBLE PRECISION,
    "yearlyPrice" DOUBLE PRECISION,
    "features" JSONB,
    "maxUsers" INTEGER,
    "canAccessAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "canManageFacilitators" BOOLEAN NOT NULL DEFAULT false,
    "canIntegrateSIS" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable Subscription
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "schoolName" TEXT,
    "schoolAdminIds" TEXT[],
    "activeUsers" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable WeeklyLearningSchedule
CREATE TABLE "WeeklyLearningSchedule" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "mondayLessonId" TEXT,
    "mondayLessonType" TEXT NOT NULL DEFAULT 'EXPLAINER_VIDEO',
    "tuesdayActivityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tuesdayTheme" TEXT,
    "wednesdayLiveSessionId" TEXT,
    "thursdayWorkshopId" TEXT,
    "fridayAssessmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fridayQuizId" TEXT,
    "weekendActivityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weekendReplayUrl" TEXT,
    "familyEngagementPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyLearningSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumFramework_level_key" ON "CurriculumFramework"("level");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_tierType_key" ON "SubscriptionPlan"("tierType");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyLearningSchedule_moduleId_weekNumber_key" ON "WeeklyLearningSchedule"("moduleId", "weekNumber");

-- AddForeignKey
ALTER TABLE "CurriculumModule" ADD CONSTRAINT "CurriculumModule_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "CurriculumFramework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyLearningSchedule" ADD CONSTRAINT "WeeklyLearningSchedule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update existing User model to add subscriptions relation (if not already present)
-- AddForeignKey for User.subscriptions would go here

-- Update existing Module model to add weeklySchedules relation (if not already present)
-- This is handled through the WeeklyLearningSchedule FK above

-- Update existing Lesson model to add curriculumModule relation (if not already present)
-- ALTER TABLE "Lesson" ADD COLUMN "curriculumModuleId" TEXT;
-- ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_curriculumModuleId_fkey" FOREIGN KEY ("curriculumModuleId") REFERENCES "CurriculumModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
