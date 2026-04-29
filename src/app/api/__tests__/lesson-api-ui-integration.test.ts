/** @jest-environment node */

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const mockVerifyToken = jest.fn();

const mockPrisma = {
  course: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  lesson: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  assignmentSubmission: {
    create: jest.fn(),
  },
};

jest.mock("@/lib/auth", () => ({
  verifyToken: (...args: any[]) => mockVerifyToken(...args),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

jest.mock("@/lib/s3-client", () => ({
  uploadToS3: jest.fn(),
  getPresignedUploadUrl: jest.fn(),
  deleteFromS3: jest.fn(),
}));

jest.mock("@/lib/file-validation", () => ({
  validateFile: jest.fn(),
  generateS3Key: jest.fn(() => "mock-s3-key"),
}));

function createMockRequest(url: string, body: any, auth = "Bearer token"): any {
  return {
    url,
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === "authorization") return auth;
        return null;
      },
    },
    json: async () => body,
  };
}

describe("Lesson API/UI integration contracts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyToken.mockReturnValue({
      sub: "facilitator-1",
      email: "facilitator@test.com",
      role: "FACILITATOR",
    });
  });

  it("maps UI alias fields when updating course (level/estimatedHours)", async () => {
    const { PUT } = await import("@/app/api/courses/[id]/route");

    mockPrisma.course.findUnique.mockResolvedValue({ createdById: "facilitator-1" });
    mockPrisma.course.update.mockResolvedValue({
      id: "course-1",
      title: "Course",
      description: "Updated course description",
      createdBy: { firstName: "Fac", lastName: "User" },
      isPublished: false,
      updatedAt: new Date().toISOString(),
    });

    const req = createMockRequest("http://localhost:3000/api/courses/course-1", {
      title: "Course",
      description: "Updated course description",
      level: "INTERMEDIATE",
      estimatedHours: 5,
      category: "Technology",
      maxStudents: 30,
    });

    const res = await PUT(req, { params: { id: "course-1" } as any });

    expect(res.status).toBe(200);
    expect(mockPrisma.course.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "course-1" },
        data: expect.objectContaining({
          difficulty: "INTERMEDIATE",
          duration: 300,
        }),
      })
    );

    const updateArgs = mockPrisma.course.update.mock.calls[0][0].data;
    expect(updateArgs.category).toBeUndefined();
    expect(updateArgs.maxStudents).toBeUndefined();
  });

  it("maps lesson alias fields and defaults on create (estimatedHours/order/description)", async () => {
    const { POST } = await import("@/app/api/courses/[id]/lessons/route");

    mockPrisma.course.findUnique.mockResolvedValue({ createdById: "facilitator-1" });
    mockPrisma.lesson.findFirst.mockResolvedValue({ order: 2 });
    mockPrisma.lesson.create.mockResolvedValue({
      id: "lesson-1",
      title: "Layered Lesson",
      description: "Lesson content",
      duration: 120,
      order: 3,
      createdAt: new Date().toISOString(),
    });

    const req = createMockRequest("http://localhost:3000/api/courses/course-1/lessons", {
      title: "Layered Lesson",
      estimatedHours: 2,
      learningLayer: "LEARN",
      moduleId: "module-1",
      learningObjectives: ["Understand concept"],
    });

    const res = await POST(req, { params: { id: "course-1" } as any });

    expect(res.status).toBe(201);
    expect(mockPrisma.lesson.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Layered Lesson",
          description: "Lesson content",
          duration: 120,
          order: 3,
          moduleId: "module-1",
          learningLayer: "LEARN",
        }),
      })
    );
  });

  it("exposes /api/files/presign contract via alias route", async () => {
    const { POST } = await import("@/app/api/files/presign/route");

    const req = createMockRequest("http://localhost:3000/api/files/presign", {
      contentType: "video/mp4",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("filename and contentType are required");
  });
});
