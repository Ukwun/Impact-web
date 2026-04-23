/**
 * Parent Dashboard Component
 * Child progress monitoring, teacher communication, and learning insights
 * ImpactApp Platform - April 23, 2026
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// ========================================================================
// TYPES
// ========================================================================

interface ParentMetrics {
  greeting: string;
  childrenCount: number;
  averageChildProgress: number;
  totalAssignmentsPending: number;
}

interface ChildProgressMetrics {
  childId: string;
  childName: string;
  level: string;
  enrolledCourses: number;
  overallProgress: number;
  averageGrade: number;
  recentAssignments: Assignment[];
  upcomingEvents: Event[];
  achievements: Achievement[];
  lastActive: string;
  status: "EXCELLENT" | "GOOD" | "NEEDS_SUPPORT" | "CRITICAL";
}

interface Assignment {
  id: string;
  courseName: string;
  title: string;
  dueDate: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  grade?: number;
  feedback?: string;
}

interface Event {
  id: string;
  type: "LIVE_SESSION" | "DUE_DATE" | "EXAM" | "SUBMISSION_DEADLINE";
  title: string;
  date: string;
  courseName: string;
}

interface Achievement {
  id: string;
  title: string;
  courseName: string;
  earnedDate: string;
  icon: string;
}

interface ParentDashboardData {
  metrics: ParentMetrics;
  childrenProgress: ChildProgressMetrics[];
  recentNotifications: Notification[];
  weeklyReport?: WeeklyReport;
}

interface Notification {
  id: string;
  timestamp: string;
  type: "ASSIGNMENT" | "GRADE" | "ACHIEVEMENT" | "ATTENDANCE" | "MESSAGE";
  title: string;
  description: string;
  childName: string;
  actionUrl?: string;
}

interface WeeklyReport {
  week: string;
  summary: string;
  topEarnings: Achievement[];
  areasForImprovement: string[];
  teacherOutreach: boolean;
}

interface TeacherContactModal {
  isOpen: boolean;
  childId: string;
  childName: string;
  teacherId: string;
  teacherName: string;
}

// ========================================================================
// MAIN COMPONENT
// ========================================================================

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<ParentDashboardData | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [teacherContactModal, setTeacherContactModal] = useState<TeacherContactModal>({
    isOpen: false,
    childId: "",
    childName: "",
    teacherId: "",
    teacherName: "",
  });
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/dashboard");

      if (response.data.success && response.data.role === "PARENT") {
        setDashboard(response.data.dashboard);
        if (response.data.dashboard.childrenProgress.length > 0 && !selectedChild) {
          setSelectedChild(response.data.dashboard.childrenProgress[0].childId);
        }
      } else {
        setError("Unable to load parent dashboard");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // BUTTON HANDLERS
  // ========================================================================

  const handleViewAssignmentDetails = (assignment: Assignment) => {
    router.push(`/parent/assignments/${assignment.id}`);
  };

  const handleContactTeacher = (childId: string, teacherId: string) => {
    const child = dashboard?.childrenProgress.find((c) => c.childId === childId);
    if (child) {
      setTeacherContactModal({
        isOpen: true,
        childId,
        childName: child.childName,
        teacherId,
        teacherName: "Teacher", // Would be fetched from API
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setError("Message cannot be empty");
      return;
    }

    try {
      setSending(true);

      const response = await axios.post("/api/messages/send", {
        recipientId: teacherContactModal.teacherId,
        childId: teacherContactModal.childId,
        message: messageText,
      });

      if (response.data.success) {
        alert("Message sent to teacher");
        setTeacherContactModal({
          isOpen: false,
          childId: "",
          childName: "",
          teacherId: "",
          teacherName: "",
        });
        setMessageText("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleViewChildReport = (childId: string) => {
    router.push(`/parent/children/${childId}/report`);
  };

  const handleDownloadReport = async (childId: string) => {
    try {
      const response = await axios.post(
        `/api/parent/reports/${childId}/download`,
        {},
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${childId}-report-${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Error downloading report:", err);
      setError("Failed to download report");
    }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading your children's progress...</p>
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
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
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

  const { metrics, childrenProgress, recentNotifications, weeklyReport } = dashboard;
  const activeChild = childrenProgress.find((c) => c.childId === selectedChild);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{metrics.greeting}</h1>
              <p className="text-gray-600 mt-1">Monitor your children's learning journey</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold"
                data-button="refresh-dashboard"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
                data-button="logout"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Children" value={metrics.childrenCount} icon="👶" />
            <MetricCard
              label="Avg Progress"
              value={`${Math.round(metrics.averageChildProgress)}%`}
              icon="📈"
            />
            <MetricCard label="Pending Work" value={metrics.totalAssignmentsPending} icon="📝" />
            <MetricCard label="This Week" value="5 updates" icon="📊" />
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children Selector Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Children</h2>
            <div className="space-y-2">
              {childrenProgress.map((child) => (
                <button
                  key={child.childId}
                  onClick={() => setSelectedChild(child.childId)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedChild === child.childId
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-white text-gray-900 hover:bg-gray-50 border"
                  }`}
                  data-button="select-child"
                >
                  <h3 className="font-bold">{child.childName}</h3>
                  <p className="text-sm opacity-75">{child.level}</p>
                  <div
                    className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                      selectedChild === child.childId
                        ? "bg-white text-green-600"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {Math.round(child.overallProgress)}% Progress
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeChild && (
              <>
                {/* Child Overview */}
                <section className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{activeChild.childName}</h2>
                      <p className="text-gray-600">{activeChild.level}</p>
                    </div>
                    <span
                      className={`px-3 py-2 rounded-full font-semibold text-sm ${
                        activeChild.status === "EXCELLENT"
                          ? "bg-green-100 text-green-800"
                          : activeChild.status === "GOOD"
                            ? "bg-blue-100 text-blue-800"
                            : activeChild.status === "NEEDS_SUPPORT"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {activeChild.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-600 font-semibold">Overall Progress</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(activeChild.overallProgress)}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${activeChild.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <StatBox label="Courses" value={activeChild.enrolledCourses} />
                    <StatBox label="Avg Grade" value={`${activeChild.averageGrade.toFixed(1)}%`} />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => handleViewChildReport(activeChild.childId)}
                      className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                      data-button="view-child-report"
                      title="See detailed progress report"
                    >
                      📊 View Report
                    </button>
                    <button
                      onClick={() => handleDownloadReport(activeChild.childId)}
                      className="bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition font-semibold"
                      data-button="download-report"
                      title="Download as PDF"
                    >
                      📥 Download
                    </button>
                  </div>
                </section>

                {/* Recent Assignments */}
                {activeChild.recentAssignments.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Assignments</h3>
                    <div className="space-y-3">
                      {activeChild.recentAssignments.map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          onViewDetails={() => handleViewAssignmentDetails(assignment)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Upcoming Events */}
                {activeChild.upcomingEvents.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming</h3>
                    <div className="space-y-2">
                      {activeChild.upcomingEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Recent Achievements */}
                {activeChild.achievements.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {activeChild.achievements.map((achievement) => (
                        <AchievementBadge key={achievement.id} achievement={achievement} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>

        {/* Weekly Report */}
        {weeklyReport && (
          <section className="mt-8 bg-blue-50 rounded-lg border-l-4 border-blue-600 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Weekly Summary</h2>
            <p className="text-gray-700 mb-4">{weeklyReport.summary}</p>
            {weeklyReport.areasForImprovement.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-gray-900 mb-2">Areas for Improvement:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {weeklyReport.areasForImprovement.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Notifications */}
        {recentNotifications.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📬 Recent Updates</h2>
            <div className="space-y-3">
              {recentNotifications.slice(0, 6).map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Teacher Contact Modal */}
      {teacherContactModal.isOpen && (
        <TeacherMessageModal
          childName={teacherContactModal.childName}
          teacherName={teacherContactModal.teacherName}
          message={messageText}
          onMessageChange={setMessageText}
          onSend={handleSendMessage}
          onClose={() => setTeacherContactModal({ isOpen: false, childId: "", childName: "", teacherId: "", teacherName: "" })}
          isSending={sending}
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
  value: string | number;
  icon: string;
}

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border-b-2 border-green-600">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Assignment;
  onViewDetails: () => void;
}

function AssignmentCard({ assignment, onViewDetails }: AssignmentCardProps) {
  const isOverdue =
    assignment.status === "PENDING" &&
    new Date(assignment.dueDate) < new Date();

  return (
    <div className={`p-4 rounded-lg border ${isOverdue ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-gray-900">{assignment.title}</h4>
          <p className="text-sm text-gray-600">{assignment.courseName}</p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            assignment.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : assignment.status === "SUBMITTED"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
          }`}
        >
          {assignment.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Due: {new Date(assignment.dueDate).toLocaleDateString()}
      </p>
      {assignment.grade && (
        <p className="text-sm font-semibold text-green-600 mb-3">
          Grade: {assignment.grade}%
        </p>
      )}
      <button
        onClick={onViewDetails}
        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
        data-button="view-assignment"
      >
        View Details →
      </button>
    </div>
  );
}

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const icon = {
    LIVE_SESSION: "📹",
    DUE_DATE: "📅",
    EXAM: "✏️",
    SUBMISSION_DEADLINE: "📤",
  }[event.type];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{event.title}</h4>
        <p className="text-sm text-gray-600">{event.courseName}</p>
      </div>
      <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
    </div>
  );
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

function AchievementBadge({ achievement }: AchievementBadgeProps) {
  return (
    <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200 cursor-pointer hover:shadow-md transition">
      <div className="text-3xl mb-2">{achievement.icon}</div>
      <h4 className="font-bold text-gray-900 text-xs">{achievement.title}</h4>
      <p className="text-xs text-gray-600 mt-1">
        {new Date(achievement.earnedDate).toLocaleDateString()}
      </p>
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
}

function NotificationCard({ notification }: NotificationCardProps) {
  const icon = {
    ASSIGNMENT: "📝",
    GRADE: "✅",
    ACHIEVEMENT: "🏆",
    ATTENDANCE: "✋",
    MESSAGE: "💬",
  }[notification.type];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600">{notification.description}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.childName}</p>
        </div>
        <p className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

interface TeacherMessageModalProps {
  childName: string;
  teacherName: string;
  message: string;
  onMessageChange: (msg: string) => void;
  onSend: () => void;
  onClose: () => void;
  isSending: boolean;
}

function TeacherMessageModal({
  childName,
  teacherName,
  message,
  onMessageChange,
  onSend,
  onClose,
  isSending,
}: TeacherMessageModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Teacher</h2>
        <p className="text-gray-600 mb-2">
          Regarding: <strong>{childName}</strong>
        </p>
        <p className="text-gray-600 mb-6">To: <strong>{teacherName}</strong></p>

        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="How can we help your child succeed?"
          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none resize-none"
          rows={5}
          disabled={isSending}
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSending}
            className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50"
            data-button="cancel"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={!message.trim() || isSending}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
            data-button="send-message"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
