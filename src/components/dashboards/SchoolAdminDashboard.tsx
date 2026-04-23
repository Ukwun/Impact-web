/**
 * School Admin Dashboard Component
 * School-wide analytics, student/teacher management, and institutional metrics
 * ImpactApp Platform - April 23, 2026
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// ========================================================================
// TYPES
// ========================================================================

interface SchoolMetrics {
  schoolName: string;
  greeting: string;
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  averageCompletion: number;
  attendanceRate: number;
  passRate: number;
}

interface CourseMetrics {
  courseId: string;
  courseName: string;
  facilitatorName: string;
  enrollmentCount: number;
  averageProgress: number;
  passRate: number;
  learningStrike: number; // Weekly engagement
}

interface StudentMetrics {
  id: string;
  name: string;
  email: string;
  level: string;
  enrolledCourses: number;
  averageGrade: number;
  completionRate: number;
  status: "EXCELLENT" | "GOOD" | "AT_RISK" | "STRUGGLING";
  lastActive: string;
}

interface TeacherMetrics {
  id: string;
  name: string;
  email: string;
  coursesTeaching: number;
  totalStudents: number;
  averageStudentGrade: number;
  studentPassRate: number;
  engagementScore: number; // 0-100
}

interface SchoolAdminDashboard {
  metrics: SchoolMetrics;
  topCourses: CourseMetrics[];
  topStudents: StudentMetrics[];
  atRiskStudents: StudentMetrics[];
  topTeachers: TeacherMetrics[];
  activityLog: ActivityLog[];
}

interface ActivityLog {
  id: string;
  timestamp: string;
  type: "ENROLLMENT" | "COMPLETION" | "ISSUE" | "MILESTONE";
  description: string;
  count: number;
}

interface ReportModal {
  isOpen: boolean;
  reportType: "COMPLETION" | "ATTENDANCE" | "GRADES" | "ENGAGEMENT";
}

interface StudentManagementModal {
  isOpen: boolean;
  action: "VIEW" | "EDIT" | "CONTACT";
  studentId?: string;
  studentName?: string;
}

// ========================================================================
// MAIN COMPONENT
// ========================================================================

export default function SchoolAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<SchoolAdminDashboard | null>(null);
  const [reportModal, setReportModal] = useState<ReportModal>({
    isOpen: false,
    reportType: "COMPLETION",
  });
  const [studentModal, setStudentModal] = useState<StudentManagementModal>({
    isOpen: false,
    action: "VIEW",
  });
  const [exporting, setExporting] = useState(false);

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

      if (response.data.success && response.data.role === "SCHOOL_ADMIN") {
        setDashboard(response.data.dashboard);
      } else {
        setError("Unable to load school admin dashboard");
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

  const handleExportReport = async (reportType: ReportModal["reportType"]) => {
    try {
      setExporting(true);

      const response = await axios.post(
        "/api/admin/reports/export",
        { reportType },
        { responseType: "blob" }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      setReportModal({ isOpen: false, reportType: "COMPLETION" });
    } catch (err) {
      console.error("Error exporting report:", err);
      setError("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const handleViewStudentReport = (student: StudentMetrics) => {
    router.push(`/admin/students/${student.id}/report`);
  };

  const handleContactStudent = (student: StudentMetrics) => {
    setStudentModal({
      isOpen: true,
      action: "CONTACT",
      studentId: student.id,
      studentName: student.name,
    });
  };

  const handleManageCourse = (courseId: string) => {
    router.push(`/admin/courses/${courseId}/manage`);
  };

  const handleViewTeacherMetrics = (teacherId: string) => {
    router.push(`/admin/teachers/${teacherId}`);
  };

  const handleCreateCourse = () => {
    router.push("/admin/courses/create");
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading school dashboard...</p>
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
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
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

  const {
    metrics,
    topCourses,
    topStudents,
    atRiskStudents,
    topTeachers,
    activityLog,
  } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {metrics.greeting}
              </h1>
              <p className="text-gray-600 mt-1">
                {metrics.schoolName} Administration
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold"
                data-button="refresh-dashboard"
                title="Refresh all data"
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

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBar
              label="Total Students"
              value={metrics.totalStudents}
              icon="👥"
            />
            <MetricBar
              label="Teachers"
              value={metrics.totalTeachers}
              icon="👨‍🏫"
            />
            <MetricBar
              label="Active Courses"
             value={metrics.activeCourses}
              icon="📚"
            />
            <MetricBar
              label="Avg Completion"
              value={`${Math.round(metrics.averageCompletion)}%`}
              icon="✅"
            />
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

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <ActionButton
            label="Create Course"
            icon="📝"
            onClick={handleCreateCourse}
            color="blue"
          />
          <ActionButton
            label="Curriculum"
            icon="🧩"
            onClick={() => router.push("/dashboard/admin/curriculum/modules")}
            color="purple"
          />
          <ActionButton
            label="Download Reports"
            icon="📊"
            onClick={() => setReportModal({ isOpen: true, reportType: "COMPLETION" })}
            color="green"
          />
          <ActionButton
            label="Manage Users"
            icon="⚙️"
            onClick={() => router.push("/admin/users")}
            color="purple"
          />
        </div>

        {/* Health Metrics */}
        <HealthMetricsSection metrics={metrics} />

        {/* Top Courses */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Top Performing Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topCourses.map((course) => (
              <CourseCard
                key={course.courseId}
                course={course}
                onManage={() => handleManageCourse(course.courseId)}
              />
            ))}
          </div>
        </section>

        {/* Top Students */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Top Students</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Avg Grade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Completion</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.level}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        {student.averageGrade.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${student.completionRate}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(student.completionRate)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewStudentReport(student)}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                        data-button="view-student-report"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* At-Risk Students */}
        {atRiskStudents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚠️ Students Needing Support</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
              <div className="space-y-3">
                {atRiskStudents.slice(0, 5).map((student) => (
                  <div
                    key={student.id}
                    className="flex justify-between items-center bg-white p-4 rounded-lg"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">
                        {student.enrolledCourses} courses | Grade: {student.averageGrade.toFixed(1)}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleContactStudent(student)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
                      data-button="contact-student"
                      title={`Contact ${student.name}`}
                    >
                      📧 Contact
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top Teachers */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 Top Performing Teachers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onViewMetrics={() => handleViewTeacherMetrics(teacher.id)}
              />
            ))}
          </div>
        </section>

        {/* Activity Feed */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-3">
              {activityLog.slice(0, 8).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Report Modal */}
      {reportModal.isOpen && (
        <ReportExportModal
          reportType={reportModal.reportType}
          onTypeChange={(type) =>
            setReportModal({ ...reportModal, reportType: type })
          }
          onExport={() => handleExportReport(reportModal.reportType)}
          onClose={() => setReportModal({ isOpen: false, reportType: "COMPLETION" })}
          isExporting={exporting}
        />
      )}
    </div>
  );
}

// ========================================================================
// SUB-COMPONENTS
// ========================================================================

interface MetricBarProps {
  label: string;
  value: string | number;
  icon: string;
}

function MetricBar({ label, value, icon }: MetricBarProps) {
  return (
    <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-600">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-gray-600 text-xs font-semibold uppercase">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface HealthMetricsSectionProps {
  metrics: SchoolMetrics;
}

function HealthMetricsSection({ metrics }: HealthMetricsSectionProps) {
  return (
    <section className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 School Health Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProgressMetric
          label="Attendance Rate"
          value={metrics.attendanceRate}
          color="blue"
        />
        <ProgressMetric
          label="Pass Rate"
          value={metrics.passRate}
          color="green"
        />
      </div>
    </section>
  );
}

interface ProgressMetricProps {
  label: string;
  value: number;
  color: "blue" | "green" | "red";
}

function ProgressMetric({ label, value, color }: ProgressMetricProps) {
  const bgColor = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
  }[color];

  const textColor = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
  }[color];

  return (
    <div>
      <p className="text-gray-600 font-semibold mb-2">{label}</p>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className={`${bgColor} h-3 rounded-full transition-all`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
        <span className={`text-2xl font-bold ${textColor}`}>{Math.round(value)}%</span>
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: CourseMetrics;
  onManage: () => void;
}

function CourseCard({ course, onManage }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{course.courseName}</h3>
      <p className="text-sm text-gray-600 mb-4">By {course.facilitatorName}</p>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Students</span>
          <span className="font-semibold text-gray-900">{course.enrollmentCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg Progress</span>
          <span className="font-semibold text-gray-900">{Math.round(course.averageProgress)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pass Rate</span>
          <span className="font-semibold text-green-600">{Math.round(course.passRate)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Weekly Engagement</span>
          <span className="font-semibold text-blue-600">{course.learningStrike}%</span>
        </div>
      </div>

      <button
        onClick={onManage}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
        data-button="manage-course"
      >
        📋 Manage Course
      </button>
    </div>
  );
}

interface TeacherCardProps {
  teacher: TeacherMetrics;
  onViewMetrics: () => void;
}

function TeacherCard({ teacher, onViewMetrics }: TeacherCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-1">{teacher.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{teacher.email}</p>

      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="text-gray-600">Courses Teaching:</span>
          <span className="ml-2 font-semibold text-gray-900">{teacher.coursesTeaching}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Total Students:</span>
          <span className="ml-2 font-semibold text-gray-900">{teacher.totalStudents}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Avg Grade:</span>
          <span className="ml-2 font-semibold text-green-600">
            {teacher.averageStudentGrade.toFixed(1)}%
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Engagement:</span>
          <span className="ml-2 font-semibold text-blue-600">{teacher.engagementScore}%</span>
        </div>
      </div>

      <button
        onClick={onViewMetrics}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
        data-button="view-teacher-metrics"
      >
        View Full Metrics
      </button>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  color: "blue" | "green" | "purple";
}

function ActionButton({ label, icon, onClick, color }: ActionButtonProps) {
  const bgColor = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  }[color];

  return (
    <button
      onClick={onClick}
      className={`${bgColor} text-white py-6 rounded-lg transition font-semibold flex items-center justify-center gap-2 text-lg`}
      data-button={label.toLowerCase().replace(" ", "-")}
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </button>
  );
}

interface ActivityItemProps {
  activity: ActivityLog;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const icon = {
    ENROLLMENT: "➕",
    COMPLETION: "✅",
    ISSUE: "⚠️",
    MILESTONE: "🏆",
  }[activity.type];

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded transition">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="text-gray-900 font-semibold">{activity.description}</p>
        <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
      </div>
      <span className="text-lg font-bold text-indigo-600">{activity.count}</span>
    </div>
  );
}

interface ReportExportModalProps {
  reportType: string;
  onTypeChange: (type: any) => void;
  onExport: () => void;
  onClose: () => void;
  isExporting: boolean;
}

function ReportExportModal({
  reportType,
  onTypeChange,
  onExport,
  onClose,
  isExporting,
}: ReportExportModalProps) {
  const reportOptions = [
    { value: "COMPLETION", label: "Completion Report" },
    { value: "ATTENDANCE", label: "Attendance Report" },
    { value: "GRADES", label: "Grades Report" },
    { value: "ENGAGEMENT", label: "Engagement Report" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Download Report</h2>

        <div className="space-y-3 mb-6">
          {reportOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-indigo-600"
            >
              <input
                type="radio"
                name="report"
                value={option.value}
                checked={reportType === option.value}
                onChange={(e) => onTypeChange(e.target.value)}
                className="mr-3"
              />
              <span className="font-semibold text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50"
            data-button="cancel"
          >
            Cancel
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-gray-400"
            data-button="export-report"
          >
            {isExporting ? "Exporting..." : "📥 Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
