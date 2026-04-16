import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const registrationThroughput = new Rate('registration_success_rate');
const registrationLatency = new Trend('registration_latency');
const failedRegistrations = new Counter('failed_registrations');

// Stress test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp-up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 }, // Ramp-down to 0 users
  ],
  thresholds: {
    'registration_success_rate': ['rate>0.95'],
    'http_req_duration': ['p(99)<2000'],
    'registration_latency': ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test_token_123';

export default function () {
  // Simulate user registering for multiple events
  const eventIds = [
    'evt_1', 'evt_2', 'evt_3', 'evt_4', 'evt_5',
    'evt_6', 'evt_7', 'evt_8', 'evt_9', 'evt_10',
  ];

  // Random event selection
  const randomEvent = eventIds[Math.floor(Math.random() * eventIds.length)];

  const headers = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Register for event
  const startTime = new Date();
  const response = http.post(
    `${BASE_URL}/api/events/${randomEvent}/register`,
    {},
    { headers, timeout: '10s' }
  );
  const duration = new Date() - startTime;

  registrationLatency.add(duration);

  const success = response.status === 200 || response.status === 409; // 409 = already registered
  registrationThroughput.add(success);

  if (!success) {
    failedRegistrations.add(1);
  }

  check(response, {
    'registration successful': (r) =>
      r.status === 200 || r.status === 409,
    'registration response time < 2000ms': (r) =>
      r.timings.duration < 2000,
    'no server errors': (r) => r.status < 500,
  });

  sleep(Math.random() * 3 + 1); // Sleep 1-4 seconds
}
