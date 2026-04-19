require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TestRoles = [
  { email: 'student@test.local', firstName: 'Sarah', lastName: 'Student', role: 'STUDENT' },
  { email: 'parent@test.local', firstName: 'Paul', lastName: 'Parent', role: 'PARENT' },
  { email: 'facilitator@test.local', firstName: 'Fiona', lastName: 'Facilitator', role: 'FACILITATOR' },
  { email: 'schooladmin@test.local', firstName: 'Sandra', lastName: 'SchoolAdmin', role: 'SCHOOL_ADMIN' },
  { email: 'admin@test.local', firstName: 'Amy', lastName: 'Admin', role: 'ADMIN' },
  { email: 'mentor@test.local', firstName: 'Marcus', lastName: 'Mentor', role: 'MENTOR' },
  { email: 'circlemember@test.local', firstName: 'Chris', lastName: 'CircleMember', role: 'CIRCLE_MEMBER' },
  { email: 'unimember@test.local', firstName: 'Ursula', lastName: 'UniMember', role: 'UNIVERSITY_MEMBER' },
];

async function createTestUsers() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   CREATING TEST USERS IN POSTGRESQL DATABASE          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const TestPassword = 'TestPassword@123!';
  const passwordHash = await bcrypt.hash(TestPassword, 10);
  
  let createCount = 0;
  let skipCount = 0;

  for (let i = 0; i < TestRoles.length; i++) {
    const user = TestRoles[i];
    const num = i + 1;
    
    process.stdout.write(`[${num}/8] Creating ${user.role.padEnd(18)} (${user.email})... `);

    try {
      // Try to find existing user first
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existing) {
        console.log(`\x1b[33m⚠️  Already exists (ID: ${existing.id})\x1b[0m`);
        skipCount++;
      } else {
        // Create new user
        const created = await prisma.user.create({
          data: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            passwordHash: passwordHash,
            phone: '555-1234',
            state: 'Lagos',
            institution: 'Test Institution',
            verified: true,
            emailVerified: true,
            isActive: true,
          },
        });

        console.log(`\x1b[32m✅ Created\x1b[0m (ID: ${created.id})`);
        createCount++;
      }
    } catch (error) {
      console.log(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log(`New Users Created:  ${createCount}`);
  console.log(`Existing Users:     ${skipCount}`);
  console.log(`Total in Database:  ${createCount + skipCount}`);

  console.log('\n🔐 Test Credentials:');
  console.log(`  Password: ${TestPassword}`);

  console.log('\n📋 Test Users Created:');
  TestRoles.forEach(u => {
    console.log(`  • ${u.role.padEnd(20)} → ${u.email}`);
  });

  // Verify they're in the database
  console.log('\n✅ Verifying users in database...\n');
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        in: TestRoles.map(u => u.email),
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  console.log(`Found ${allUsers.length} users in PostgreSQL:\n`);
  allUsers.forEach(u => {
    console.log(`  ✔ ${u.email.padEnd(25)} - ${u.role.padEnd(18)} - ${u.firstName} ${u.lastName}`);
  });

  console.log('\n🎯 Next Steps:');
  console.log('1. Generate JWT tokens for each user');
  console.log('2. Test endpoints with authenticated requests');
  console.log('3. Create test enrollments for dashboard data\n');

  await prisma.$disconnect();
}

createTestUsers().catch(error => {
  console.error('Failed:', error);
  process.exit(1);
});
