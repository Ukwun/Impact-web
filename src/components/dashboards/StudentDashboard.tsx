/**
 * Student/Learner Dashboard Component
 * Comprehensive learning experience with courses, assignments, progress tracking
 * ImpactApp Platform - April 23, 2026
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// ========================================================================
// TYPES
// ========================================================================

interface StudentMetrics {
  greeting: string;
  firstName: string;
  totalHoursLearned: number;
  learningStreak: number;
  currentLevel: string;
  totalPoints: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorImage: string;
  thumbnail: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  currentModule: Module | null;
  enrolledDate: string;
  nextDeadline?: string;
  duration: string; // e.g., "8 weeks"
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  rating: number;
  reviews: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // minutes
  type: "VIDEO" | "READING" | "EXERCISE" | "PROJECT" | "QUIZ";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"; // student status
  resources: Resource[];
  nextLessonId?: string;
}

interface Resource {
  id: string;
  title: string;
  type: "VIDEO" | "PDF" | "CODE" | "LINK" | "INTERACTIVE";
  url: string;
  duration?: number;
  fileSize?: string;
}

interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  submissionStatus: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "GRADED";
  submissionDate?: string;
  grade?: number;
  feedback?: string;
  points: number;
  maxPoints: number;
  attachments?: string[];
  rubric?: RubricItem[];
}

interface RubricItem {
  criteria: string;
  maxPoints: number;
  earnedPoints?: number;
  feedback?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: "SKILLS" | "KNOWLEDGE" | "EFFORT" | "SOCIAL";
  points: number;
}

interface PeerActivity {
  id: string;
  type: "COMMENT" | "SUBMISSION" | "MESSAGE" | "COLLABORATION";
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  courseId: string;
  courseName: string;
}

interface StudySession {
  date: string;
  courseId: string;
  courseName: string;
  duration: number; // minutes
  modifier: "FOCUSED" | "CASUAL" | "GROUP_STUDY" | "TUTORING";
}

interface LearningRecommendation {
  type: "NEXT_COURSE" | "SKILL_GAP" | "PRACTICE" | "REVIEW";
  title: string;
  description: string;
  reason: string;
  actionUrl: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

interface StudentDashboardData {
  metrics: StudentMetrics;
  activeCourses: Course[];
  inProgressAssignments: Assignment[];
  recentAchievements: Achievement[];
  peerActivity: PeerActivity[];
  studySessions: StudySession[];
  recommendations: LearningRecommendation[];
  leaderboardPosition: number;
  leaderboardTotal: number;
}

interface TabType {
  id: "overview" | "courses" | "assignments" | "achievements" | "progress";
  label: string;
  icon: string;
}

// ========================================================================
// MAIN COMPONENT
// ========================================================================

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "assignments" | "achievements" | "progress">("overview");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

  const TABS: TabType[] = [
    { id: "overview", label: "Dashboard", icon: "🏠" },
    { id: "courses", label: "My Courses", icon: "📚" },
    { id: "assignments", label: "Assignments", icon: "📝" },
    { id: "achievements", label: "Achievements", icon: "🏆" },
    { id: "progress", label: "Progress", icon: "📊" },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadDashboard, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/dashboard");

      if (response.data.success && response.data.role === "STUDENT") {
        setDashboard(response.data.dashboard);
        if (response.data.dashboard.activeCourses.length > 0) {
          setSelectedCourse(response.data.dashboard.activeCourses[0]);
        }
      } else {
        setError("Unable to load student dashboard");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleStartLesson = async (courseId: string, moduleId: string) => {
    try {
      await axios.post("/api/learning/start-lesson", {
        courseId,
        moduleId,
      });
      router.push(`/learn/${courseId}/module/${moduleId}`);
    } catch (err) {
      console.error("Error starting lesson:", err);
      setError("Failed to start lesson");
    }
  };

  const handleViewAssignmentDetail = (assignment: Assignment) => {
    setExpandedAssignment(expandedAssignment === assignment.id ? null : assignment.id);
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    try {
      const response = await axios.post(`/api/assignments/${assignmentId}/submit`);
      if (response.data.success) {
        alert("Assignment submitted successfully!");
        await loadDashboard();
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
      setError("Failed to submit assignment");
    }
  };

  const handleStartCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      const response = await axios.post(`/api/courses/${courseId}/enroll`);
      if (response.data.success) {
        alert("Successfully enrolled!");
        await loadDashboard();
      }
    } catch (err) {
      console.error("Error enrolling:", err);
      setError("Failed to enroll in course");
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      router.push("/login");
    }
  };

  const handleRefresh = () => {
    loadDashboard();
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your learning dashboard...</p>
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
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
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

  const { metrics, activeCourses, inProgressAssignments, recentAchievements, peerActivity, studySessions, recommendations, leaderboardPosition, leaderboardTotal } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{metrics.greeting}, {metrics.firstName}! 👋</h1>
              <p className="text-gray-600 mt-1">Keep learning and growing every day</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleRefresh} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold" data-button="refresh-dashboard">
                🔄 Refresh
              </button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold" data-button="logout">
                Logout
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Hours Learned" value={metrics.totalHoursLearned} icon="⏱️" />
            <MetricCard label="Streak" value={`${metrics.learningStreak} days`} icon="🔥" />
            <MetricCard label="Level" value={metrics.currentLevel} icon="⭐" />
            <MetricCard label="Points" value={metrics.totalPoints} icon="💎" />
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                data-button={`tab-${tab.id}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
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
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Current Courses */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Currently Learning</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCourses.slice(0, 6).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onStart={() => handleStartLesson(course.id, course.currentModule?.id || "")}
                    onViewCourse={() => handleStartCourse(course.id)}
                  />
                ))}
              </div>
            </section>

            {/* Pending Assignments */}
            {inProgressAssignments.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Due Soon</h2>
                <div className="space-y-3">
                  {inProgressAssignments.slice(0, 3).map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      isExpanded={expandedAssignment === assignment.id}
                      onToggle={() => handleViewAssignmentDetail(assignment)}
                      onSubmit={() => handleSubmitAssignment(assignment.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Recommended for You</h2>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec, idx) => (
                    <RecommendationCard key={idx} recommendation={rec} />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Recent Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recentAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </section>
            )}

            {/* Peer Activity */}
            {peerActivity.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Peer Activity</h2>
                <div className="space-y-3">
                  {peerActivity.slice(0, 5).map((activity) => (
                    <PeerActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              </section>
            )}

            {/* Leaderboard & Study Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeaderboardCard position={leaderboardPosition} total={leaderboardTotal} />
              <StudyStatsCard sessions={studySessions} />
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Your Courses</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeCourses.map((course) => (
                <CourseDetailCard
                  key={course.id}
                  course={course}
                  onStart={() => handleStartLesson(course.id, course.currentModule?.id || "")}
                  onViewCourse={() => handleStartCourse(course.id)}
                />
              ))}
            </div>
            {activeCourses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No courses yet. Explore and enroll in your first course!</p>
                <button
                  onClick={() => router.push("/courses")}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  data-button="explore-courses"
                >
                  Explore Courses
                </button>
              </div>
            )}
          </section>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === "assignments" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Assignments</h2>
            <div className="space-y-3">
              {inProgressAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isExpanded={expandedAssignment === assignment.id}
                  onToggle={() => handleViewAssignmentDetail(assignment)}
                  onSubmit={() => handleSubmitAssignment(assignment.id)}
                />
              ))}
            </div>
            {inProgressAssignments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">✅ No pending assignments!</p>
              </div>
            )}
          </section>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === "achievements" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} detailed />
              ))}
            </div>
            {recentAchievements.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">Keep learning to earn achievements! 🌟</p>
              </div>
            )}
          </section>
        )}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Progress</h2>
            <div className="space-y-6">
              {activeCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{course.title}</h3>
                  <ProgressBar value={course.progress} />
                  <div className="mt-4 flex justify-between text-sm text-gray-600">
                    <span>{course.completedModules} of {course.totalModules} modules completed</span>
                    <span>{Math.round(course.progress)}% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
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
    <div className="bg-white rounded-lg p-4 border-b-2 border-blue-600 shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  onStart: () => void;
  onViewCourse: () => void;
}

function CourseCard({ course, onStart, onViewCourse }: CourseCardProps) {
  const isCompleted = course.progress === 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      {/* Course Thumbnail */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        <div className="absolute inset-0 opacity-20 bg-black pattern"></div>
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-200"></div>
          <span className="text-sm text-gray-600">{course.instructor}</span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <ProgressBar value={course.progress} />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{course.completedModules}/{course.totalModules} lessons</span>
            <span>{Math.round(course.progress)}%</span>
          </div>
        </div>

        {/* Current Module */}
        {course.currentModule && (
          <div className="bg-blue-50 rounded p-2 mb-4">
            <p className="text-xs font-semibold text-blue-900 mb-1">Next Lesson:</p>
            <p className="text-sm text-blue-800">{course.currentModule.title}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {course.currentModule && !isCompleted && (
            <button
              onClick={onStart}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              data-button="start-lesson"
            >
              ▶ Continue
            </button>
          )}
          <button
            onClick={onViewCourse}
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded font-semibold hover:bg-gray-300 transition"
            data-button="view-course"
          >
            {isCompleted ? "✅ Completed" : "View"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CourseDetailCardProps {
  course: Course;
  onStart: () => void;
  onViewCourse: () => void;
}

function CourseDetailCard({ course, onStart, onViewCourse }: CourseDetailCardProps) {
  const difficulty = {
    BEGINNER: "🟢",
    INTERMEDIATE: "🟡",
    ADVANCED: "🔴",
  }[course.difficulty];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 text-xl">{course.title}</h3>
          <span className="text-2xl">{difficulty}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4">{course.description}</p>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
          <div>⏱️ {course.duration}</div>
          <div>⭐ {course.rating.toFixed(1)}/5 ({course.reviews})</div>
        </div>

        {/* Progress & Stats */}
        <div className="mb-4 pb-4 border-b">
          <ProgressBar value={course.progress} />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{course.completedModules}/{course.totalModules} completed</span>
            <span>{Math.round(course.progress)}%</span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-200"></div>
          <div>
            <p className="text-xs text-gray-500">Instructor</p>
            <p className="font-semibold text-gray-900">{course.instructor}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {course.currentModule && course.progress < 100 && (
            <button
              onClick={onStart}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
              data-button="continue-course"
            >
              Continue Learning
            </button>
          )}
          <button
            onClick={onViewCourse}
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded font-semibold hover:bg-gray-300"
            data-button="view-course-detail"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Assignment;
  isExpanded: boolean;
  onToggle: () => void;
  onSubmit: () => void;
}

function AssignmentCard({ assignment, isExpanded, onToggle, onSubmit }: AssignmentCardProps) {
  const isOverdue =
    assignment.submissionStatus === "NOT_STARTED" &&
    new Date(assignment.dueDate) < new Date();

  const daysUntilDue = Math.ceil(
    (new Date(assignment.dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const statusIcon = {
    NOT_STARTED: "⭕",
    DRAFT: "✏️",
    SUBMITTED: "✅",
    GRADED: "📊",
  }[assignment.submissionStatus];

  const statusColor = {
    NOT_STARTED: isOverdue ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200",
    DRAFT: "bg-blue-50 border-blue-200",
    SUBMITTED: "bg-green-50 border-green-200",
    GRADED: "bg-purple-50 border-purple-200",
  }[assignment.submissionStatus];

  return (
    <div className={`rounded-lg border p-4 cursor-pointer transition ${statusColor}`} onClick={onToggle}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{statusIcon}</span>
            <div>
              <h4 className="font-bold text-gray-900">{assignment.title}</h4>
              <p className="text-sm text-gray-600">{assignment.courseName}</p>
            </div>
          </div>

          {!isExpanded && (
            <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
          )}
        </div>

        <div className="text-right ml-4">
          <p className="text-sm font-semibold text-gray-900">
            {assignment.maxPoints} pts
          </p>
          <p className={`text-xs font-semibold ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
            {isOverdue ? "OVERDUE" : `Due in ${daysUntilDue}d`}
          </p>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <p className="text-gray-700">{assignment.description}</p>

          {assignment.rubric && assignment.rubric.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Grading Rubric:</h5>
              <div className="space-y-1 text-sm">
                {assignment.rubric.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span>{item.criteria}</span>
                    <span>/{item.maxPoints}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignment.grade !== undefined && (
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Your Grade:</p>
              <p className="text-2xl font-bold text-green-600">
                {assignment.grade}%
              </p>
              {assignment.feedback && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Feedback:</strong> {assignment.feedback}
                </p>
              )}
            </div>
          )}

          {assignment.submissionStatus !== "GRADED" && assignment.submissionStatus !== "SUBMITTED" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubmit();
              }}
              className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
              data-button="submit-assignment"
            >
              Submit Assignment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  detailed?: boolean;
}

function AchievementCard({ achievement, detailed = false }: AchievementCardProps) {
  const categoryColor = {
    SKILLS: "bg-blue-50",
    KNOWLEDGE: "bg-green-50",
    EFFORT: "bg-orange-50",
    SOCIAL: "bg-pink-50",
  }[achievement.category];

  return (
    <div className={`${categoryColor} rounded-lg p-4 text-center border-2 border-gray-200 hover:shadow-lg transition`}>
      <div className="text-4xl mb-2">{achievement.icon}</div>
      <h4 className="font-bold text-gray-900 text-sm">{achievement.title}</h4>
      {detailed && <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>}
      <p className="text-xs text-gray-500 mt-2">
        {new Date(achievement.earnedDate).toLocaleDateString()}
      </p>
      <p className="text-sm font-bold text-blue-600 mt-1">+{achievement.points} pts</p>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: LearningRecommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const priorityColor = {
    HIGH: "border-red-300 bg-red-50",
    MEDIUM: "border-yellow-300 bg-yellow-50",
    LOW: "border-green-300 bg-green-50",
  }[recommendation.priority];

  return (
    <div className={`border-l-4 rounded p-4 ${priorityColor}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-900">{recommendation.title}</h4>
        <span className="text-xs font-semibold px-2 py-1 bg-white rounded">
          {recommendation.priority}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-2">{recommendation.description}</p>
      <p className="text-xs text-gray-600 mb-3">
        <strong>Why:</strong> {recommendation.reason}
      </p>
      <a
        href={recommendation.actionUrl}
        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
      >
        Start Now →
      </a>
    </div>
  );
}

interface PeerActivityCardProps {
  activity: PeerActivity;
}

function PeerActivityCard({ activity }: PeerActivityCardProps) {
  const activityIcon = {
    COMMENT: "💬",
    SUBMISSION: "📤",
    MESSAGE: "✉️",
    COLLABORATION: "🤝",
  }[activity.type];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
          <span className="text-lg">{activityIcon}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {activity.user.name}
          </p>
          <p className="text-sm text-gray-600">in {activity.courseName}</p>
          <p className="text-sm text-gray-700 mt-1">{activity.content}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(activity.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface LeaderboardCardProps {
  position: number;
  total: number;
}

function LeaderboardCard({ position, total }: LeaderboardCardProps) {
  const percentile = Math.round(((total - position) / total) * 100);

  return (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
      <h3 className="text-xl font-bold mb-4">🎯 Leaderboard Position</h3>
      <div className="text-center">
        <p className="text-5xl font-bold mb-2">#{position}</p>
        <p className="text-lg opacity-90">out of {total} students</p>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div
            className="h-full bg-yellow-300 rounded-full"
            style={{ width: `${percentile}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2 opacity-75">Top {100 - percentile}%</p>
      </div>
    </div>
  );
}

interface StudyStatsCardProps {
  sessions: StudySession[];
}

function StudyStatsCard({ sessions }: StudyStatsCardProps) {
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-600">
      <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Weekly Study Stats</h3>
      <div className="space-y-3">
        <StatRow label="Total Time" value={`${totalHours}h`} icon="⏱️" />
        <StatRow label="Sessions" value={sessions.length} icon="📚" />
        <StatRow label="Consistency" value="80%" icon="🔥" />
      </div>
      <p className="text-xs text-gray-600 mt-4">
        Keep up the great work! You're on track to reach your goals.
      </p>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string | number;
  icon: string;
}

function StatRow({ label, value, icon }: StatRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 flex items-center gap-2">
        {icon} {label}
      </span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
}

function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
        style={{ width: `${Math.min(100, value)}%` }}
      ></div>
    </div>
  );
}
