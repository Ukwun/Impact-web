-- CreateEnum for MembershipTierType
CREATE TYPE "MembershipTierType" AS ENUM ('STUDENT_MEMBER', 'CAMPUS_MEMBER', 'YOUNG_PROFESSIONAL_MEMBER', 'MENTOR_FACULTY_MEMBER', 'CHAPTER_LEAD_AMBASSADOR', 'INSTITUTIONAL_PARTNER');

-- CreateEnum for MembershipStatus
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED');

-- CreateTable MembershipTier
CREATE TABLE "MembershipTier" (
    "id" TEXT NOT NULL,
    "tierType" "MembershipTierType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "canAccessLearning" BOOLEAN NOT NULL DEFAULT true,
    "canParticipateEvents" BOOLEAN NOT NULL DEFAULT true,
    "canAccessCommunity" BOOLEAN NOT NULL DEFAULT true,
    "canAccessMentorship" BOOLEAN NOT NULL DEFAULT false,
    "canCreateContent" BOOLEAN NOT NULL DEFAULT false,
    "canManageChapter" BOOLEAN NOT NULL DEFAULT false,
    "maxCoursesAccess" INTEGER,
    "maxEventsAccess" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipTier_pkey" PRIMARY KEY ("id")
);

-- Add columns to User table
ALTER TABLE "User" ADD COLUMN "membershipTierId" TEXT;
ALTER TABLE "User" ADD COLUMN "membershipStatus" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "membershipJoinedAt" TIMESTAMP(3);

-- Add missing columns that were in the schema drift
ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "location" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "emailVerificationToken" TEXT;

-- Add foreign key constraint
ALTER TABLE "User" ADD CONSTRAINT "User_membershipTierId_fkey" FOREIGN KEY ("membershipTierId") REFERENCES "MembershipTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE UNIQUE INDEX "MembershipTier_tierType_key" ON "MembershipTier"("tierType");
CREATE INDEX "User_membershipTierId_idx" ON "User"("membershipTierId");
CREATE INDEX "User_membershipStatus_idx" ON "User"("membershipStatus");

-- Insert default membership tiers
INSERT INTO "MembershipTier" ("id", "tierType", "name", "description", "canAccessLearning", "canParticipateEvents", "canAccessCommunity", "canAccessMentorship", "canCreateContent", "canManageChapter", "createdAt", "updatedAt") VALUES
  ('tier_student', 'STUDENT_MEMBER', 'Student Member', 'For learners beginning their journey', true, true, true, false, false, false, NOW(), NOW()),
  ('tier_campus', 'CAMPUS_MEMBER', 'Campus Member', 'For university students and scholars', true, true, true, true, false, false, NOW(), NOW()),
  ('tier_professional', 'YOUNG_PROFESSIONAL_MEMBER', 'Young Professional Member', 'For professionals in early career', true, true, true, true, false, false, NOW(), NOW()),
  ('tier_mentor', 'MENTOR_FACULTY_MEMBER', 'Mentor / Faculty Member', 'For educators and industry experts', true, true, true, true, true, false, NOW(), NOW()),
  ('tier_leader', 'CHAPTER_LEAD_AMBASSADOR', 'Chapter Lead / Ambassador', 'For community organizers and leaders', true, true, true, true, true, true, NOW(), NOW()),
  ('tier_partner', 'INSTITUTIONAL_PARTNER', 'Institutional Partner', 'For schools, universities, and organizations', true, true, true, true, true, true, NOW(), NOW());
