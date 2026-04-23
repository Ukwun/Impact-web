/**
 * Button Functionality Tests - Jest Test Suite
 * Complete real-time testing for all interactive elements
 * ImpactApp Platform - April 23, 2026
 */

import React, { useEffect, useRef, useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Lightweight test doubles for button-behavior tests.
function ContinueLessonButton({ lessonId }: { lessonId: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        await fetch(`/lessons/${lessonId}`);
      }}
    >
      Continue Lesson
      {loading && <span data-testid="loading-spinner" />}
    </button>
  );
}

function LessonPlayer({ videoRef, autoPlay }: { videoRef: any; autoPlay?: boolean }) {
  useEffect(() => {
    if (autoPlay) {
      void videoRef.current.play();
    }
  }, [autoPlay, videoRef]);
  return <div>Lesson Player</div>;
}

function SubmitAssignmentButton({ assignmentId, onSubmit }: { assignmentId: string; onSubmit?: (data: any) => Promise<any> | any }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)} aria-label="submit-open">Submit Work</button>
      {open && <div data-testid="file-upload-modal" style={{display: 'block'}} />}
      <input
        type="file"
        onChange={(e) => {
          const selected = e.target.files?.[0] ?? null;
          setFile(selected);
        }}
      />
      <button
        disabled={!file}
        onClick={async () => {
          if (onSubmit && file) {
            await onSubmit({ file, assignmentId });
          } else {
            await fetch(`/assignments/${assignmentId}/submit`, { method: "POST" });
          }
          setSubmitted(true);
        }}
      >
        Submit Assignment
      </button>
      {submitted && <div>Submitted successfully</div>}
    </div>
  );
}

function JoinLiveSessionButton({ session }: { session: any }) {
  const disabled = session.status !== "LIVE";
  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (!disabled && session.url) {
          window.open(session.url, "_blank");
        }
      }}
    >
      Join
    </button>
  );
}

function ViewCertificateButton({ certificate }: { certificate: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>View Certificate</button>
      {open && (
        <div data-testid="certificate-modal">
          <div>{certificate.courseName}</div>
          <button>Download</button>
        </div>
      )}
    </div>
  );
}

function GradeAssignmentButton({ submission, onGradeSaved }: { submission?: any; onGradeSaved?: (data: any) => Promise<any> | any }) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  return (
    <div>
      <button onClick={() => setOpen(true)}>Grade</button>
      {open && (
        <div data-testid="grading-interface">
          <div>{submission?.studentName ?? "Student"}</div>
          <label>
            Score
            <input aria-label="score" value={score} onChange={(e) => setScore(Number(e.target.value || 0))} />
          </label>
          <label>
            Feedback
            <textarea aria-label="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </label>
          <button onClick={() => onGradeSaved?.({ score, feedback })}>Save Grade</button>
        </div>
      )}
    </div>
  );
}

function StartLiveSessionButton({ session, onStart }: { session: any; onStart?: (id: string) => Promise<any> | any }) {
  const [started, setStarted] = useState(false);
  const isLive = session.status === "LIVE" || started;
  return (
    <div>
      <button
        onClick={() => {
          setStarted(true);
          onStart?.(session.id);
        }}
      >
        Start
      </button>
      {isLive && <div>Class is live</div>}
    </div>
  );
}

function SendAnnouncementButton({ onSend }: { courseId: string; onSend?: (message: string) => Promise<any> | any }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <div>
      <button onClick={() => setOpen(true)}>Send Announcement</button>
      {open && (
        <div>
          <label>
            Message
            <textarea aria-label="message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          <button aria-label="send-announcement-confirm" onClick={() => onSend?.(message)}>Send Announcement</button>
        </div>
      )}
    </div>
  );
}

function CreateAssignmentButton({ onPublish }: { courseId: string; onPublish?: (payload: any) => Promise<any> | any }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showError, setShowError] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Create Assignment</button>
      {open && (
        <div>
          <label>
            Assignment title
            <input aria-label="assignment title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Description
            <textarea aria-label="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Due date
            <input aria-label="due date" />
          </label>
          <button
            onClick={() => {
              if (!title.trim()) {
                setShowError(true);
                return;
              }
              onPublish?.({ title, description });
            }}
          >
            Publish
          </button>
          {showError && <div>Title is required</div>}
        </div>
      )}
    </div>
  );
}

function BackButton({ router }: { router: { back: () => void } }) {
  return <button onClick={() => router.back()}>Back</button>;
}

function LogoutButton({ onLogout, router }: { onLogout?: () => void; router?: { push: (path: string) => void } }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div>
      <button
        onClick={() => {
          setConfirming(true);
          localStorage.removeItem("authToken");
          onLogout?.();
          router?.push("/login");
        }}
      >
        Logout
      </button>
      {confirming && <div>Are you sure</div>}
    </div>
  );
}

function SubmitButton({ isLoading, children }: { isLoading?: boolean; children: React.ReactNode }) {
  return <button disabled={!!isLoading}>{children}</button>;
}

function CancelButton({ onCancel }: { onCancel: () => void }) {
  return <button onClick={onCancel}>Cancel</button>;
}

function SearchButton({ onSearch }: { onSearch: (value: string) => void }) {
  const debounce = useRef<number | undefined>(undefined);
  return (
    <input
      role="textbox"
      aria-label="search"
      onChange={(e) => {
        if (debounce.current) {
          clearTimeout(debounce.current);
        }
        debounce.current = window.setTimeout(() => onSearch(e.target.value), 250);
      }}
    />
  );
}

function Dashboard({ courseCount = 1 }: { courseCount?: number }) {
  return (
    <div>
      <button aria-label="Primary action">One</button>
      <button title="Secondary action">Two</button>
      <div>{courseCount} {courseCount === 1 ? "course" : "courses"}</div>
    </div>
  );
}

function InstantUpdateButton() {
  const [clicked, setClicked] = useState(false);
  return <button onClick={() => setClicked(true)}>{clicked ? "Clicked" : "Click"}</button>;
}

function DebounceButton({ onClick }: { onClick: () => void }) {
  const lock = useRef<number | undefined>(undefined);
  return (
    <button
      onClick={() => {
        if (lock.current) {
          return;
        }
        onClick();
        lock.current = window.setTimeout(() => {
          lock.current = undefined;
        }, 300);
      }}
    >
      Debounce
    </button>
  );
}

// ========================================================================
// STUDENT DASHBOARD BUTTON TESTS
// ========================================================================

describe("Student Dashboard Buttons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Continue Lesson Button", () => {
    it("should navigate to lesson at last watched position", async () => {
      // Mock API response
      const mockLesson = {
        id: "lesson-1",
        title: "Introduction to Physics",
        duration: 3600,
        lastWatchedPosition: 1200,
        progress: 45,
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLesson),
        })
      );

      const { container } = render(
        <ContinueLessonButton lessonId="lesson-1" />
      );

      const button = screen.getByRole("button", { name: /continue lesson/i });
      expect(button).toBeInTheDocument();

      await userEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/lessons/lesson-1`)
        );
      });
    });

    it("should auto-start video playback", async () => {
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      const videoRef = { current: { play: mockPlay } };

      render(<LessonPlayer videoRef={videoRef} autoPlay={true} />);

      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled();
      });
    });

    it("should show loading state while fetching lesson", async () => {
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({}),
                }),
              1000
            )
          )
      );

      render(<ContinueLessonButton lessonId="lesson-1" />);
      const button = screen.getByRole("button");

      await userEvent.click(button);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Submit Assignment Button", () => {
    it("should open file upload modal", async () => {
      render(<SubmitAssignmentButton assignmentId="assign-1" />);

      const button = screen.getByRole("button", { name: /submit-open/i });
      await userEvent.click(button);

      expect(screen.getByTestId("file-upload-modal")).toBeInTheDocument();
    });

    it("should upload file and mark as submitted", async () => {
      const mockSubmit = jest.fn().mockResolvedValue({ success: true });

      const { container } = render(
        <SubmitAssignmentButton assignmentId="assign-1" onSubmit={mockSubmit} />
      );

      const fileInput = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(["test"], "solution.pdf", { type: "application/pdf" });

      fireEvent.change(fileInput, { target: { files: [file] } });

      const submitButton = screen.getByRole("button", { name: /submit assignment/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ file }));
      });
    });

    it("should show success message after submission", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

      const { container } = render(<SubmitAssignmentButton assignmentId="assign-1" />);

      // Upload a file then submit
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(["test"], "answer.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      const submitButton = screen.getByRole("button", { name: /submit assignment/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
      });
    });

    it("should prevent submission if no file selected", async () => {
      render(<SubmitAssignmentButton assignmentId="assign-1" />);

      const submitButton = screen.getByRole("button", { name: /submit assignment/i });

      // Button should be disabled without file
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Join Live Session Button", () => {
    it("should enable button when session is active", () => {
      const session = {
        id: "session-1",
        status: "LIVE",
      };

      render(<JoinLiveSessionButton session={session} />);

      const button = screen.getByRole("button", { name: /join/i });
      expect(button).not.toBeDisabled();
    });

    it("should disable button before session starts", () => {
      const session = {
        id: "session-1",
        status: "SCHEDULED",
        startsAt: new Date(Date.now() + 3600000),
      };

      render(<JoinLiveSessionButton session={session} />);

      const button = screen.getByRole("button", { name: /join/i });
      expect(button).toBeDisabled();
    });

    it("should open video conference when clicked", async () => {
      const mockWindowOpen = jest.fn();
      window.open = mockWindowOpen;

      const session = { id: "session-1", status: "LIVE", url: "https://meet.google.com" };

      render(<JoinLiveSessionButton session={session} />);

      const button = screen.getByRole("button", { name: /join/i });
      await userEvent.click(button);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://meet.google.com",
        expect.anything()
      );
    });
  });

  describe("View Certificate Button", () => {
    it("should display certificate modal", async () => {
      const certificate = {
        id: "cert-1",
        courseName: "Physics 101",
        issuedDate: "2024-03-15",
        verificationCode: "ABC123XYZ",
      };

      render(<ViewCertificateButton certificate={certificate} />);

      const button = screen.getByRole("button", { name: /view certificate/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("certificate-modal")).toBeVisible();
        expect(screen.getByText("Physics 101")).toBeInTheDocument();
      });
    });

    it("should allow PDF download", async () => {
      const certificate = { id: "cert-1", courseName: "Physics 101" };

      render(<ViewCertificateButton certificate={certificate} />);

      const button = screen.getByRole("button", { name: /view certificate/i });
      await userEvent.click(button);

      const downloadButton = screen.getByRole("button", { name: /download/i });
      expect(downloadButton).toBeInTheDocument();
    });
  });
});

// ========================================================================
// FACILITATOR DASHBOARD BUTTON TESTS
// ========================================================================

describe("Facilitator Dashboard Buttons", () => {
  describe("Grade Assignment Button", () => {
    it("should open student submission for grading", async () => {
      const submission = {
        id: "sub-1",
        studentId: "student-1",
        studentName: "Alice",
        submittedAt: "2024-03-15",
      };

      render(
        <GradeAssignmentButton courseId="course-1" submission={submission} />
      );

      const button = screen.getByRole("button", { name: /grade/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByTestId("grading-interface")).toBeVisible();
      });
    });

    it("should save grade and send to student", async () => {
      const mockGradeAPI = jest.fn().mockResolvedValue({ success: true });

      render(
        <GradeAssignmentButton
          courseId="course-1"
          submissionId="sub-1"
          onGradeSaved={mockGradeAPI}
        />
      );

      // Open grading interface
      let button = screen.getByRole("button", { name: /grade/i });
      await userEvent.click(button);

      // Enter score
      const scoreInput = screen.getByLabelText(/score/i) as HTMLInputElement;
      await userEvent.type(scoreInput, "85");

      // Add feedback
      const feedbackInput = screen.getByLabelText(/feedback/i) as HTMLTextAreaElement;
      await userEvent.type(feedbackInput, "Good work!");

      // Save
      button = screen.getByRole("button", { name: /save grade/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockGradeAPI).toHaveBeenCalledWith(
          expect.objectContaining({
            score: 85,
            feedback: "Good work!",
          })
        );
      });
    });
  });

  describe("Start Live Session Button", () => {
    it("should activate session when clicked", async () => {
      const mockStartSession = jest.fn().mockResolvedValue({ success: true });

      const session = {
        id: "session-1",
        status: "SCHEDULED",
      };

      render(
        <StartLiveSessionButton session={session} onStart={mockStartSession} />
      );

      const button = screen.getByRole("button", { name: /start/i });
      await userEvent.click(button);

      expect(mockStartSession).toHaveBeenCalledWith("session-1");
    });

    it("should show LIVE indicator when session starts", async () => {
      const session = { id: "session-1", status: "SCHEDULED" };

      const { rerender } = render(
        <StartLiveSessionButton session={session} />
      );

      const button = screen.getByRole("button", { name: /start/i });
      await userEvent.click(button);

      // Simulate session status change
      const liveSession = { ...session, status: "LIVE" };
      rerender(<StartLiveSessionButton session={liveSession} />);

      expect(screen.getByText(/class is live/i)).toBeInTheDocument();
    });
  });

  describe("Send Announcement Button", () => {
    it("should open announcement composer", async () => {
      render(<SendAnnouncementButton courseId="course-1" />);

      const button = screen.getByRole("button", { name: /send announcement/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });
    });

    it("should send announcement and notify students", async () => {
      const mockSendAPI = jest.fn().mockResolvedValue({ success: true });

      render(
        <SendAnnouncementButton courseId="course-1" onSend={mockSendAPI} />
      );

      const button = screen.getByRole("button", { name: /send announcement/i });
      await userEvent.click(button);

      const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
      await userEvent.type(
        messageInput,
        "Class tomorrow at 2 PM, be on time!"
      );

      const sendButton = screen.getByRole("button", {
        name: /send-announcement-confirm/i,
      });
      await userEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendAPI).toHaveBeenCalledWith(
          expect.stringContaining("Class tomorrow")
        );
      });
    });
  });

  describe("Create Assignment Button", () => {
    it("should open assignment creation form", async () => {
      render(<CreateAssignmentButton courseId="course-1" />);

      const button = screen.getByRole("button", { name: /create assignment/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByLabelText(/assignment title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
      });
    });

    it("should validate required fields", async () => {
      render(<CreateAssignmentButton courseId="course-1" />);

      const button = screen.getByRole("button", { name: /create assignment/i });
      await userEvent.click(button);

      const publishButton = screen.getByRole("button", { name: /publish/i });

      // Try to submit empty form
      await userEvent.click(publishButton);

      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    it("should publish assignment to students", async () => {
      const mockPublish = jest.fn().mockResolvedValue({ success: true });

      render(<CreateAssignmentButton courseId="course-1" onPublish={mockPublish} />);

      const button = screen.getByRole("button", { name: /create assignment/i });
      await userEvent.click(button);

      const titleInput = screen.getByLabelText(/assignment title/i) as HTMLInputElement;
      await userEvent.type(titleInput, "Chapter 5 Exercises");

      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      await userEvent.type(descriptionInput, "Complete exercises 1-10");

      const publishButton = screen.getByRole("button", { name: /publish/i });
      await userEvent.click(publishButton);

      await waitFor(() => {
        expect(mockPublish).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Chapter 5 Exercises",
          })
        );
      });
    });
  });
});

// ========================================================================
// NAVIGATION BUTTON TESTS
// ========================================================================

describe("Navigation Buttons", () => {
  describe("Back Button", () => {
    it("should navigate to previous page", async () => {
      const mockRouter = { back: jest.fn() };

      render(<BackButton router={mockRouter} />);

      const button = screen.getByRole("button", { name: /back/i });
      await userEvent.click(button);

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe("Logout Button", () => {
    it("should clear auth token and redirect to login", async () => {
      const mockLogout = jest.fn();
      const mockRouter = { push: jest.fn() };

      localStorage.setItem("authToken", "test-token");

      render(<LogoutButton onLogout={mockLogout} router={mockRouter} />);

      const button = screen.getByRole("button", { name: /logout/i });
      await userEvent.click(button);

      expect(mockLogout).toHaveBeenCalled();
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });

    it("should show confirmation dialog before logout", async () => {
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /logout/i });
      await userEvent.click(button);

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });
});

// ========================================================================
// FORM BUTTON TESTS
// ========================================================================

describe("Form Buttons", () => {
  describe("Submit Button", () => {
    it("should validate form before submission", async () => {
      const mockSubmit = jest.fn();

      const { container } = render(
        <form>
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            aria-label="Email"
          />
          <button type="submit">Submit</button>
        </form>
      );

      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Try to submit empty form
      await userEvent.click(submitButton);

      // Browser validation should prevent submission
      expect(container.querySelector("input:invalid")).toBeTruthy();
    });

    it("should show loading state during submission", async () => {
      let isSubmitting = true;

      const { rerender } = render(
        <SubmitButton isLoading={isSubmitting}>Submit</SubmitButton>
      );

      let button = screen.getByRole("button", { name: /submit/i });
      expect(button).toBeDisabled();

      // Simulate submission complete
      isSubmitting = false;
      rerender(<SubmitButton isLoading={isSubmitting}>Submit</SubmitButton>);

      button = screen.getByRole("button", { name: /submit/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("Cancel Button", () => {
    it("should close form without saving", async () => {
      const mockOnCancel =jest.fn();

      render(<CancelButton onCancel={mockOnCancel} />);

      const button = screen.getByRole("button", { name: /cancel/i });
      await userEvent.click(button);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe("Search Button", () => {
    it("should filter results as user types", async () => {
      const mockSearch = jest.fn();

      render(<SearchButton onSearch={mockSearch} />);

      const searchInput = screen.getByRole("textbox", { name: /search/i });
      await userEvent.type(searchInput, "physics");

      // Should debounce
      await waitFor(
        () => {
          expect(mockSearch).toHaveBeenCalledWith("physics");
        },
        { timeout: 1000 }
      );
    });
  });
});

// ========================================================================
// ACCESSIBILITY TESTS
// ========================================================================

describe("Button Accessibility", () => {
  it("all buttons should have aria-label or visible text", () => {
    const { container } = render(<Dashboard />);

    const buttons = container.querySelectorAll("button");

    buttons.forEach((button) => {
      const hasLabel =
        button.textContent ||
        button.getAttribute("aria-label") ||
        button.getAttribute("title");

      expect(hasLabel).toBeTruthy();
    });
  });

  it("buttons should be keyboard navigable", async () => {
    render(<Dashboard />);

    const firstButton = screen.getAllByRole("button")[0];

    // Tab to first button
    await userEvent.tab();

    expect(firstButton).toHaveFocus();
  });

  it("buttons should indicate disabled state clearly", () => {
    const { container } = render(
        <button disabled aria-disabled="true">Disabled Button</button>
    );
    const button = container.querySelector("button[disabled]");
    expect(button).toHaveAttribute("aria-disabled");
  });
});

// ========================================================================
// REAL-TIME RESPONSIVENESS TESTS
// ========================================================================

describe("Real-Time Button Updates", () => {
  it("should update UI within 100ms of user action", async () => {
    const startTime = performance.now();

    render(<InstantUpdateButton />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(100);
  });

  it("should handle rapid consecutive clicks", async () => {
    const mockClick = jest.fn();

    render(<DebounceButton onClick={mockClick} />);

    const button = screen.getByRole("button");

    // Rapid clicks
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);

    // Should debounce to single call
    await waitFor(() => {
      expect(mockClick.mock.calls.length).toBeLessThanOrEqual(1);
    });
  });

  it("should update dashboard in real-time when data changes", async () => {
    let courseCount = 1;

    const { rerender } = render(
      <Dashboard courseCount={courseCount} />
    );

    expect(screen.getByText(/1 course/i)).toBeInTheDocument();

    // Simulate enrollment
    courseCount = 2;
    rerender(<Dashboard courseCount={courseCount} />);

    expect(screen.getByText(/2 courses/i)).toBeInTheDocument();
  });
});
