# Database Migration Setup Guide

## Overview

This guide walks through setting up Prisma database migrations for the ImpactApp platform using PostgreSQL.

## Prerequisites

- Node.js 16+ installed
- PostgreSQL database instance (local or cloud)
- Prisma installed: `npm install @prisma/client prisma`
- `.env.local` file with DATABASE_URL

## Step 1: Environment Configuration

### Set Up Database Connection

Create `.env.local`:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/impactapp_dev"

# For production
# DATABASE_URL="postgresql://username:password@your-prod-host:5432/impactapp_prod"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Other services
SENTRY_AUTH_TOKEN="your-token"
FLUTTERWAVE_PUBLIC_KEY="your-key"
FLUTTERWAVE_SECRET_KEY="your-secret"
FIREBASE_API_KEY="your-key"
```

### PostgreSQL Setup (Local)

```bash
# On Windows (PowerShell)
# 1. Install PostgreSQL from https://www.postgresql.org/download/windows/

# 2. Start PostgreSQL service
Start-Service -Name postgresql

# 3. Create database
psql -U postgres -c "CREATE DATABASE impactapp_dev;"

# 4. Verify connection
psql -U postgres -d impactapp_dev -c "SELECT 1"
```

### PostgreSQL Setup (macOS)

```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb impactapp_dev

# Verify
psql -d impactapp_dev -c "SELECT 1"
```

### PostgreSQL Setup (Linux)

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb impactapp_dev

# Verify
sudo -u postgres psql -d impactapp_dev -c "SELECT 1"
```

## Step 2: Prisma Schema Setup

### Copy Schema File

The database schema is already created at `DATABASE_SCHEMA.prisma`. Copy it to the proper location:

```bash
# From workspace root
copy DATABASE_SCHEMA.prisma prisma/schema.prisma
# or on Linux/macOS
cp DATABASE_SCHEMA.prisma prisma/schema.prisma
```

### Review Schema

```bash
# View schema
cat prisma/schema.prisma

# Current schema includes:
# - User and authentication models
# - Student, Parent, Facilitator, Admin profiles
# - Course and learning management
# - Assignments and grades
# - Projects and portfolio
# - Weekly rhythm scheduling
# - Notifications and messaging
# - Analytics and alerts
# - 30+ models with proper relationships
```

## Step 3: Initialize Prisma

### First Time Setup

```bash
# Generate Prisma Client
npx prisma generate

# This creates:
# - node_modules/.prisma/client/
# - Type definitions for all models
# - Query building utilities
```

### Verify Schema

```bash
# Check for schema errors
npx prisma validate

# Output should indicate: "Environment variables loaded from .env.local"
# And if schema is valid: No errors found!
```

## Step 4: Create Initial Migration

### Create Migration Files

```bash
# Compare schema to database and create migration
npx prisma migrate dev --name init

# This will:
# 1. Create migration file: prisma/migrations/[timestamp]_init/migration.sql
# 2. Apply migration to database
# 3. Generate Prisma Client
# 4. Create/update prisma/.prisma/client dependencies

# You'll be prompted to confirm creating the database if needed
# Output should show: "0 warnings"
```

### Verify Migration Created

```bash
# Check migrations folder
ls prisma/migrations/

# Should show: [timestamp]_init/migration.sql

# View the generated SQL
cat "prisma/migrations/[timestamp]_init/migration.sql"

# This should contain CREATE TABLE statements for all models
```

## Step 5: Seed Database (Optional)

### Create Seed File

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create test school
  const school = await prisma.school.create({
    data: {
      name: "Central High School",
      code: "CHS-001",
      location: "123 Main Street",
      phone: "555-0123",
      email: "contact@central-high.edu",
      established: new Date("2010-01-01"),
      settings: {
        create: {
          academicYear: "2025-2026",
          maxStudentsPerCourse: 30,
          dayStartTime: "08:00",
          dayEndTime: "16:00",
          timezone: "America/New_York",
        },
      },
    },
  });

  // Create test users
  const teacher = await prisma.user.create({
    data: {
      email: "teacher@school.edu",
      name: "Dr. Sarah Wilson",
      role: "FACILITATOR",
      schoolId: school.id,
      facilitatorProfile: {
        create: {
          department: "Mathematics",
          qualification: "PhD Mathematics",
          specialization: ["Algebra", "Calculus"],
          officeHours: "Mon & Wed 3-5 PM",
        },
      },
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@school.edu",
      name: "Alex Johnson",
      role: "STUDENT",
      schoolId: school.id,
      studentProfile: {
        create: {
          grade: "Grade 10",
          enrollmentDate: new Date(),
          status: "ACTIVE",
          preferredLanguage: "English",
        },
      },
    },
  });

  const parent = await prisma.user.create({
    data: {
      email: "parent@email.com",
      name: "Robert Johnson",
      role: "PARENT",
      schoolId: school.id,
      parentProfile: {
        create: {
          phone: "555-0456",
          relationship: "Father",
        },
      },
    },
  });

  // Create test course
  const course = await prisma.course.create({
    data: {
      name: "Advanced Mathematics 101",
      code: "MATH-101",
      slug: "advanced-mathematics-101",
      description: "Advanced mathematical concepts",
      facilitatorId: teacher.id,
      schoolId: school.id,
      difficulty: "Advanced",
      duration: 12,
      capacity: 30,
      credits: 4,
      status: "ACTIVE",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-05-15"),
      modules: {
        create: [
          {
            name: "Algebra Fundamentals",
            description: "Core algebra concepts",
            type: "THEORY",
            order: 1,
            duration: 2,
          },
        ],
      },
    },
  });

  // Enroll student in course
  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      enrollmentDate: new Date(),
      status: "ACTIVE",
      progress: {
        create: {
          enrollmentId: undefined, // Will be set automatically
          coursesCompleted: 0,
          moduleProgress: 25,
          hoursSpent: 12.5,
          lastAccess: new Date(),
        },
      },
    },
  });

  // Create achievement
  await prisma.achievement.create({
    data: {
      title: "Quiz Master",
      description: "Scored 100% on 10 quizzes",
      icon: "🎯",
      category: "KNOWLEDGE",
      points: 50,
      requirement: "10_consecutive_perfect_scores",
    },
  });

  console.log("✓ Database seeded successfully!");
  console.log(`✓ School: ${school.name}`);
  console.log(`✓ Users: 1 teacher, 1 student, 1 parent`);
  console.log(`✓ Course: ${course.name}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### Update package.json

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"commonjs\"} prisma/seed.ts"
  }
}
```

### Run Seed

```bash
npx prisma db seed

# Output:
# ✓ Database seeded successfully!
# ✓ School: Central High School
# ✓ Users: 1 teacher, 1 student, 1 parent
# ✓ Course: Advanced Mathematics 101
```

## Step 6: Verify Database

### Connect to Database

```bash
# Using psql
psql -U postgres -d impactapp_dev

# Or using Prisma Studio (visual interface)
npx prisma studio

# This opens http://localhost:5555 with visual database browser
```

### Check Created Tables

```sql
-- View all tables
\dt

-- Should show:
-- - User
-- - School
-- - StudentProfile
-- - ParentProfile
-- - FacilitatorProfile
-- - AdminProfile
-- - Course
-- - Module
-- - Lesson
-- - Resource
-- - Enrollment
-- - CourseProgress
-- - Assignment
-- - Submission
-- - Achievement
-- - LeaderboardEntry
-- - StudentProject
-- - ProjectFile
-- - ProjectFeedback
-- - RubricScore
-- - PeerReview
-- - WeeklyRhythm
-- - DaySchedule
-- - LearningSession
-- - SessionResource
-- - Notification
-- - Message
-- - Announcement
-- - SchoolAnalytics
-- - AlertNotification
-- - And more...

-- Check user data
SELECT id, name, role, email FROM "User" LIMIT 5;

-- Check enrollment
SELECT s.name as student, c.name as course FROM "Enrollment" e
JOIN "User" s ON e."studentId" = s.id
JOIN "Course" c ON e."courseId" = c.id;
```

## Step 7: Update API Handlers

### Import Prisma Client

```typescript
// src/lib/prisma.ts - Singleton instance
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as typeof globalThis & {
  prisma: PrismaClient | undefined,
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Update Dashboard API

```typescript
// src/app/api/dashboard/student/route.ts
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult instanceof NextResponse) return authResult;

  const student = await prisma.user.findUnique({
    where: { id: authResult.user.id },
    include: {
      studentProfile: true,
      enrollments: {
        include: {
          course: { include: { facilitator: true } },
          progress: true,
        },
        take: 6,
      },
      submissions: {
        include: { assignment: { include: { course: true } } },
        take: 5,
        orderBy: { submittedDate: "desc" },
      },
      achievements: true,
      leaderboardEntries: {
        include: { user: true },
        take: 10,
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      student,
      // Format data for frontend...
    },
  });
}
```

## Step 8: Migration Management

### Subsequent Migrations

When you modify `prisma/schema.prisma`:

```bash
# View pending changes
npx prisma migrate dev

# This will:
# 1. Detect schema changes
# 2. Create new migration file
# 3. Apply migration
# 4. Confirm changes

# Give migration a descriptive name when prompted:
# Example: "add_project_files_table"
```

### Reset Database (Development Only)

```bash
# WARNING: This deletes all data!
npx prisma migrate reset

# This will:
# 1. Drop database
# 2. Recreate from migrations
# 3. Run seed script

# Result: Clean database with test data
```

### Production Deployments

```bash
# On production server:
# 1. Run migrations without seeding
npx prisma migrate deploy

# 2. Verify migration success
npx prisma migrate status

# 3. Check for conflicts
npx prisma migrate diff --from-migrations ./prisma/migrations
```

## Step 9: Database Optimization

### Add Indexes

```postgresql
-- Create indexes for frequently queried fields
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_enrollment_studentid ON "Enrollment"("studentId");
CREATE INDEX idx_enrollment_courseid ON "Enrollment"("courseId");
CREATE INDEX idx_submission_studentid ON "Submission"("studentId");
CREATE INDEX idx_assignment_courseid ON "Assignment"("courseId");
CREATE INDEX idx_project_studentid ON "StudentProject"("studentId");

-- View indexes
\di+
```

### Backup Database

```bash
# PostgreSQL backup
pg_dump -U postgres impactapp_dev > backup_impactapp_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres impactapp_dev < backup_impactapp_20260421.sql
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql -U postgres -h localhost -d impactapp_dev -c "SELECT 1"

# If fails:
# 1. Verify PostgreSQL is running
# 2. Check DATABASE_URL in .env.local
# 3. Verify database exists

# On Windows
Get-Service postgresql* | Start-Service

# On macOS
brew services start postgresql@14

# On Linux
sudo systemctl start postgresql
```

### Migration Conflicts

```bash
# If migration fails:
npx prisma migrate resolve --rolled-back init

# Reset and restart
npx prisma migrate reset --force
```

### Schema Validation

```bash
# Check schema for errors
npx prisma validate

# Generate diagrams
npx prisma generate --schema=prisma/schema.prisma
```

## Quick Start Summary

```bash
# 1. Set up environment
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/impactapp_dev"' > .env.local

# 2. Create PostgreSQL database
createdb impactapp_dev

# 3. Copy schema
cp DATABASE_SCHEMA.prisma prisma/schema.prisma

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed database (optional)
npx prisma db seed

# 6. Open database explorer
npx prisma studio

# 7. Start application
npm run dev

# Application now runs with full database backing!
```

## Next Steps

1. ✅ Database migration configured
2. Update API handlers to query Prisma (see step 7)
3. Add input validation to routes
4. Implement error handling
5. Add logging and monitoring
6. Write integration tests
7. Performance optimization
8. Production deployment

Your database is now ready for the ImpactApp platform!
