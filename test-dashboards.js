const http = require('http');

const BASE_URL = 'http://localhost:3002';

const TestRoles = [
  { role: 'STUDENT', endpoint: '/api/progress', color: '\x1b[36m' },
  { role: 'PARENT', endpoint: '/api/parent-child', color: '\x1b[35m' },
  { role: 'FACILITATOR', endpoint: '/api/facilitator/classes', color: '\x1b[34m' },
  { role: 'SCHOOL_ADMIN', endpoint: '/api/admin/school', color: '\x1b[33m' },
  { role: 'ADMIN', endpoint: '/api/admin/dashboard', color: '\x1b[31m' },
  { role: 'MENTOR', endpoint: '/api/mentor/sessions', color: '\x1b[32m' },
  { role: 'CIRCLE_MEMBER', endpoint: '/api/circle-member', color: '\x1b[37m' },
  { role: 'UNIVERSITY_MEMBER', endpoint: '/api/university/profile', color: '\x1b[32m' },
];

function makeRequest(url, method = 'GET', headers = {}) {
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
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testDashboards() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║      TESTING ALL 8 ROLE DASHBOARDS - ImpactApp         ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < TestRoles.length; i++) {
    const test = TestRoles[i];
    const num = i + 1;
    
    process.stdout.write(`[${num}/8] Testing ${test.role.padEnd(18)} ... `);

    try {
      const response = await makeRequest(BASE_URL + test.endpoint, 'GET');
      
      // Accept 200, 401 (needs auth), 403 (forbidden)
      if (response.status === 200 || response.status === 401 || response.status === 403) {
        console.log(`\x1b[32m✅ HTTP ${response.status}\x1b[0m`);
        passCount++;
      } else if (response.status === 404) {
        console.log(`\x1b[31m❌ HTTP 404 (Not Found)\x1b[0m`);
        failCount++;
      } else {
        console.log(`\x1b[31m❌ HTTP ${response.status}\x1b[0m`);
        failCount++;
      }
    } catch (error) {
      console.log(`\x1b[31m❌ ${error.message}\x1b[0m`);
      failCount++;
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                   SUMMARY                                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`Total Tests:   ${TestRoles.length}`);
  console.log(`\x1b[32m✅ Passed:     ${passCount}\x1b[0m`);
  console.log(`\x1b[31m❌ Failed:     ${failCount}\x1b[0m`);

  if (failCount === 0) {
    console.log('\n✨ All dashboard endpoints are accessible! ✨\n');
  } else {
    console.log('\n⚠️  Some endpoints need attention\n');
  }

  console.log('Next steps:');
  console.log('1. Sign up test users at http://localhost:3002/auth/signup');
  console.log('2. Get authentication tokens for each user');
  console.log('3. Create test enrollments in database');
  console.log('4. Test endpoints with authenticated requests\n');
}

testDashboards().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
