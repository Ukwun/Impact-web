import { POST as createCourse, GET as getCourses } from "../../api/facilitator/courses/route";
import { createMockNextRequest } from "../../__tests__/test-utils";

// Mock Prisma for test isolation
jest.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      create: jest.fn(async ({ data }) => ({ ...data, id: "course-1", createdAt: new Date().toISOString(), isPublished: true })),
      findMany: jest.fn(async ({ where }) => [
        {
          id: "course-1",
          title: "Test Course",
          description: "A test course",
          difficulty: "BEGINNER",
          language: "English",
          instructor: "Test Instructor",
          isPublished: true,
          createdAt: new Date().toISOString(),
          _count: { enrollments: 5, grades: 2 },
        },
      ]),
    },
    lesson: {
      create: jest.fn(async ({ data }) => ({ ...data, id: "lesson-1" })),
    },
  },
}));

// Mock token verification
jest.mock("@/lib/auth", () => ({
  verifyToken: (token: string) => token === "valid-token" ? { sub: "facilitator-1", role: "FACILITATOR" } : null,
}));

describe("Facilitator Courses API (E2E)", () => {
  it("should create a new course and lessons (POST)", async () => {
    const req = createMockNextRequest("/api/facilitator/courses", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
      body: {
        title: "Test Course",
        description: "A test course",
        difficulty: "BEGINNER",
        language: "English",
        instructor: "Test Instructor",
        lessons: [
          { title: "Lesson 1", description: "Desc", order: 1, duration: 60 },
        ],
      },
    });
    const res = await createCourse(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.course.title).toBe("Test Course");
    expect(json.course.instructor).toBe("Test Instructor");
  });

  it("should fetch facilitator's courses (GET)", async () => {
    const req = createMockNextRequest("/api/facilitator/courses", {
      method: "GET",
      headers: { authorization: "Bearer valid-token" },
    });
    const res = await getCourses(req);
    const json = await res.json();
    expect(Array.isArray(json.courses)).toBe(true);
    expect(json.courses[0].title).toBe("Test Course");
    expect(json.courses[0].instructor).toBe("Test Instructor");
    expect(json.courses[0].difficulty).toBe("BEGINNER");
    expect(json.courses[0].language).toBe("English");
    expect(json.courses[0].totalStudents).toBe(5);
    expect(json.courses[0].totalGrades).toBe(2);
  });
});
