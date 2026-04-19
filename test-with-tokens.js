const http = require('http');

const BASE_URL = 'http://localhost:3003';

const TestRoles = [
  { role: 'STUDENT', endpoint: '/api/progress', name: 'Student Progress' },
  { role: 'PARENT', endpoint: '/api/parent-child', name: 'Parent-Child' },
  { role: 'FACILITATOR', endpoint: '/api/facilitator/classes', name: 'Facilitator Classes' },
  { role: 'SCHOOL_ADMIN', endpoint: '/api/admin/school', name: 'School Admin' },
  { role: 'ADMIN', endpoint: '/api/admin/dashboard', name: 'Admin Dashboard' },
  { role: 'MENTOR', endpoint: '/api/mentor/sessions', name: 'Mentor Sessions' },
  { role: 'CIRCLE_MEMBER', endpoint: '/api/circle-member', name: 'Circle Member' },
  { role: 'UNIVERSITY_MEMBER', endpoint: '/api/university/profile', name: 'University Member' },
];

function makeRequest(url, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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
            json: data ? JSON.parse(data) : null,
            data: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            json: null,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAllDashboards() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   TESTING ALL DASHBOARDS WITH TEST TOKENS                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Phase 1: Generate test tokens
  console.log('📝 PHASE 1: Generating test tokens for all roles...\n');
  const tokens = {};
  
  for (const role of TestRoles) {
    process.stdout.write(`  Generating ${role.role.padEnd(18)} token... `);
    try {
      const response = await makeRequest(`${BASE_URL}/api/test/generate-token`, 'POST', { role: role.role });
      if (response.status === 200 && response.json?.token) {
        tokens[role.role] = response.json.token;
        console.log('✅');
      } else {
        console.log(`❌ HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
    }
  }

  const generatedCount = Object.keys(tokens).length;
  console.log(`\nGenerated ${generatedCount}/${TestRoles.length} tokens\n`);

  if (generatedCount === 0) {
    console.log('❌ Could not generate any test tokens. Development mode might not be enabled.\n');
    console.log('Quick test: Try these endpoints without token (should get HTTP 401):\n');
    TestRoles.forEach(t => {
      console.log(`  curl -X GET ${BASE_URL}${t.endpoint}`);
    });
    return;
  }

  // Phase 2: Test endpoints with tokens
  console.log('📊 PHASE 2: Testing endpoints with authentication...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < TestRoles.length; i++) {
    const test = TestRoles[i];
    const num = i + 1;
    const token = tokens[test.role];

    process.stdout.write(`[${num}/8] ${test.name.padEnd(25)} ... `);

    if (!token) {
      console.log('⏭️  No token');
      continue;
    }

    try {
      const response = await makeRequest(
        `${BASE_URL}${test.endpoint}`,
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (response.status === 200) {
        console.log(`✅ HTTP ${response.status}`);
        successCount++;
        if (response.json?.data) {
          const hasData = response.json.data !== null && response.json.data !== undefined;
          if (hasData) console.log(`     └─ Response has data`);
        }
      } else if (response.status === 404 || response.status === 500) {
        console.log(`⚠️  HTTP ${response.status}`);
        if (response.json?.error) {
          console.log(`     └─ Error: ${response.json.error}`);
        }
        errorCount++;
      } else {
        console.log(`❌ HTTP ${response.status}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Tokens Generated:  ${generatedCount}/${TestRoles.length}`);
  console.log(`✅ Successful:     ${successCount}`);
  console.log(`⚠️  With Errors:    ${errorCount}`);

  if (successCount > 0) {
    console.log('\n✨ Dashboards are working with test tokens!');
    console.log('\nTo test in browser:');
    const firstToken = Object.values(tokens)[0];
    if (firstToken) {
      console.log(`1. Open DevTools Console (F12)`);
      console.log(`2. Run: localStorage.setItem('auth_token', '${firstToken.substring(0, 30)}...')`);
      console.log(`3. Refresh the page`);
    }
  }

  console.log('\n');
}

testAllDashboards().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
