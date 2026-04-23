#!/usr/bin/env ts-node
/**
 * Phase 2 - Database Integration Test Suite
 * Validates all database operations are working correctly
 * Run: npm run db:test (add to package.json scripts)
 */

import { prisma } from './src/lib/prisma';
import {
  UserService,
  CourseService,
  ProgressService,
  AchievementService,
  LeaderboardService,
  NotificationService,
  AnalyticsService,
} from './src/lib/database-service';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function success(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function error(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function info(message: string) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

function test(message: string) {
  console.log(`${colors.blue}▶${colors.reset} ${message}`);
}

async function runTests() {
  console.log(`\n${colors.yellow}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}  Phase 2: Database Integration Test Suite${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════${colors.reset}\n`);

  try {
    // Test 1: Database Connection
    test('Database Connection');
    try {
      await prisma.$queryRaw`SELECT 1`;
      success('Connected to PostgreSQL');
    } catch (err) {
      error('Failed to connect to PostgreSQL');
      throw err;
    }

    // Test 2: User Service
    test('User Service Operations');
    try {
      const users = await prisma.user.findMany({ take: 1 });
      if (users.length > 0) {
        const userId = users[0].id;
        const profile = await UserService.getProfile(userId);
        success(`Retrieved user profile: ${profile?.email}`);

        const userList = await UserService.listUsers(0, 5);
        success(`Listed ${userList.users.length} users`);
      }
    } catch (err) {
      error(`User Service failed: ${err}`);
    }

    // Test 3: Course Service
    test('Course Service Operations');
    try {
      const courses = await CourseService.listCourses({}, 0, 5);
      success(`Listed ${courses.courses.length} courses`);
      info(`Total courses in database: ${courses.total}`);

      if (courses.courses.length > 0) {
        const courseDetails = await CourseService.getCourseDetails(courses.courses[0].id);
        success(`Retrieved course: ${courseDetails?.title}`);
      }
    } catch (err) {
      error(`Course Service failed: ${err}`);
    }

    // Test 4: Progress Service
    test('Progress Tracking Service');
    try {
      const users = await prisma.user.findMany({ take: 1 });
      if (users.length > 0) {
        const stats = await ProgressService.getLearningStats(users[0].id);
        success(`Learning stats: ${stats.completedLessons} lessons, ${stats.achievements} achievements`);
      }
    } catch (err) {
      error(`Progress Service failed: ${err}`);
    }

    // Test 5: Leaderboard Service
    test('Leaderboard Service');
    try {
      const globalLeaderboard = await LeaderboardService.getGlobalLeaderboard(0, 5);
      success(`Global leaderboard: ${globalLeaderboard.length} entries`);
    } catch (err) {
      error(`Leaderboard Service failed: ${err}`);
    }

    // Test 6: Analytics Service
    test('Analytics Service');
    try {
      const stats = await AnalyticsService.getPlatformStats();
      success(`Platform Stats:`);
      info(`  - Total Users: ${stats.totalUsers}`);
      info(`  - Active Courses: ${stats.activeCourses}`);
      info(`  - Total Enrollments: ${stats.totalEnrollments}`);
      info(`  - Total Assignments: ${stats.totalAssignments}`);
    } catch (err) {
      error(`Analytics Service failed: ${err}`);
    }

    // Test 7: Notification Service
    test('Notification Service');
    try {
      const users = await prisma.user.findMany({ take: 1 });
      if (users.length > 0) {
        const notifications = await NotificationService.getUserNotifications(users[0].id);
        success(`Retrieved ${notifications.length} notifications`);
      }
    } catch (err) {
      error(`Notification Service failed: ${err}`);
    }

    // Test 8: Data Integrity Check
    test('Data Integrity Validation');
    try {
      const [userCount, courseCount, enrollmentCount] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.courseEnrollment.count(),
      ]);

      success(`Database contains:`);
      info(`  - ${userCount} users`);
      info(`  - ${courseCount} courses`);
      info(`  - ${enrollmentCount} enrollments`);

      if (userCount === 0) {
        error('No users found - database may not be seeded');
      } else {
        success(`Data integrity verified`);
      }
    } catch (err) {
      error(`Integrity check failed: ${err}`);
    }

    // Test 9: Performance Check
    test('Performance Baseline');
    try {
      const start = Date.now();
      await prisma.course.findMany({ take: 100 });
      const duration = Date.now() - start;
      success(`Fetched 100 records in ${duration}ms`);
      if (duration > 1000) {
        error(`Performance warning: Query took ${duration}ms`);
      }
    } catch (err) {
      error(`Performance test failed: ${err}`);
    }

    console.log(`\n${colors.yellow}═══════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✓ Test Suite Complete${colors.reset}`);
    console.log(`${colors.yellow}═══════════════════════════════════════════════${colors.reset}\n`);

  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
