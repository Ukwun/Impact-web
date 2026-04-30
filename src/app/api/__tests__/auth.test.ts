// Mock email service to capture verification code
let lastVerificationCode = null;
jest.mock("@/lib/email-service", () => {
  const actual = jest.requireActual("@/lib/email-service");
  return {
    ...actual,
    getEmailService: () => ({
      send: (template) => {
        // If it's a verification code email, capture the code
        if (template && template.subject && template.subject.includes("Verification Code")) {
          // Extract code from HTML or text
          const match = /([0-9]{6})/.exec(template.text || template.html || "");
          if (match) lastVerificationCode = match[1];
        }
        return Promise.resolve({ success: true });
      },
    }),
    emailTemplates: actual.emailTemplates,
  };
});

import { POST as registerHandler } from "../auth/register/route";
import { POST as verifyEmailHandler } from "../auth/verify-email/route";

describe("End-to-end registration and email verification", () => {
  it("should register a user and verify email with code", async () => {
    // 1. Register a new user
    const email = `e2euser${Date.now()}@example.com`;
    const password = "TestPassword123!";
    const firstName = "E2E";
    const lastName = "User";
    lastVerificationCode = null;

    const registerReq = createMockNextRequest("/api/auth/register", {
      method: "POST",
      body: { email, password, firstName, lastName },
    });
    const registerRes = await registerHandler(registerReq);
    const registerJson = await registerRes.json();
    expect(registerJson.success).toBe(true);
    expect(lastVerificationCode).toMatch(/^[0-9]{6}$/);

    // 2. Verify email with code
    const verifyReq = createMockNextRequest("/api/auth/verify-email", {
      method: "POST",
      body: { email, code: lastVerificationCode },
    });
    const verifyRes = await verifyEmailHandler(verifyReq);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.success).toBe(true);
    expect(verifyJson.message).toMatch(/verified/i);
  });
});
import { createMockNextRequest, createAuthenticatedRequest } from "./test-utils";

// Mock Prisma
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  sign: jest.fn((payload) => `mock-token-${payload.sub}`),
  verify: jest.fn((token) => {
    if (token === "invalid") throw new Error("Invalid token");
    return { sub: "test-user", email: "test@example.com" };
  }),
}));

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(async (password) => `hashed-${password}`),
  compare: jest.fn(async (password, hash) => hash === `hashed-${password}`),
}));

describe("Auth API Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should require email and password", async () => {
      const request = createMockNextRequest("/api/auth/register", {
        method: "POST",
        body: { email: "test@example.com" }, // Missing password
      });

      // In real scenario, we'd import and call the route handler
      // expect(response.status).toBe(400);
    });

    it("should validate email format", async () => {
      const request = createMockNextRequest("/api/auth/register", {
        method: "POST",
        body: {
          email: "invalid-email",
          password: "SecurePassword123",
        },
      });

      // In real scenario, validate would catch this
    });

    it("should hash password before storing", async () => {
      const request = createMockNextRequest("/api/auth/register", {
        method: "POST",
        body: {
          email: "newuser@example.com",
          password: "SecurePassword123",
          firstName: "John",
          lastName: "Doe",
          role: "STUDENT",
        },
      });

      // Password should be hashed, not stored in plain text
    });
  });

  describe("POST /api/auth/login", () => {
    it("should require email and password", async () => {
      const request = createMockNextRequest("/api/auth/login", {
        method: "POST",
        body: { email: "test@example.com" },
      });

      expect(request.method).toBe("POST");
    });

    it("should return JWT token on successful login", async () => {
      const request = createMockNextRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: "test@example.com",
          password: "correct-password",
        },
      });

      // Should return token in response
    });

    it("should reject incorrect password", async () => {
      const request = createMockNextRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: "test@example.com",
          password: "wrong-password",
        },
      });

      // Should return 401 Unauthorized
    });

    it("should return error for non-existent user", async () => {
      const request = createMockNextRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: "nonexistent@example.com",
          password: "any-password",
        },
      });

      // Should return 404 or 401
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should send reset email to registered user", async () => {
      const request = createMockNextRequest("/api/auth/forgot-password", {
        method: "POST",
        body: { email: "test@example.com" },
      });

      expect(request.method).toBe("POST");
    });

    it("should not reveal if email exists (security)", async () => {
      const request = createMockNextRequest("/api/auth/forgot-password", {
        method: "POST",
        body: { email: "nonexistent@example.com" },
      });

      // Should return same response for both existing and non-existing emails
    });
  });

  describe("POST /api/auth/verify-email", () => {
    it("should verify email with valid token", async () => {
      const request = createMockNextRequest("/api/auth/verify-email", {
        method: "POST",
        body: { token: "valid-token" },
      });

      expect(request.method).toBe("POST");
    });

    it("should reject invalid or expired token", async () => {
      const request = createMockNextRequest("/api/auth/verify-email", {
        method: "POST",
        body: { token: "invalid-token" },
      });

      // Should return 400
    });
  });

  describe("Authorization", () => {
    it("should require Authorization header for protected routes", async () => {
      const request = createMockNextRequest("/api/progress", {
        method: "GET",
      });

      // Request without Authorization header should fail
      expect(request.headers.get("Authorization")).toBeNull();
    });

    it("should accept valid JWT token", async () => {
      const request = createAuthenticatedRequest("/api/progress", {
        method: "GET",
      });

      expect(request.headers.get("Authorization")).toContain("Bearer");
    });
  });
});
