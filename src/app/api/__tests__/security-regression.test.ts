/** @jest-environment node */

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const mockAuthenticateUser = jest.fn();
const mockGetUserFromToken = jest.fn();

const mockPrisma = {
  user: {
    update: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
  },
  enrollment: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  payment: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockUserDocGet = jest.fn();
const mockUserDocUpdate = jest.fn();
const mockRoleRequestCollection = {
  doc: jest.fn(() => ({
    get: mockUserDocGet,
    update: mockUserDocUpdate,
  })),
};

const mockGetFirestore = jest.fn(() => ({
  collection: jest.fn((name: string) => {
    if (name === "users") return mockRoleRequestCollection;
    return {
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
      })),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({ get: jest.fn() })),
      })),
    };
  }),
}));

jest.mock("@/lib/auth", () => ({
  authenticateUser: (...args: any[]) => mockAuthenticateUser(...args),
  getUserFromToken: (...args: any[]) => mockGetUserFromToken(...args),
  generateToken: jest.fn(() => "mock-jwt"),
  hashPassword: jest.fn(async () => "hashed"),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

jest.mock("@/lib/firebase-admin", () => ({
  getFirestore: (...args: any[]) => mockGetFirestore(...args),
  getFirebaseAuth: jest.fn(() => ({
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
  })),
}));

jest.mock("@/lib/firestore-utils", () => ({
  logActivity: jest.fn(async () => ({})),
}));

jest.mock("@/lib/cors", () => ({
  addCorsHeaders: (res: any) => res,
  handleCorsOptions: jest.fn(() => null),
}));

jest.mock("@/lib/security", () => ({
  checkRateLimit: jest.fn(async () => ({ allowed: true, resetTime: Date.now() + 60_000 })),
  getClientIp: jest.fn(() => "127.0.0.1"),
  RATE_LIMIT_CONFIGS: {
    AUTH_SIGNUP: { message: "rate-limit" },
    AUTH_LOGIN: { message: "rate-limit" },
  },
}));

jest.mock("@/lib/security/passwordValidator", () => ({
  validatePassword: jest.fn(() => ({ isValid: true, feedback: [] })),
}));

jest.mock("@/lib/socket-server", () => ({
  getSocketServer: jest.fn(() => null),
}));

describe("Security Regression Tests", () => {
  const createMockRequest = (url: string, body: any = {}, auth = "Bearer token"): any => ({
    url,
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === "authorization") return auth;
        if (name.toLowerCase() === "origin") return "http://localhost:3000";
        return null;
      },
    },
    json: async () => body,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OWNER_EMAIL_ALLOWLIST = "owner@impactedu.ng";
  });

  it("blocks enrollment when paymentId is missing", async () => {
    const { POST } = await import("@/app/api/courses/[id]/enroll/route");

    mockGetUserFromToken.mockResolvedValue({ id: "student-1" });

    const req = createMockRequest("http://localhost:3000/api/courses/course-1/enroll", {});

    const res = await POST(req, { params: { id: "course-1" } as any });
    const json = await res.json();

    expect(res.status).toBe(402);
    expect(json.success).toBe(false);
    expect(json.error).toContain("Payment is required");
  });

  it("enforces evidence for privileged role requests at signup", async () => {
    const { POST } = await import("@/app/api/auth/register/route");

    const req = createMockRequest("http://localhost:3000/api/auth/register", {
      email: "teacher@school.edu",
      password: "StrongPass1!",
      firstName: "Tina",
      lastName: "Teacher",
      role: "FACILITATOR",
      phoneVerified: false,
      supportingNote: "short",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(String(json.error)).toMatch(/Privileged role request requires/i);
  });

  it("requires owner allowlist for ADMIN role approval", async () => {
    const { PATCH } = await import("@/app/api/admin/role-requests/[id]/route");

    mockAuthenticateUser.mockResolvedValue({
      success: true,
      user: {
        id: "admin-1",
        email: "admin@impactedu.ng",
        role: "ADMIN",
        approvalStatus: "APPROVED",
      },
    });

    mockUserDocGet.mockResolvedValue({
      exists: true,
      data: () => ({
        requestedRole: "ADMIN",
        approvalStatus: "PENDING_ROLE_APPROVAL",
        role: "STUDENT",
        roleRequest: {},
        email: "candidate@school.edu",
      }),
    });

    const req = createMockRequest("http://localhost:3000/api/admin/role-requests/user-2", {
      action: "APPROVE",
      note: "All checks passed",
    });

    const res = await PATCH(req, { params: { id: "user-2" } as any });
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.success).toBe(false);
    expect(String(json.error)).toMatch(/Only product owner can approve ADMIN/i);
  });

  it("allows payment-linked enrollment when payment is completed", async () => {
    const { POST } = await import("@/app/api/courses/[id]/enroll/route");

    mockGetUserFromToken.mockResolvedValue({ id: "student-1" });
    mockPrisma.course.findUnique.mockResolvedValue({ id: "course-1", title: "Test Course" });
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      userId: "student-1",
      status: "COMPLETED",
      enrollmentId: null,
      metadata: { courseId: "course-1" },
    });

    mockPrisma.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        enrollment: {
          create: jest.fn().mockResolvedValue({
            id: "enroll-1",
            courseId: "course-1",
            userId: "student-1",
            progress: 0,
            isCompleted: false,
            enrolledAt: new Date().toISOString(),
            course: {
              id: "course-1",
              title: "Test Course",
              description: "desc",
              difficulty: "BEGINNER",
              duration: 60,
            },
          }),
        },
        payment: {
          update: jest.fn().mockResolvedValue({ id: "pay-1" }),
        },
      };
      return fn(tx);
    });

    const req = createMockRequest("http://localhost:3000/api/courses/course-1/enroll", {
      paymentId: "pay-1",
    });

    const res = await POST(req, { params: { id: "course-1" } as any });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.enrollment.courseId).toBe("course-1");
  });
});
