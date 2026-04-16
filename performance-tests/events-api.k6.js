import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Define custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const registrationDuration = new Trend('registration_duration');

// Thresholds
export const thresholds = {
  errors: ['rate<0.1'], // Error rate should be less than 10%
  'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95th percentile < 500ms, 99th < 1000ms
  'http_req_failed': ['rate<0.05'], // HTTP request failure rate < 5%
};

// Test configuration
export const options = {
  vus: 10, // 10 virtual users
  duration: '30s', // Test duration: 30 seconds
  stages: [
    { duration: '5s', target: 10 }, // Ramp up to 10 users
    { duration: '10s', target: 20 }, // Ramp up to 20 users
    { duration: '10s', target: 10 }, // Ramp down to 10 users
    { duration: '5s', target: 0 }, // Ramp down to 0 users
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test_token_123';

export default function () {
  group('Events API Performance Tests', () => {
    // Test 1: List Events
    group('GET /api/events', () => {
      const listEventsStartTime = new Date();
      const response = http.get(`${BASE_URL}/api/events?limit=50`);
      const duration = new Date() - listEventsStartTime;

      apiDuration.add(duration);
      errorRate.add(response.status !== 200);

      check(response, {
        'list events status is 200': (r) => r.status === 200,
        'list events response time < 500ms': (r) =>
          r.timings.duration < 500,
        'list events contains data': (r) =>
          r.json('data') !== undefined && r.json('data').length > 0,
      });

      sleep(1);
    });

    // Test 2: Get Event Details
    group('GET /api/events/[id]', () => {
      const detailStartTime = new Date();
      const response = http.get(`${BASE_URL}/api/events/evt_test_123`);
      const duration = new Date() - detailStartTime;

      apiDuration.add(duration);
      errorRate.add(response.status !== 200 && response.status !== 404);

      check(response, {
        'event detail status is 200': (r) => r.status === 200,
        'event detail response time < 300ms': (r) =>
          r.timings.duration < 300,
        'event detail has required fields': (r) => {
          const data = r.json('data');
          return data && data.id && data.title;
        },
      });

      sleep(1);
    });

    // Test 3: Register for Event (with auth)
    group('POST /api/events/[id]/register', () => {
      const regStartTime = new Date();
      const headers = {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      };

      const response = http.post(
        `${BASE_URL}/api/events/evt_test_123/register`,
        {},
        { headers }
      );
      const duration = new Date() - regStartTime;

      registrationDuration.add(duration);
      errorRate.add(
        response.status !== 200 &&
          response.status !== 409 &&
          response.status !== 401
      );

      check(response, {
        'register status is 200 or 409 or 401': (r) =>
          r.status === 200 || r.status === 409 || r.status === 401,
        'register response time < 1000ms': (r) =>
          r.timings.duration < 1000,
        'register status is 401 without token': (r) =>
          !AUTH_TOKEN ? r.status === 401 : true,
      });

      sleep(1);
    });

    // Test 4: Get User Registrations (with auth)
    group('GET /api/events/my-registrations', () => {
      const myRegsStartTime = new Date();
      const headers = {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      };

      const response = http.get(
        `${BASE_URL}/api/events/my-registrations`,
        { headers }
      );
      const duration = new Date() - myRegsStartTime;

      apiDuration.add(duration);
      errorRate.add(response.status !== 200 && response.status !== 401);

      check(response, {
        'my registrations status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
        'my registrations response time < 500ms': (r) =>
          r.timings.duration < 500,
        'my registrations returns array': (r) =>
          r.status === 200 && Array.isArray(r.json('data')),
      });

      sleep(1);
    });

    // Test 5: Stress test - Multiple concurrent requests
    group('Stress Test - Concurrent Requests', () => {
      const batch = http.batch([
        [
          'GET',
          `${BASE_URL}/api/events?limit=10`,
          null,
          { tags: { name: 'ListEvents' } },
        ],
        [
          'GET',
          `${BASE_URL}/api/events/evt_test_123`,
          null,
          { tags: { name: 'GetEventDetail' } },
        ],
        [
          'GET',
          `${BASE_URL}/api/events/evt_test_456`,
          null,
          { tags: { name: 'GetEventDetail' } },
        ],
      ]);

      batch.forEach((response) => {
        check(response, {
          'concurrent request status is 200 or 404': (r) =>
            r.status === 200 || r.status === 404,
          'concurrent request response time < 1000ms': (r) =>
            r.timings.duration < 1000,
        });
      });

      sleep(1);
    });
  });
}
