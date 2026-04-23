const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const JWT_SECRET = 'your_super_secret_jwt_key_min_32_characters_required_here_123456';
const prisma = new PrismaClient();

async function createTestFacilitator() {
  try {
    // Create or get a test facilitator user
    const testFacilitator = await prisma.user.upsert({
      where: { email: 'test-facilitator@impact.com' },
      update: {},
      create: {
        id: 'test-facilitator-123',
        email: 'test-facilitator@impact.com',
        firstName: 'Test',
        lastName: 'Facilitator',
        phone: '+1234567890',
        passwordHash: 'hashed_password',
        role: 'FACILITATOR',
        state: 'Test State',
        location: 'Test Location',
        institution: 'Test School',
        verified: true,
      },
    });

    console.log('✅ Test facilitator created/retrieved:', testFacilitator.id);

    // Create JWT token with real user ID
    const payload = {
      sub: testFacilitator.id,
      email: testFacilitator.email,
      role: 'FACILITATOR',
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    console.log('\n🧪 Testing Facilitator Classroom APIs\n');
    console.log('Facilitator ID:', testFacilitator.id);
    console.log('Token:', token.substring(0, 40) + '...\n');

    // 1. Create a classroom
    console.log('1️⃣ Creating classroom...');
    const createRes = await fetch('http://localhost:3001/api/facilitator/classroom', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Financial Literacy for Teens',
        description: 'A comprehensive 4-week course on money management',
        difficulty: 'BEGINNER',
        language: 'English',
        ageGroup: '12-14',
        subjectStrand: 'Financial Literacy',
      }),
    });

    const createData = await createRes.json();
    console.log('Response Status:', createRes.status);
    console.log('Response:', createData.success ? '✅ Success' : '❌ Failed');
    
    if (!createData.success) {
      console.error('Error:', createData.error);
      return;
    }

    const classroomId = createData.data.id;
    console.log('Created Classroom ID:', classroomId, '\n');

    // 2. Get all classrooms
    console.log('2️⃣ Fetching all classrooms...');
    const listRes = await fetch('http://localhost:3001/api/facilitator/classroom', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const listData = await listRes.json();
    console.log('Response:', listData.success ? `✅ Found ${listData.data.length} classroom(s)` : '❌ Failed');
    if (listData.data.length > 0) {
      console.log('First Classroom:', listData.data[0]?.title);
    }
    console.log();

    // 3. Create a module
    console.log('3️⃣ Creating module...');
    const moduleRes = await fetch(
      `http://localhost:3001/api/facilitator/classroom/${classroomId}/modules`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Week 1: Budgeting Basics',
          description: 'Learn the fundamentals of personal budgeting',
          order: 1,
          ageGroup: '12-14',
          subjectStrand: 'Financial Literacy',
          estimatedWeeks: 1,
        }),
      }
    );

    const moduleData = await moduleRes.json();
    console.log('Response Status:', moduleRes.status);
    console.log('Response:', moduleData.success ? '✅ Success' : '❌ Failed');
    
    if (!moduleData.success) {
      console.error('Error:', moduleData.error);
      return;
    }

    const moduleId = moduleData.data.id;
    console.log('Created Module ID:', moduleId, '\n');

    // 4. Create a lesson (LEARN layer)
    console.log('4️⃣ Creating LEARN layer lesson...');
    const lessonRes = await fetch(
      `http://localhost:3001/api/facilitator/classroom/${classroomId}/modules/${moduleId}/lessons`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Introduction to Budgeting',
          description: 'Watch this video to understand budgeting principles',
          learningLayer: 'LEARN',
          videoUrl: 'https://example.com/budgeting-101.mp4',
          duration: 15,
          learningObjectives: [
            'Understand what a budget is',
            'Learn the importance of tracking income and expenses',
          ],
          facilitatorNotes: 'This video is interactive. Pause at minute 8 for discussion.',
        }),
      }
    );

    const lessonData = await lessonRes.json();
    console.log('Response Status:', lessonRes.status);
    console.log('Response:', lessonData.success ? '✅ Success' : '❌ Failed');
    console.log('Created Lesson:', lessonData.data?.title, '\n');

    // 5. Create an activity (APPLY layer)
    console.log('5️⃣ Creating APPLY layer activity...');
    const activityRes = await fetch(
      `http://localhost:3001/api/facilitator/classroom/${classroomId}/activities`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          title: 'Create Your First Budget',
          description: 'Apply what you learned by creating a realistic monthly budget',
          activityType: 'TASK',
          instructions: 'List your income sources and all monthly expenses, then calculate your net income.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          maxPoints: 100,
        }),
      }
    );

    const activityData = await activityRes.json();
    console.log('Response Status:', activityRes.status);
    console.log('Response:', activityData.success ? '✅ Success' : '❌ Failed');
    console.log('Created Activity:', activityData.data?.title, '\n');

    // 6. Get classroom details with all content
    console.log('6️⃣ Fetching classroom details...');
    const detailRes = await fetch(
      `http://localhost:3001/api/facilitator/classroom/${classroomId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const detailData = await detailRes.json();
    console.log('Response Status:', detailRes.status);
    console.log('Response:', detailData.success ? '✅ Success' : '❌ Failed');
    if (detailData.success) {
      console.log('Modules in classroom:', detailData.data.modules.length);
      if (detailData.data.modules.length > 0) {
        console.log('First module lessons:', detailData.data.modules[0]?.lessons.length);
      }
      console.log('Students enrolled:', detailData.data.enrollments.length);
    }

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestFacilitator();
