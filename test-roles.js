const fetch = require('node-fetch');

const testUsers = [
  { email: 'student@test.com', firstName: 'Test', lastName: 'Student', role: 'STUDENT', password: 'ImpactEdu2026!Secure' },
  { email: 'admin@test.com', firstName: 'Test', lastName: 'Admin', role: 'ADMIN', password: 'ImpactEdu2026!Secure' },
  { email: 'facilitator@test.com', firstName: 'Test', lastName: 'Facilitator', role: 'FACILITATOR', password: 'ImpactEdu2026!Secure' },
  { email: 'mentor@test.com', firstName: 'Test', lastName: 'Mentor', role: 'MENTOR', password: 'ImpactEdu2026!Secure' },
  { email: 'parent@test.com', firstName: 'Test', lastName: 'Parent', role: 'PARENT', password: 'ImpactEdu2026!Secure' },
  { email: 'schooladmin@test.com', firstName: 'Test', lastName: 'SchoolAdmin', role: 'SCHOOL_ADMIN', password: 'ImpactEdu2026!Secure' },
  { email: 'circlemember@test.com', firstName: 'Test', lastName: 'CircleMember', role: 'CIRCLE_MEMBER', password: 'ImpactEdu2026!Secure' },
];

async function registerUser(user) {
  try {
    console.log(`\n📝 Registering ${user.role}: ${user.email}`);

    const response = await fetch('http://localhost:3002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        confirmPassword: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: '+2347000000000',
        state: 'Lagos',
        institution: 'Test Institute',
        agreeToTerms: true,
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${user.role} registered successfully`);
      return { success: true, user: data.user };
    } else {
      console.log(`❌ ${user.role} registration failed:`, data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error(`❌ Error registering ${user.role}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testAllRoles() {
  console.log('🚀 Testing ImpactEdu Role-Based Dashboards\n');

  for (const user of testUsers) {
    await registerUser(user);
  }

  console.log('\n🎯 All test users registered!');
  console.log('\n📋 Test Credentials:');
  testUsers.forEach(user => {
    console.log(`${user.role.padEnd(12)}: ${user.email} / ${user.password}`);
  });

  console.log('\n🔗 Login URL: http://localhost:3002/auth/login');
  console.log('📊 Test each role by logging in with the credentials above');
}

testAllRoles();