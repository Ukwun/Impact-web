/**
 * Facilitator Dashboard Component
 * Real-time classroom management with live metrics and student tracking
 * ImpactApp Platform - April 23, 2026
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// ========================================================================
// TYPES
// ========================================================================

interface CourseMetrics {
  courseId: string;
  courseName: string;
  studentCount: number;
  averageProgress: number;
  completionRate: number;
  atRiskCount: number;
  recentSubmissions: number;
  pendingGrades: number;
}

interface StudentSnapshot {
  id: string;
  name: string;
  email: string;
  courseProgress: number;
  lastActive: string;
  submissionCount: number;
  averageGrade: number;
  status: "ACTIVE" | "AT_RISK" | "STRUGGLING" | "EXCELLENT";
}

interface LiveSessionData {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
  startTime: string;
  endTime?: string;
  participantCount: number;
  maxParticipants: number;
  recordingUrl?: string;
}

interface PendingSubmission {
  id: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  daysAgo: number;
  status: "PENDING" | "IN_REVIEW" | "GRADED";
}

interface FacilitatorMetrics {
  greeting: string;
  activeCourses: number;
  totalStudents: number;
  pendingGrades: number;
  liveSessionsThisWeek: number;
  averageClassEngagement: number;
  studentAttendanceRate: number;
}

interface DashboardData {
  metrics: FacilitatorMetrics;
  courseMetrics: CourseMetrics[];
  liveSessionsUpcoming: LiveSessionData[];
  liveSessionsActive: LiveSessionData[];
  pendingSubmissions: PendingSubmission[];
  studentMetrics: StudentSnapshot[];
  activityFeed: ActivityLog[];
}

interface ActivityLog {
  id: string;
  timestamp: string;
  type: "SUBMISSION" | "GRADE" | "ATTENDANCE" | "MESSAGE" | "SESSION_START";
  description: string;
  studentName?: string;
  courseName?: string;
}

interface AnnouncementModal {
  isOpen: boolean;
  courseId: string;
  courseName: string;
}

interface GradingModal {
  isOpen: boolean;
  submissionId: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
}

// ========================================================================
// MAIN COMPONENT
// ========================================================================

export default function FacilitatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [announcementModal, setAnnouncementModal] = useState<AnnouncementModal>({
    isOpen: false,
    courseId: "",
    courseName: "",
  });
  const [gradingModal, setGradingModal] = useState<GradingModal>({
    isOpen: false,
    submissionId: "",
    studentId: "",
    studentName: "",
    assignmentTitle: "",
  });
  const [gradingData, setGradingData] = useState({
    score: 0,
    feedback: "",
    rubricScores: {} as Record<string, number>,
  });
  const [announcementText, setAnnouncementText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboard();
  }, []);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/dashboard");

      if (response.data.success && response.data.role === "FACILITATOR") {
        setDashboard(response.data.dashboard);
      } else {
        setError("Unable to load facilitator dashboard");
      }
    } catch (err) {
      console.error("Error loading facilitator dashboard:", err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // BUTTON HANDLERS
  // ========================================================================

  const handleGradeAssignment = (submission: PendingSubmission) => {
    setGradingModal({
      isOpen: true,
      submissionId: submission.id,
      studentId: submission.studentId,
      studentName: submission.studentName,
      assignmentTitle: submission.assignmentTitle,
    });
    setGradingData({
      score: 0,
      feedback: "",
      rubricScores: {},
    });
  };

  const handleSubmitGrade = async () => {
    if (gradingData.score < 0 || gradingData.score > 100) {
      setError("Score must be between 0 and 100");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post("/api/assignments/grade", {
        submissionId: gradingModal.submissionId,
        score: gradingData.score,
        feedback: gradingData.feedback,
        rubricScores: gradingData.rubricScores,
      });

      if (response.data.success) {
        // Close modal and reload
        setGradingModal({ ...gradingModal, isOpen: false });
        alert(`Grade saved for ${gradingModal.studentName}`);
        loadDashboard();
      }
    } catch (err) {
      console.error("Error saving grade:", err);
      setError("Failed to save grade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) {
      setError("Announcement cannot be empty");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post("/api/courses/announcement", {
        courseId: announcementModal.courseId,
        message: announcementText,
        sentAt: new Date(),
      });

      if (response.data.success) {
        setAnnouncementModal({ isOpen: false, courseId: "", courseName: "" });
        setAnnouncementText("");
        alert("Announcement sent to all students");
        loadDashboard();
      }
    } catch (err) {
      console.error("Error sending announcement:", err);
      setError("Failed to send announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartSession = (session: LiveSessionData) => {
    if (session.status === "LIVE") {
      // Open video conference
      window.open(`/live-session/${session.id}`, "livesession", "width=1200,height=800");
    } else {
      router.push(`/facilitator/sessions/${session.id}/start`);
    }
  };

  const handleCreateAssignment = () => {
    router.push("/facilitator/assignments/create");
  };

  const handleViewAnalytics = (courseId: string) => {
    router.push(`/facilitator/courses/${courseId}/analytics`);
  };

  const handleViewStudentDetails = (studentId: string) => {
    router.push(`/facilitator/students/${studentId}`);
  };

  const handleRefresh = async () => {
    await loadDashboard();
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      router.push("/login");
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading your classroom...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            data-button="retry"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { metrics, courseMetrics, liveSessionsActive, liveSessionsUpcoming, pendingSubmissions, studentMetrics, activityFeed } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{metrics.greeting}</h1>
            <p className="text-gray-600 mt-1">Manage your classrooms and students</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              data-button="refresh-dashboard"
              title="Refresh data"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              data-button="logout"
              title="End your session"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Active Courses" value={metrics.activeCourses} icon="📚" />
          <MetricCard label="Total Students" value={metrics.totalStudents} icon="👥" />
          <MetricCard label="Pending Grades" value={metrics.pendingGrades} icon="📝" />
          <MetricCard
            label="Class Engagement"
            value={`${Math.round(metrics.averageClassEngagement)}%`}
            icon="📊"
          />
        </div>

        {/* Live Sessions Section */}
        {liveSessionsActive.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔴 Live Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSessionsActive.map((session) => (
                <div
                  key={session.id}
                  className="bg-red-50 border-2 border-red-300 rounded-lg p-4 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-600">{session.courseName}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                      LIVE
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {session.participantCount} / {session.maxParticipants} participants
                  </p>
                  <button
                    onClick={() => handleStartSession(session)}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    data-button="join-live-session"
                    title="Join the live session"
                  >
                    📹 Join Session
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Course Metrics Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseMetrics.map((course) => (
              <CourseMetricsCard
                key={course.courseId}
                course={course}
                onViewAnalytics={() => handleViewAnalytics(course.courseId)}
                onCreateAssignment={handleCreateAssignment}
                onAnnouncement={() =>
                  setAnnouncementModal({
                    isOpen: true,
                    courseId: course.courseId,
                    courseName: course.courseName,
                  })
                }
              />
            ))}
          </div>
        </section>

        {/* Pending Submissions */}
        {pendingSubmissions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pending Grades ({pendingSubmissions.length})
            </h2>
            <div className="space-y-3">
              {pendingSubmissions.slice(0, 5).map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onGrade={() => handleGradeAssignment(submission)}
                />
              ))}
            </div>
            {pendingSubmissions.length > 5 && (
              <div className="mt-4">
                <Link
                  href="/facilitator/submissions"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  View all {pendingSubmissions.length} submissions →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Upcoming Live Sessions */}
        {liveSessionsUpcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSessionsUpcoming.map((session) => (
                <UpcomingSessionCard
                  key={session.id}
                  session={session}
                  onStart={() => handleStartSession(session)}
                />
              ))}
            </div>
          </section>
        )}

        {/* At-Risk Students */}
        {studentMetrics.filter((s) => s.status === "AT_RISK" || s.status === "STRUGGLING").length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⚠️ Students Needing Support</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
              <div className="space-y-3">
                {studentMetrics
                  .filter((s) => s.status === "AT_RISK" || s.status === "STRUGGLING")
                  .map((student) => (
                    <StudentRiskCard
                      key={student.id}
                      student={student}
                      onViewDetails={() => handleViewStudentDetails(student.id)}
                    />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Activity Feed */}
        {activityFeed.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                {activityFeed.slice(0, 8).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Announcement Modal */}
      {announcementModal.isOpen && (
        <AnnouncementModal
          courseId={announcementModal.courseId}
          courseName={announcementModal.courseName}
          message={announcementText}
          onMessageChange={setAnnouncementText}
          onSend={handleSendAnnouncement}
          onClose={() => setAnnouncementModal({ isOpen: false, courseId: "", courseName: "" })}
          isLoading={submitting}
        />
      )}

      {/* Grading Modal */}
      {gradingModal.isOpen && (
        <GradingModal
          submission={gradingModal}
          score={gradingData.score}
          feedback={gradingData.feedback}
          onScoreChange={(score) => setGradingData({ ...gradingData, score })}
          onFeedbackChange={(feedback) => setGradingData({ ...gradingData, feedback })}
          onSubmit={handleSubmitGrade}
          onClose={() => setGradingModal({ ...gradingModal, isOpen: false })}
          isLoading={submitting}
        />
      )}
    </div>
  );
}

// ========================================================================
// SUB-COMPONENTS
// ========================================================================

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: string;
}

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface CourseMetricsCardProps {
  course: CourseMetrics;
  onViewAnalytics: () => void;
  onCreateAssignment: () => void;
  onAnnouncement: () => void;
}

function CourseMetricsCard({
  course,
  onViewAnalytics,
  onCreateAssignment,
  onAnnouncement,
}: CourseMetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{course.courseName}</h3>

      <div className="space-y-3 mb-6">
        <MetricRow label="Students" value={`${course.studentCount}`} />
        <MetricRow label="Avg Progress" value={`${Math.round(course.averageProgress)}%`} />
        <MetricRow label="Completion Rate" value={`${Math.round(course.completionRate)}%`} />
        <MetricRow label="At Risk" value={`${course.atRiskCount}`} color="text-red-600" />
        <MetricRow label="Pending Grades" value={`${course.pendingGrades}`} color="text-yellow-600" />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onViewAnalytics}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
          data-button="view-analytics"
          title="See class metrics"
        >
          📊 Analytics
        </button>
        <button
          onClick={onAnnouncement}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
          data-button="send-announcement"
          title="Broadcast message"
        >
          📢 Announce
        </button>
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
  color?: string;
}

function MetricRow({ label, value, color = "text-gray-900" }: MetricRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

interface SubmissionCardProps {
  submission: PendingSubmission;
  onGrade: () => void;
}

function SubmissionCard({ submission, onGrade }: SubmissionCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{submission.studentName}</h4>
          <p className="text-sm text-gray-600">{submission.assignmentTitle}</p>
          <p className="text-xs text-gray-500 mt-1">Submitted {submission.daysAgo} days ago</p>
        </div>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
          PENDING
        </span>
      </div>
      <button
        onClick={onGrade}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold text-sm"
        data-button="grade-assignment"
        title={`Grade ${submission.studentName}'s work`}
      >
        ✏️ Grade Now
      </button>
    </div>
  );
}

interface UpcomingSessionCardProps {
  session: LiveSessionData;
  onStart: () => void;
}

function UpcomingSessionCard({ session, onStart }: UpcomingSessionCardProps) {
  const startTime = new Date(session.startTime);
  const isWithin1Hour = (startTime.getTime() - Date.now()) < 3600000;

  return (
    <div className="bg-white rounded-lg p-4 border border-blue-200">
      <h4 className="font-bold text-gray-900">{session.title}</h4>
      <p className="text-sm text-gray-600">{session.courseName}</p>
      <p className="text-xs text-gray-500 mt-2">
        📅 {startTime.toLocaleString()}
      </p>
      <button
        onClick={onStart}
        disabled={!isWithin1Hour}
        className={`w-full mt-3 py-2 rounded-lg transition font-semibold text-sm ${
          isWithin1Hour
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-500 cursor-not-allowed"
        }`}
        data-button="start-session"
        title={isWithin1Hour ? "Start the session" : "Session starts in more than 1 hour"}
      >
        {isWithin1Hour ? "▶️ Start Now" : "⏰ Not Ready Yet"}
      </button>
    </div>
  );
}

interface StudentRiskCardProps {
  student: StudentSnapshot;
  onViewDetails: () => void;
}

function StudentRiskCard({ student, onViewDetails }: StudentRiskCardProps) {
  const statusColor =
    student.status === "STRUGGLING"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded mb-3">
      <div>
        <h4 className="font-bold text-gray-900">{student.name}</h4>
        <p className="text-sm text-gray-600">
          Progress: {Math.round(student.courseProgress)}% | Grade: {student.averageGrade.toFixed(1)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {student.status}
        </span>
        <button
          onClick={onViewDetails}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
          data-button="view-student"
          title={`See ${student.name}'s progress`}
        >
          View
        </button>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: ActivityLog;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const time = new Date(activity.timestamp);
  const isRecent = Date.now() - time.getTime() < 3600000; // Last hour

  const icon = {
    SUBMISSION: "📤",
    GRADE: "✅",
    ATTENDANCE: "✋",
    MESSAGE: "💬",
    SESSION_START: "🎬",
  }[activity.type];

  return (
    <div className={`p-4 ${isRecent ? "bg-blue-50" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="text-gray-900 font-semibold">{activity.description}</p>
          {activity.studentName && (
            <p className="text-sm text-gray-600">{activity.studentName}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{time.toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}

// ========================================================================
// MODALS
// ========================================================================

interface AnnouncementModalProps {
  courseId: string;
  courseName: string;
  message: string;
  onMessageChange: (msg: string) => void;
  onSend: () => void;
  onClose: () => void;
  isLoading: boolean;
}

function AnnouncementModal({
  courseId,
  courseName,
  message,
  onMessageChange,
  onSend,
  onClose,
  isLoading,
}: AnnouncementModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Announcement</h2>
        <p className="text-gray-600 mb-4">To: <strong>{courseName}</strong></p>

        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your announcement..."
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-600 focus:outline-none resize-none"
          rows={5}
          disabled={isLoading}
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50"
            data-button="cancel"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={!message.trim() || isLoading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
            data-button="send-announcement-confirm"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface GradingModalProps {
  submission: GradingModal;
  score: number;
  feedback: string;
  onScoreChange: (score: number) => void;
  onFeedbackChange: (feedback: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isLoading: boolean;
}

function GradingModal({
  submission,
  score,
  feedback,
  onScoreChange,
  onFeedbackChange,
  onSubmit,
  onClose,
  isLoading,
}: GradingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 my-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Grade Assignment</h2>
        <p className="text-gray-600 mb-4">{submission.studentName}</p>
        <p className="text-sm text-gray-500 mb-6">{submission.assignmentTitle}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Score (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => onScoreChange(parseInt(e.target.value) || 0)}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-600 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
              placeholder="Great work! Here's what you did well..."
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-600 focus:outline-none resize-none"
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50"
            data-button="cancel"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading || score === 0}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-400"
            data-button="submit-grade"
          >
            {isLoading ? "Saving..." : "Save Grade"}
          </button>
        </div>
      </div>
    </div>
  );
}
