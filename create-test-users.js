const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3002';

// Test users for each role
const TestUsers = [
  { email: 'student@test.impactapp.com', firstName: 'Sarah', lastName: 'Student', role: 'STUDENT', endpoint: '/api/progress' },
  { email: 'parent@test.impactapp.com', firstName: 'Paul', lastName: 'Parent', role: 'PARENT', endpoint: '/api/parent-child' },
  { email: 'facilitator@test.impactapp.com', firstName: 'Fiona', lastName: 'Facilitator', role: 'FACILITATOR', endpoint: '/api/facilitator/classes' },
  { email: 'schooladmin@test.impactapp.com', firstName: 'Sandra', lastName: 'SchoolAdmin', role: 'SCHOOL_ADMIN', endpoint: '/api/admin/school' },
  { email: 'admin@test.impactapp.com', firstName: 'Amy', lastName: 'Admin', role: 'ADMIN', endpoint: '/api/admin/dashboard' },
  { email: 'mentor@test.impactapp.com', firstName: 'Marcus', lastName: 'Mentor', role: 'MENTOR', endpoint: '/api/mentor/sessions' },
  { email: 'circlemember@test.impactapp.com', firstName: 'Chris', lastName: 'CircleMember', role: 'CIRCLE_MEMBER', endpoint: '/api/circle-member' },
  { email: 'unimember@test.impactapp.com', firstName: 'Ursula', lastName: 'UniMember', role: 'UNIVERSITY_MEMBER', endpoint: '/api/university/profile' },
];

const TestPassword = 'TestPassword@123!';

function makeRequest(url, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ImpactApp-Test/1.0',
        ...headers,
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            json: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            json: null,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function signupUser(user) {
  const signupData = {
    email: user.email,
    password: TestPassword,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role.toLowerCase(),
    phone: '555-1234',
    state: 'Lagos',
    institution: 'Test Institution',
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/register`, 'POST', signupData);
    
    if (response.status === 201 && response.json?.success) {
      return {
        success: true,
        user: response.json.user,
        token: response.json.token,
        error: null,
      };
    } else {
      return {
        success: false,
        user: null,
        token: null,
        error: response.json?.error || `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      user: null,
      token: null,
      error: error.message,
    };
  }
}

async function testDashboardWithAuth(user, token) {
  try {
    const response = await makeRequest(
      `${BASE_URL}${user.endpoint}`,
      'GET',
      null,
      { 'Authorization': `Bearer ${token}` }
    );
    
    return {
      endpoint: user.endpoint,
      status: response.status,
      success: response.status === 200 || response.status === 200,
      data: response.json,
    };
  } catch (error) {
    return {
      endpoint: user.endpoint,
      status: null,
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   CREATING TEST USERS & TESTING AUTHENTICATED ENDPOINTS       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const results = [];
  
  // Phase 1: Create users
  console.log('📝 PHASE 1: Creating test users for all 8 roles...\n');
  const createdUsers = [];
  
  for (let i = 0; i < TestUsers.length; i++) {
    const user = TestUsers[i];
    const num = i + 1;
    
    process.stdout.write(`[${num}/8] Creating ${user.role.padEnd(18)} (${user.email})... `);
    
    const signupResult = await signupUser(user);
    
    if (signupResult.success) {
      console.log(`\x1b[32m✅\x1b[0m`);
      createdUsers.push({
        ...user,
        userId: signupResult.user.id,
        token: signupResult.token,
      });
      results.push({
        role: user.role,
        signup: true,
        email: user.email,
        userId: signupResult.user.id,
      });
    } else {
      // If user already exists (409), try to use it with a valid token
      if (signupResult.error && (signupResult.error.includes('409') || signupResult.error.includes('already'))) {
        console.log(`\x1b[33m⚠️  Already exists\x1b[0m`);
        // For demo, we'll skip testing existing users
      } else {
        console.log(`\x1b[31m❌ ${signupResult.error}\x1b[0m`);
        console.log(`     Full error: ${JSON.stringify(signupResult)}`);
      }
      results.push({
        role: user.role,
        signup: false,
        email: user.email,
        error: signupResult.error,
      });
    }
  }

  // Phase 2: Test authenticated endpoints
  console.log('\n📊 PHASE 2: Testing authenticated dashboard endpoints...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const num = i + 1;
    
    process.stdout.write(`[${num}/${createdUsers.length}] Testing ${user.role.padEnd(18)} dashboard... `);
    
    const dashResult = await testDashboardWithAuth(user, user.token);
    
    if (dashResult.success) {
      console.log(`\x1b[32m✅ HTTP ${dashResult.status}\x1b[0m`);
      successCount++;
    } else {
      console.log(`\x1b[31m❌ HTTP ${dashResult.status || 'Error'}\x1b[0m`);
      failCount++;
    }
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                         SUMMARY                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Users Created:     ${createdUsers.length}/${TestUsers.length}`);
  console.log(`\x1b[32m✅ Dashboards OK:   ${successCount}\x1b[0m`);
  console.log(`\x1b[31m❌ Dashboards Failed: ${failCount}\x1b[0m`);

  console.log('\n📋 Created Users:');
  createdUsers.forEach(u => {
    console.log(`  • ${u.role.padEnd(20)} → ${u.email}`);
  });

  console.log('\n🔐 Test Credentials:');
  console.log(`  Username: Any email above`);
  console.log(`  Password: ${TestPassword}`);
  console.log(`  Login at: http://localhost:3002/auth/login`);

  console.log('\n✨ Next: Visit dashboards and check PostgreSQL database\n');
}

runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
