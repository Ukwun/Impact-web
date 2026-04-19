require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== DATABASE STATUS CHECK ===\n');
    
    // Check total user count
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);
    
    // List all users
    const users = await prisma.user.findMany({ 
      select: { 
        id: true, 
        email: true, 
        role: true, 
        firstName: true, 
        lastName: true, 
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    if (users.length === 0) {
      console.log('\nNo users in database yet.');
      console.log('You need to:');
      console.log('1. Sign up a new user at http://localhost:3000/auth/signup');
      console.log('2. User will be created in PostgreSQL with password hash');
      console.log('3. Then test the role-based dashboards\n');
    } else {
      console.log('\nExisting users:');
      users.forEach(u => {
        const created = new Date(u.createdAt).toLocaleDateString();
        console.log(`  • ${u.email} (${u.role}) - ${u.firstName} ${u.lastName} - Created: ${created}`);
      });
    }
    
    // Check enrollments
    const enrollmentCount = await prisma.enrollment.count();
    console.log(`\nEnrollments in database: ${enrollmentCount}`);
    
    if (enrollmentCount > 0) {
      const enrollments = await prisma.enrollment.findMany({
        select: {
          id: true,
          user: { select: { email: true } },
          course: { select: { title: true } },
          status: true,
          enrolledAt: true
        },
        take: 5
      });
      console.log('Sample enrollments:');
      enrollments.forEach(e => {
        console.log(`  • ${e.user.email} -> ${e.course.title} (${e.status})`);
      });
    }
    
    // Check courses
    const courseCount = await prisma.course.count();
    console.log(`\nCourses in database: ${courseCount}`);
    
  } catch (error) {
    console.error('Error checking database:', error.message);
    if (error.code === 'P1000') {
      console.error('\n⚠️ Cannot connect to PostgreSQL database!');
      console.error('Check DATABASE_URL in .env.local');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
