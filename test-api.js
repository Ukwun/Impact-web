const fetch = require('node-fetch');

async function testEmailAPI() {
  try {
    console.log('Testing forgot-password API...');

    const response = await fetch('http://localhost:3002/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'different-test@example.com'
      })
    });

    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', data);

    if (response.ok) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed');
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testEmailAPI();