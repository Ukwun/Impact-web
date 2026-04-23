/**
 * Enhanced Student Dashboard Component
 * Complete with all button functionality and real-time updates
 * ImpactApp Platform - April 23, 2026
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

interface DashboardData {
  greeting: string;
  currentAction: string;
  activeCourses: Course[];
  overallProgress: number;
  learningStreak: number;
  pendingAssignments: Assignment[];
  recentAchievements: Achievement[];
  leaderboardRank: number;
  nextLiveSessions: LiveSession[];
  stats: {
    hoursLearned: number;
    tasksCompleted: number;
    certificatesEarned: number;
    badgesEarned: number;
  };
}

interface Course {
  id: string;
  title: string;
  progress: number;
  currentLesson: {
    id: string;
    title: string;
    watchedSeconds: number;
    totalSeconds: number;
  };
  facilitator: {
    id: string;
    name: string;
  };
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  courseName: string;
}

interface Achievement {
  id: string;
  type: "BADGE" | "CERTIFICATE";
  title: string;
  courseName: string;
  earnedDate: string;
  icon: string;
}

interface LiveSession {
  id: string;
  title: string;
  facilitatorName: string;
  startsAt: string; 
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
  meetingUrl?: string;
}

interface AllCoursesModal {
  isOpen: boolean;
  courses: Course[];
}

interface FileUploadState {
  assignmentId: string | null;
  isOpen: boolean;
  files: File[];
  uploading: boolean;
}

export default function EnhancedStudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    assignmentId: null,
    isOpen: false,
    files: [],
    uploading: false,
  });
  const [allCoursesModal, setAllCoursesModal] = useState<AllCoursesModal>({
    isOpen: false,
    courses: [],
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<string | null>(null);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/dashboard");

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      } else {
        setError("Failed to load dashboard");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Unable to load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // BUTTON HANDLERS
  // ========================================================================

  const handleContinueLesson = async (course: Course) => {
    try {
      // Navigate to lesson with resume position
      router.push(
        `/lessons/${course.currentLesson.id}?resume=${course.currentLesson.watchedSeconds}`
      );
    } catch (err) {
      console.error("Error navigating to lesson:", err);
      setError("Failed to open lesson");
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    router.push(`/courses/${course.id}`);
  };

  const handleOpenFileUpload = (assignmentId: string) => {
    setFileUpload({
      ...fileUpload,
      assignmentId,
      isOpen: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileUpload({
        ...fileUpload,
        files: Array.from(e.target.files),
      });
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (fileUpload.files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    try {
      setSubmittingAssignment(assignmentId);

      const formData = new FormData();
      fileUpload.files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("assignmentId", assignmentId);

      const response = await axios.post("/api/assignments/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Update assignment status
        if (dashboard) {
          const updated = {
            ...dashboard,
            pendingAssignments: dashboard.pendingAssignments.map((a) =>
              a.id === assignmentId ? { ...a, status: "SUBMITTED" } : a
            ),
          };
          setDashboard(updated);
        }

        // Close modal
        setFileUpload({
          assignmentId: null,
          isOpen: false,
          files: [],
          uploading: false,
        });

        // Show success message
        alert("Assignment submitted successfully!");
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
      setError("Failed to submit assignment");
    } finally {
      setSubmittingAssignment(null);
    }
  };

  const handleJoinLiveSession = (session: LiveSession) => {
    if (session.status === "LIVE" && session.meetingUrl) {
      // Open video conference in new window
      window.open(session.meetingUrl, "livesession", "width=1200,height=800");
    }
  };

  const handleViewAllCourses = async () => {
    try {
      const response = await axios.get("/api/courses/enrolled");
      if (response.data.success) {
        setAllCoursesModal({
          isOpen: true,
          courses: response.data.courses,
        });
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    }
  };

  const handleViewCertificate = (achievement: Achievement) => {
    if (achievement.type === "CERTIFICATE") {
      // Open certificate viewer
      router.push(`/achievements/${achievement.id}`);
    }
  };

  const handleRefreshDashboard = async () => {
    await loadDashboard();
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      router.push("/login");
    }
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleOpenSettings = () => {
    router.push("/settings");
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
            onClick={handleRefreshDashboard}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {dashboard.greeting}
            </h1>
            <p className="text-gray-600 mt-1">{dashboard.currentAction}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              data-button="edit-profile"
              title="Edit your profile"
            >
              Profile
            </button>
            <button
              onClick={handleOpenSettings}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              data-button="open-settings"
              title="Preferences and settings"
            >
              ⚙️ Settings
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
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Hours Learned"
            value={dashboard.stats.hoursLearned}
            icon="📚"
          />
          <StatCard
            label="Tasks Completed"
            value={dashboard.stats.tasksCompleted}
            icon="✅"
          />
          <StatCard
            label="Learning Streak"
            value={`${dashboard.learningStreak} days`}
            icon="🔥"
          />
          <StatCard
            label="Rank"
            value={`#${dashboard.leaderboardRank}`}
            icon="🏆"
          />
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${dashboard.overallProgress}%` }}
            ></div>
          </div>
          <p className="text-gray-600 mt-2">{dashboard.overallProgress}% Complete</p>
        </div>

        {/* Continue Learning Section */}
        {dashboard.activeCourses.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Continue Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboard.activeCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Instructor: {course.facilitator.name}
                    </p>

                    {/* Current Lesson */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Current Lesson</p>
                      <p className="font-semibold text-gray-900">
                        {course.currentLesson.title}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-300 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(course.currentLesson.watchedSeconds / course.currentLesson.totalSeconds) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round((course.currentLesson.watchedSeconds / course.currentLesson.totalSeconds) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Course Progress */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Course Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{course.progress}%</p>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => handleContinueLesson(course)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                        data-button="continue-lesson"
                        title={`Resume "${course.currentLesson.title}"`}
                      >
                        ▶ Continue Lesson
                      </button>
                      <button
                        onClick={() => handleViewCourse(course)}
                        className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                        data-button="view-course"
                        title="See full course outline"
                      >
                        📚 Course Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {dashboard.activeCourses.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={handleViewAllCourses}
                  className="w-full bg-indigo-100 text-indigo-700 py-3 rounded-lg hover:bg-indigo-200 transition font-semibold"
                  data-button="view-all-courses"
                  title="See all your enrolled courses"
                >
                  View All Courses ({dashboard.activeCourses.length})
                </button>
              </div>
            )}
          </section>
        )}

        {/* Pending Assignments Section */}
        {dashboard.pendingAssignments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pending Assignments ({dashboard.pendingAssignments.length})
            </h2>
            <div className="space-y-4">
              {dashboard.pendingAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onSubmit={() => handleOpenFileUpload(assignment.id)}
                  isSubmitting={submittingAssignment === assignment.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Live Sessions */}
        {dashboard.nextLiveSessions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upcoming Live Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.nextLiveSessions.map((session) => (
                <LiveSessionCard
                  key={session.id}
                  session={session}
                  onJoin={() => handleJoinLiveSession(session)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Earned Achievements */}
        {dashboard.recentAchievements.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboard.recentAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onView={() => handleViewCertificate(achievement)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* File Upload Modal for Assignment Submission */}
      {fileUpload.isOpen && fileUpload.assignmentId && (
        <FileUploadModal
          assignmentId={fileUpload.assignmentId}
          files={fileUpload.files}
          onFileChange={handleFileChange}
          onSubmit={() => handleSubmitAssignment(fileUpload.assignmentId!)}
          onClose={() =>
            setFileUpload({
              assignmentId: null,
              isOpen: false,
              files: [],
              uploading: false,
            })
          }
          isLoading={submittingAssignment === fileUpload.assignmentId}
        />
      )}

      {/* All Courses Modal */}
      {allCoursesModal.isOpen && (
        <AllCoursesModal
          courses={allCoursesModal.courses}
          onClose={() =>
            setAllCoursesModal({
              isOpen: false,
              courses: [],
            })
          }
          onSelectCourse={handleViewCourse}
        />
      )}
    </div>
  );
}

// ========================================================================
// SUB-COMPONENTS
// ========================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function AssignmentCard({
  assignment,
  onSubmit,
  isSubmitting,
}: AssignmentCardProps) {
  const dueDate = new Date(assignment.dueDate);
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{assignment.title}</h3>
          <p className="text-sm text-gray-600">{assignment.courseName}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

      <div className="flex items-center gap-4 mb-4">
        <div
          className={`text-sm font-semibold ${
            isOverdue ? "text-red-600" : "text-gray-600"
          }`}
        >
          {isOverdue
            ? `Overdue by ${Math.abs(daysUntilDue)} days`
            : `Due in ${daysUntilDue} days`}
        </div>
      </div>

      {assignment.status === "PENDING" && (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
          data-button="submit-assignment"
          title="Upload files and submit"
        >
          {isSubmitting ? "Submitting..." : "📤 Submit Assignment"}
        </button>
      )}
    </div>
  );
}

interface LiveSessionCardProps {
  session: LiveSession;
  onJoin: () => void;
}

function LiveSessionCard({ session, onJoin }: LiveSessionCardProps) {
  const isLive = session.status === "LIVE";

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{session.title}</h3>
          <p className="text-sm text-gray-600">{session.facilitatorName}</p>
        </div>
        {isLive && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">LIVE</span>}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {new Date(session.startsAt).toLocaleTimeString()}
      </p>

      {isLive && (
        <button
          onClick={onJoin}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
          data-button="join-live-session"
          title="Enter the live classroom"
        >
          📹 Join Now
        </button>
      )}
      {!isLive && (
        <button
          disabled
          className="w-full bg-gray-100 text-gray-500 py-2 rounded-lg font-semibold cursor-not-allowed"
          title="Session not yet started"
        >
          ⏰ Starts at {new Date(session.startsAt).toLocaleTimeString()}
        </button>
      )}
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  onView: () => void;
}

function AchievementCard({ achievement, onView }: AchievementCardProps) {
  return (
    <button
      onClick={onView}
      className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-center cursor-pointer group"
      data-button="view-achievement"
      title={`View ${achievement.title} from ${achievement.courseName}`}
    >
      <div className="text-4xl mb-2 group-hover:scale-110 transition">
        {achievement.icon}
      </div>
      <h3 className="font-bold text-gray-900 text-sm break-words">
        {achievement.title}
      </h3>
      <p className="text-xs text-gray-600 mt-1 truncate">
        {achievement.courseName}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        {new Date(achievement.earnedDate).toLocaleDateString()}
      </p>
    </button>
  );
}

interface FileUploadModalProps {
  assignmentId: string;
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
  isLoading: boolean;
}

function FileUploadModal({
  assignmentId,
  files,
  onFileChange,
  onSubmit,
  onClose,
  isLoading,
}: FileUploadModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Submit Assignment
        </h2>

        <div className="mb-6 p-4 border-2 border-dashed border-blue-300 rounded-lg text-center">
          <input
            type="file"
            multiple
            onChange={onFileChange}
            disabled={isLoading}
            className="w-full"
            data-testid="file-upload-input"
          />
          <p className="text-sm text-gray-600 mt-2">
            Select one or more files to upload
          </p>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Files:</h3>
            <ul className="space-y-1">
              {files.map((file, idx) => (
                <li key={idx} className="text-sm text-gray-600">
                  📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition font-semibold disabled:opacity-50"
            data-button="cancel"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={files.length === 0 || isLoading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
            data-button="submit-files"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AllCoursesModalProps {
  courses: Course[];
  onClose: () => void;
  onSelectCourse: (course: Course) => void;
}

function AllCoursesModal({
  courses,
  onClose,
  onSelectCourse,
}: AllCoursesModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Courses</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-left"
              data-button="select-course"
            >
              <h3 className="font-bold text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-600">{course.facilitator.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded h-2">
                  <div
                    className="bg-blue-600 h-2 rounded"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{course.progress}%</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
          data-button="close-modal"
        >
          Close
        </button>
      </div>
    </div>
  );
}
