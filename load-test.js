import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep, group } from 'k6';
import { Counter, Histogram, Trend } from 'k6/metrics';

// Custom metrics
const loginCounter = new Counter('logins_total');
const quizSubmitCounter = new Counter('quiz_submits_total');
const progressUpdateCounter = new Counter('progress_updates_total');
const socketConnectionCounter = new Counter('socket_connections_total');
const httpDurTrend = new Trend('http_request_duration');
const socketDurTrend = new Trend('socket_message_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '10s', target: 5 }, // 5 users
    { duration: '20s', target: 10 }, // 10 users
    { duration: '10s', target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95th percentile < 500ms
    'http_req_failed': ['rate<0.1'], // error rate < 10%
    'socket_message_duration': ['p(95)<200'], // 95th percentile < 200ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:3000';

// Demo credentials
const demoUser = {
  email: 'student@example.com',
  password: 'Test@1234',
};

/**
 * Test 1: Authentication (Login)
 */
export function testAuthentication() {
  group('Authentication', () => {
    const payload = JSON.stringify(demoUser);

    const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const success = check(res, {
      'login status 200': (r) => r.status === 200,
      'login response has token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.token;
        } catch (e) {
          return false;
        }
      },
      'login response has user': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.user;
        } catch (e) {
          return false;
        }
      },
    });

    if (success) {
      loginCounter.add(1);
    }

    httpDurTrend.add(res.timings.duration);
    return res;
  });
}

/**
 * Test 2: Course Enrollment
 */
export function testCourseEnrollment(token) {
  group('Course Enrollment', () => {
    const payload = JSON.stringify({
      courseId: 'course-1',
    });

    const res = http.post(`${BASE_URL}/api/enrollments`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    check(res, {
      'enrollment status 200': (r) => r.status === 200 || r.status === 201,
    });

    httpDurTrend.add(res.timings.duration);
  });
}

/**
 * Test 3: Progress Update (REST API)
 */
export function testProgressUpdate(token) {
  group('Progress Update via API', () => {
    const payload = JSON.stringify({
      enrollmentId: `enrollment-${Math.random()}`,
      completionPercentage: Math.floor(Math.random() * 100),
      lessonsCompleted: Math.floor(Math.random() * 20),
      totalLessons: 20,
    });

    const res = http.post(`${BASE_URL}/api/progress`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    check(res, {
      'progress status is 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      progressUpdateCounter.add(1);
    }

    httpDurTrend.add(res.timings.duration);
  });
}

/**
 * Test 4: Quiz Submission via REST API
 */
export function testQuizSubmission(token) {
  group('Quiz Submission via API', () => {
    const payload = JSON.stringify({
      quizId: `quiz-1`,
      enrollmentId: `enrollment-${Math.random()}`,
      answers: {
        'q1': 'a',
        'q2': 'b',
        'q3': 'c',
      },
      timeSpent: Math.random() * 3600, // 0-60 minutes
    });

    const res = http.post(`${BASE_URL}/api/quiz/submit`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    check(res, {
      'quiz submission status is 200': (r) => r.status === 200 || r.status === 201,
    });

    if (res.status === 200 || res.status === 201) {
      quizSubmitCounter.add(1);
    }

    httpDurTrend.add(res.timings.duration);
  });
}

/**
 * Test 5: WebSocket Connection
 */
export function testWebSocketConnection(token, userId) {
  group('WebSocket Connection', () => {
    const url = `${WS_URL}?token=${token}&userId=${userId}`;
    const startTime = new Date();

    const res = ws.connect(url, null, (socket) => {
      socket.on('connect', () => {
        console.log(`✅ WebSocket connected: ${socket.id}`);
        socketConnectionCounter.add(1);

        // Send typing event
        socket.send(
          JSON.stringify({
            type: 'user:typing',
            roomId: 'test-room',
          })
        );

        // Simulate progress updates
        for (let i = 0; i < 5; i++) {
          socket.send(
            JSON.stringify({
              type: 'progress:update',
              data: {
                courseId: 'course-1',
                completionPercentage: i * 20,
              },
            })
          );
          socket.sleep(100);
        }

        // Stop typing
        socket.send(
          JSON.stringify({
            type: 'user:stop-typing',
            roomId: 'test-room',
          })
        );

        socket.close();
      });

      socket.on('error', (e) => {
        console.error(`❌ WebSocket error: ${e}`);
      });
    });

    const duration = new Date() - startTime;
    socketDurTrend.add(duration);

    check(res, {
      'websocket status is 101': (r) => r && r.status === 101,
    });
  });
}

/**
 * Main test function
 */
export default function main() {
  // Test authentication
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(demoUser), {
    headers: { 'Content-Type': 'application/json' },
  });

  let token = '';
  let userId = '';

  if (loginRes.status === 200) {
    try {
      const body = JSON.parse(loginRes.body);
      token = body.data.token;
      userId = body.data.user.id;
      loginCounter.add(1);
    } catch (e) {
      console.error('Failed to parse login response:', e);
    }
  }

  if (!token) {
    return;
  }

  // Run various tests
  testProgressUpdate(token);
  sleep(1);

  testQuizSubmission(token);
  sleep(1);

  testWebSocketConnection(token, userId);
  sleep(1);

  testCourseEnrollment(token);
  sleep(1);
}
