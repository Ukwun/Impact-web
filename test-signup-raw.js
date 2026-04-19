const http = require('http');

function makeRequest(url, method, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testSignup() {
  console.log('🔍 Testing /api/auth/register endpoint\n');
  
  const signupData = {
    email: 'testuser123@example.com',
    password: 'ValidPassword@123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'student',
    phone: '555-1234',
    state: 'Lagos',
    institution: 'Test School',
  };

  console.log('📤 Request Data:');
  console.log(JSON.stringify(signupData, null, 2));
  console.log('\nSending POST request to http://localhost:3002/api/auth/register...\n');

  try {
    const response = await makeRequest('http://localhost:3002/api/auth/register', 'POST', signupData);
    
    console.log(`📥 HTTP ${response.status}\n`);
    console.log('Response Headers:');
    console.log(JSON.stringify(response.headers, null, 2));
    console.log('\nResponse Body:');
    console.log(response.body);
    
    try {
      const json = JSON.parse(response.body);
      console.log('\n📋 Parsed JSON:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\n⚠️  Response is not JSON');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSignup();
