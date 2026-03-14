import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface MockFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Create a mock JWT token for testing
 */
export function createMockToken(
  payload: Record<string, any> = {},
  secret = process.env.JWT_SECRET || "test-secret"
): string {
  const defaultPayload = {
    sub: "test-user-id",
    email: "test@example.com",
    role: "STUDENT",
    iat: Math.floor(Date.now() / 1000),
    ...payload,
  };

  return jwt.sign(defaultPayload, secret, { expiresIn: "24h" });
}

/**
 * Create a mock NextRequest for testing
 */
export function createMockNextRequest(
  url: string,
  options: MockFetchOptions = {}
): NextRequest {
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;

  const request = new NextRequest(fullUrl, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return request;
}

/**
 * Create mock request with authentication
 */
export function createAuthenticatedRequest(
  url: string,
  options: MockFetchOptions = {}
): NextRequest {
  const token = createMockToken();

  return createMockNextRequest(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

/**
 * Mock database fixture
 */
export const mockDatabaseFixtures = {
  users: {
    student: {
      id: "student-1",
      email: "student@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "STUDENT",
      emailVerified: true,
    },
    facilitator: {
      id: "facilitator-1",
      email: "facilitator@example.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "FACILITATOR",
      emailVerified: true,
    },
  },
  courses: {
    webDevelopment: {
      id: "course-1",
      title: "Web Development 101",
      description: "Learn web development basics",
    },
  },
  enrollments: {
    studentInCourse: {
      id: "enrollment-1",
      userId: "student-1",
      courseId: "course-1",
      progress: 50,
    },
  },
};

/**
 * Wait utility for async operations in tests
 */
export async function waitFor(
  callback: () => boolean | Promise<boolean>,
  timeout = 1000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await callback()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timeout waiting for condition");
}
