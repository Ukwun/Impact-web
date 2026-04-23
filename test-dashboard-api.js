const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_super_secret_jwt_key_min_32_characters_required_here_123456';

// Create a test JWT token
const payload = {
  sub: 'test-facilitator-id-123',
  email: 'facilitator@test.com',
  role: 'FACILITATOR',
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

console.log('Test Token:', token);
console.log('Calling facilitator dashboard API...\n');

// Call the API
fetch('http://localhost:3000/api/facilitator/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then(res => {
    console.log('Response Status:', res.status);
    return res.text();
  })
  .then(body => {
    console.log('Response Body:', body);
    try {
      const json = JSON.parse(body);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Failed to parse as JSON');
    }
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
