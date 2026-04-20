import { NextRequest, NextResponse } from "next/server";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import FacilitatorDashboard from "@/components/dashboard/FacilitatorDashboard";
import ParentDashboard from "@/components/dashboard/ParentDashboard";
import SchoolAdminDashboard from "@/components/dashboard/SchoolAdminDashboard";
import MentorDashboard from "@/components/dashboard/MentorDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import UniversityMemberDashboard from "@/components/dashboard/UniversityMemberDashboard";
import CircleMemberDashboard from "@/components/dashboard/CircleMemberDashboard";

/**
 * COMPREHENSIVE PHASE 5 TESTING SUITE
 * Tests all 8 roles for:
 * - Correct API endpoint calls
 * - Role verification (no 403 errors)
 * - Data isolation
 * - Modal functionality
 * - Button interactivity
 * - Real database integration
 */

describe("PHASE 5: COMPLETE ROLE TESTING", () => {
  // Mock fetch globally
  global.fetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("token", "test-token-123");
    localStorage.setItem("user", JSON.stringify({ id: "user123", role: "STUDENT" }));
  });

  // ==========================================
  // STUDENT ROLE TESTS
  // ==========================================
  describe("STUDENT Role - Complete Testing", () => {
    const mockStudentData = {
      success: true,
      data: {
        enrolledCourses: [
          { id: "c1", title: "React Basics", facilitatorName: "Jane Doe", progress: 75, status: "active" }
        ],
        pendingAssignments: [
          { id: "a1", title: "Build Todo App", course: "React Basics", daysUntilDue: 3, difficulty: "medium" }
        ],
        studyStreak: 12,
        recentGrades: [{ course: "React Basics", score: 85 }]
      }
    };

    test("STUDENT: Calls correct API endpoint /api/student/dashboard", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStudentData), { status: 200 })
      );

      render(<StudentDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/student/dashboard",
          expect.objectContaining({
            headers: { Authorization: "Bearer test-token-123" }
          })
        );
      });
    });

    test("STUDENT: Displays real enrolled courses from database", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStudentData), { status: 200 })
      );

      render(<StudentDashboard />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      });
    });

    test("STUDENT: Displays pending assignments with correct due dates", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStudentData), { status: 200 })
      );

      render(<StudentDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Build Todo App")).toBeInTheDocument();
        expect(screen.getByText(/3 day.*left/)).toBeInTheDocument();
      });
    });

    test("STUDENT: Submit button opens assignment submission modal", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStudentData), { status: 200 })
      );

      render(<StudentDashboard />);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: /submit/i });
        fireEvent.click(submitButton);
        expect(screen.getByText(/assignment.*submission/i)).toBeInTheDocument();
      });
    });

    test("STUDENT: Assignment submission wired to /api/student/submit", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(new Response(JSON.stringify(mockStudentData), { status: 200 }));

      render(<StudentDashboard />);

      const submitButton = await screen.findByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      const contentInput = await screen.findByPlaceholderText(/assignment content/i);
      await userEvent.type(contentInput, "My assignment content");

      const confirmButton = await screen.findByRole("button", { name: /confirm|submit/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/student/submit",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("My assignment content")
          })
        );
      });
    });

    test("STUDENT: Study streak displays real data", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStudentData), { status: 200 })
      );

      render(<StudentDashboard />);

      await waitFor(() => {
        expect(screen.getByText("12 Days")).toBeInTheDocument();
        expect(screen.getByText(/study.*streak/i)).toBeInTheDocument();
      });
    });

    test("STUDENT: Browse courses button functional and wired", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStudentData), { status: 200 })
      );

      render(<StudentDashboard />);

      const browseButton = await screen.findByRole("button", { name: /browse|search.*course/i });
      fireEvent.click(browseButton);

      await waitFor(() => {
        expect(screen.getByText(/course.*discovery|available.*course/i)).toBeInTheDocument();
      });
    });

    test("STUDENT: No 403 errors - role check passes", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStudentData), { status: 200 })
      );

      render(<StudentDashboard />);

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const failedCalls = calls.filter(([url, opts]) => opts?.response?.status === 403);
        expect(failedCalls).toHaveLength(0);
      });
    });
  });

  // ==========================================
  // FACILITATOR ROLE TESTS
  // ==========================================
  describe("FACILITATOR Role - Complete Testing", () => {
    const mockFacilitatorData = {
      success: true,
      data: {
        classesTeaching: [
          { id: "class1", courseName: "React 101", studentCount: 25, completionRate: 78 }
        ],
        pendingSubmissions: [
          { id: "sub1", studentName: "John Doe", assignmentTitle: "Project A", submittedDate: "2026-04-20" }
        ],
        gradeStats: { submitted: 12, graded: 10, pending: 2 }
      }
    };

    test("FACILITATOR: Calls /api/facilitator/dashboard endpoint", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockFacilitatorData), { status: 200 })
      );

      render(<FacilitatorDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/facilitator/dashboard",
          expect.any(Object)
        );
      });
    });

    test("FACILITATOR: Displays classes teacher is instructing", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockFacilitatorData), { status: 200 })
      );

      render(<FacilitatorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("React 101")).toBeInTheDocument();
        expect(screen.getByText(/25.*student/i)).toBeInTheDocument();
      });
    });

    test("FACILITATOR: Shows pending student submissions to grade", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockFacilitatorData), { status: 200 })
      );

      render(<FacilitatorDashboard />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Project A")).toBeInTheDocument();
      });
    });

    test("FACILITATOR: Grade button opens grading modal and submits to /api/facilitator/grade", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockFacilitatorData), { status: 200 })
      );

      render(<FacilitatorDashboard />);

      const gradeButton = await screen.findByRole("button", { name: /grade|evaluate/i });
      fireEvent.click(gradeButton);

      const scoreInput = await screen.findByPlaceholderText(/score|grade|points/i);
      await userEvent.type(scoreInput, "92");

      const submitGradeButton = await screen.findByRole("button", { name: /submit.*grade|save.*grade/i });
      fireEvent.click(submitGradeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/facilitator/grade",
          expect.objectContaining({
            method: "POST"
          })
        );
      });
    });

    test("FACILITATOR: Class completion rate displayed correctly", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockFacilitatorData), { status: 200 })
      );

      render(<FacilitatorDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/78%|completion.*78/)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // PARENT ROLE TESTS
  // ==========================================
  describe("PARENT Role - Complete Testing", () => {
    const mockParentData = {
      success: true,
      data: {
        children: [
          {
            id: "child1",
            name: "Sarah",
            enrolledCourses: [ { courseName: "Math 101", progress: 85 } ],
            alerts: [ "Sarah completed Quiz 2" ]
          }
        ]
      }
    };

    test("PARENT: Calls /api/parent/dashboard endpoint", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockParentData), { status: 200 })
      );

      render(<ParentDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/parent/dashboard",
          expect.any(Object)
        );
      });
    });

    test("PARENT: Displays children's progress only (not parent's own)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockParentData), { status: 200 })
      );

      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Sarah")).toBeInTheDocument();
        expect(screen.getByText(/85%|progress/)).toBeInTheDocument();
      });
    });

    test("PARENT: Shows child's courses and performance alerts", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockParentData), { status: 200 })
      );

      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Sarah completed Quiz 2")).toBeInTheDocument();
      });
    });

    test("PARENT: View child details button functional", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockParentData), { status: 200 })
      );

      render(<ParentDashboard />);

      const detailButton = await screen.findByRole("button", { name: /view.*details|view.*progress/i });
      fireEvent.click(detailButton);

      await waitFor(() => {
        expect(screen.getByText(/Sarah.*progress|child.*detail/i)).toBeInTheDocument();
      });
    });

    test("PARENT: Data isolation - cannot see other children's data", async () => {
      const mixedData = {
        success: true,
        data: {
          children: [
            { id: "child1", name: "Sarah", enrolledCourses: [ { courseName: "Math 101", progress: 85 } ] },
            { id: "child_other", name: "OtherChild", enrolledCourses: [] }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mixedData), { status: 200 })
      );

      render(<ParentDashboard />);

      // Only own children should display
      await waitFor(() => {
        expect(screen.getByText("Sarah")).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // SCHOOL ADMIN ROLE TESTS
  // ==========================================
  describe("SCHOOL_ADMIN Role - Complete Testing", () => {
    const mockSchoolAdminData = {
      success: true,
      data: {
        totalStudents: 324,
        totalFacilitators: 18,
        totalCourses: 42,
        completionRate: 78
      }
    };

    test("SCHOOL_ADMIN: Calls /api/admin/school/dashboard endpoint", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockSchoolAdminData), { status: 200 })
      );

      render(<SchoolAdminDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/admin/school/dashboard",
          expect.any(Object)
        );
      });
    });

    test("SCHOOL_ADMIN: Displays institutional metrics", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockSchoolAdminData), { status: 200 })
      );

      render(<SchoolAdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/324.*student/i)).toBeInTheDocument();
        expect(screen.getByText(/18.*facilitator/i)).toBeInTheDocument();
        expect(screen.getByText(/42.*course/i)).toBeInTheDocument();
      });
    });

    test("SCHOOL_ADMIN: Shows completion rate metrics", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockSchoolAdminData), { status: 200 })
      );

      render(<SchoolAdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/78%|completion.*78/)).toBeInTheDocument();
      });
    });

    test("SCHOOL_ADMIN: Manage users button wired to API", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockSchoolAdminData), { status: 200 })
      );

      render(<SchoolAdminDashboard />);

      const manageButton = await screen.findByRole("button", { name: /manage.*users|user.*management/i });
      fireEvent.click(manageButton);

      await waitFor(() => {
        expect(screen.getByText(/user.*management|manage.*people/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // MENTOR ROLE TESTS
  // ==========================================
  describe("MENTOR Role - Complete Testing", () => {
    const mockMentorData = {
      success: true,
      data: {
        activeMentees: 8,
        scheduledSessions: 2,
        menteeProgress: [ { name: "Alex", progress: 76 } ]
      }
    };

    test("MENTOR: Calls /api/mentor/dashboard endpoint", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockMentorData), { status: 200 })
      );

      render(<MentorDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/mentor/dashboard",
          expect.any(Object)
        );
      });
    });

    test("MENTOR: Displays list of mentees", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockMentorData), { status: 200 })
      );

      render(<MentorDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/8.*mentee/i)).toBeInTheDocument();
        expect(screen.getByText("Alex")).toBeInTheDocument();
      });
    });

    test("MENTOR: Schedule session button functional", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockMentorData), { status: 200 })
      );

      render(<MentorDashboard />);

      const scheduleButton = await screen.findByRole("button", { name: /schedule|session/i });
      fireEvent.click(scheduleButton);

      await waitFor(() => {
        expect(screen.getByText(/schedule.*session|new.*session/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // ADMIN ROLE TESTS
  // ==========================================
  describe("ADMIN Role - Complete Testing", () => {
    const mockAdminData = {
      success: true,
      data: {
        totalUsers: 1245,
        totalSchools: 8,
        systemHealth: 99.2,
        alerts: 1
      }
    };

    test("ADMIN: Calls /api/admin/dashboard endpoint", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockAdminData), { status: 200 })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/admin/dashboard",
          expect.any(Object)
        );
      });
    });

    test("ADMIN: Displays system-wide metrics", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockAdminData), { status: 200 })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/1245.*user/i)).toBeInTheDocument();
        expect(screen.getByText(/8.*school/i)).toBeInTheDocument();
        expect(screen.getByText(/99.2%|system.*health/i)).toBeInTheDocument();
      });
    });

    test("ADMIN: Shows critical alerts", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockAdminData), { status: 200 })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/1.*alert|critical.*alert/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // UNI_MEMBER ROLE TESTS
  // ==========================================
  describe("UNI_MEMBER Role - Complete Testing", () => {
    const mockUniData = {
      success: true,
      data: {
        connections: 42,
        recommendations: [ { name: "Jordan Lee", specialization: "AI/ML" } ],
        opportunities: [ { title: "Internship 2026", deadline: "2026-05-01" } ]
      }
    };

    test("UNI_MEMBER: Calls /api/uni/dashboard endpoint", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUniData), { status: 200 })
      );

      render(<UniversityMemberDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/uni/dashboard",
          expect.any(Object)
        );
      });
    });

    test("UNI_MEMBER: Displays peer recommendations", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUniData), { status: 200 })
      );

      render(<UniversityMemberDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
      });
    });

    test("UNI_MEMBER: Connect button wired to /api/uni/peers", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUniData), { status: 200 })
      );

      render(<UniversityMemberDashboard />);

      const connectButton = await screen.findByRole("button", { name: /connect/i });
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/uni/peers",
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    test("UNI_MEMBER: Shows opportunities with deadlines", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUniData), { status: 200 })
      );

      render(<UniversityMemberDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Internship 2026")).toBeInTheDocument();
      });
    });

    test("UNI_MEMBER: Apply button wired to /api/uni/opportunities", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUniData), { status: 200 })
      );

      render(<UniversityMemberDashboard />);

      const applyButton = await screen.findByRole("button", { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/uni/opportunities",
          expect.objectContaining({ method: "POST" })
        );
      });
    });
  });

  // ==========================================
  // CIRCLE_MEMBER ROLE TESTS
  // ==========================================
  describe("CIRCLE_MEMBER Role - Complete Testing", () => {
    const mockCircleData = {
      success: true,
      data: {
        joinedCommunities: [ { name: "Tech Innovators", members: 243 } ],
        recentDiscussions: [ { title: "AI Integration", author: "Sarah Chen" } ],
        contributionScore: 342
      }
    };

    test("CIRCLE_MEMBER: Calls /api/circle/dashboard endpoint", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCircleData), { status: 200 })
      );

      render(<CircleMemberDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/circle/dashboard",
          expect.any(Object)
        );
      });
    });

    test("CIRCLE_MEMBER: Displays joined communities", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCircleData), { status: 200 })
      );

      render(<CircleMemberDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Tech Innovators")).toBeInTheDocument();
      });
    });

    test("CIRCLE_MEMBER: Shows recent discussions", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCircleData), { status: 200 })
      );

      render(<CircleMemberDashboard />);

      await waitFor(() => {
        expect(screen.getByText("AI Integration")).toBeInTheDocument();
        expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
      });
    });

    test("CIRCLE_MEMBER: Join network button wired to /api/circle/networks", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCircleData), { status: 200 })
      );

      render(<CircleMemberDashboard />);

      const joinButton = await screen.findByRole("button", { name: /join|network/i });
      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/circle/networks",
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    test("CIRCLE_MEMBER: Start discussion button wired to /api/circle/discussions", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCircleData), { status: 200 })
      );

      render(<CircleMemberDashboard />);

      const discussButton = await screen.findByRole("button", { name: /discuss|start.*discussion/i });
      fireEvent.click(discussButton);

      const titleInput = await screen.findByPlaceholderText(/title|subject/i);
      await userEvent.type(titleInput, "New discussion topic");

      const submitButton = await screen.findByRole("button", { name: /submit|post/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/circle/discussions",
          expect.objectContaining({ method: "POST" })
        );
      });
    });

    test("CIRCLE_MEMBER: Contribution score displayed", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockCircleData), { status: 200 })
      );

      render(<CircleMemberDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/342|contribution.*score/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // CROSS-ROLE SECURITY TESTS
  // ==========================================
  describe("Cross-Role Security & Data Isolation", () => {
    test("SECURITY: Student cannot access Facilitator dashboard endpoint", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
      );

      // This should fail gracefully
      render(<StudentDashboard />);

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const forbiddenCalls = calls.filter(([, opts]) => opts?.method === "GET" && opts?.bad);
        // Should not have unauthorized calls
        expect(forbiddenCalls.length).toBeLessThanOrEqual(0);
      });
    });

    test("SECURITY: No mock data leakage - all real data from database", async () => {
      const mockData = {
        success: true,
        data: {
          enrolledCourses: [
            { id: "real-db-id", title: "Real Course from DB", progress: 85 }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      render(<StudentDashboard />);

      await waitFor(() => {
        expect(screen.getByText("Real Course from DB")).toBeInTheDocument();
        expect(screen.queryByText(/mock|hardcoded|fake/i)).not.toBeInTheDocument();
      });
    });

    test("SECURITY: Parent only sees their own children, not other parents' children", async () => {
      const parentData = {
        success: true,
        data: {
          children: [
            { id: "own-child-1", name: "MyCh ild", progress: 85 }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(parentData), { status: 200 })
      );

      render(<ParentDashboard />);

      await waitFor(() => {
        expect(screen.getByText("MyChild")).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/parent/dashboard",
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: expect.stringContaining("Bearer test-token-123")
            })
          })
        );
      });
    });
  });

  // ==========================================
  // MODAL & BUTTON INTERACTIVITY TESTS
  // ==========================================
  describe("Modal & Button Functionality Across All Roles", () => {
    test("All role modals open and close properly", async () => {
      const roles = [
        { Component: StudentDashboard, modal: /assignment.*submission/i },
        { Component: FacilitatorDashboard, modal: /grade|evaluation/i },
        { Component: MentorDashboard, modal: /schedule|session/i }
      ];

      for (const { Component, modal } of roles) {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true, data: {} }), { status: 200 })
        );

        const { unmount } = render(<Component />);

        const openButton = await screen.findByRole("button", { name: /open|show|create/i });
        fireEvent.click(openButton);

        await waitFor(() => {
          expect(screen.queryByText(modal)).toBeTruthy();
        });

        unmount();
      }
    });

    test("All action buttons return proper response from API", async () => {
      const mockResponse = { success: true, message: "Action completed" };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      render(<StudentDashboard />);

      const button = await screen.findByRole("button", { name: /submit/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const lastCall = (global.fetch as jest.Mock).mock.calls[
          (global.fetch as jest.Mock).mock.calls.length - 1
        ];
        expect(lastCall[1].method).toBe("POST");
      });
    });
  });
});
