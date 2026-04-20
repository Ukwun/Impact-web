'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, ClipboardList, BarChart3, Plus } from 'lucide-react';
import { CourseCreationModal } from './CourseCreationModal';
import { StudentSubmissionGradingModal } from './StudentSubmissionGradingModal';
import { ClassAnalyticsModal } from './ClassAnalyticsModal';

interface DashboardMetrics {
  coursesTaught: number;
  totalStudents: number;
  pendingSubmissions: number;
  avgClassGrade: number;
}

interface FacilitatorDashboardProps {
  userId?: string;
}

export const FacilitatorDashboard: React.FC<FacilitatorDashboardProps> = ({ userId }) => {
  // State
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    coursesTaught: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    avgClassGrade: 0,
  });

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal visibility
  const [showCourseCreation, setShowCourseCreation] = useState(false);
  const [showGrading, setShowGrading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Modals data
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Fetch dashboard metrics
      const metricsRes = await fetch('/api/facilitator/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!metricsRes.ok) throw new Error('Failed to load dashboard');
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.teachingMetrics);

      // Fetch courses
      const coursesRes = await fetch('/api/facilitator/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses);
      }

      // Fetch pending submissions
      const submissionsRes = await fetch('/api/facilitator/submissions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData.submissions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/facilitator/courses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (!res.ok) throw new Error('Failed to create course');
      await loadDashboardData();
    } catch (err) {
      throw err;
    }
  };

  const handleGradeSubmission = async (gradeData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/facilitator/grade', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });

      if (!res.ok) throw new Error('Failed to grade submission');
      await loadDashboardData();
    } catch (err) {
      throw err;
    }
  };

  const handleViewAnalytics = async (course: any) => {
    setSelectedCourse(course);
    setShowAnalytics(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your teaching dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">Teaching Dashboard</h1>
          <p className="text-blue-100">Manage courses, grade submissions, and track student progress</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Courses Taught */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Courses Taught</h3>
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.coursesTaught}</p>
            <p className="text-sm text-gray-500 mt-2">Active courses</p>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Students</h3>
              <Users className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalStudents}</p>
            <p className="text-sm text-gray-500 mt-2">Across all courses</p>
          </div>

          {/* Pending Grades */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Pending Grades</h3>
              <ClipboardList className="text-orange-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.pendingSubmissions}</p>
            <p className="text-sm text-gray-500 mt-2">Submissions to grade</p>
          </div>

          {/* Class Average */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Class Average</h3>
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.avgClassGrade}%</p>
            <p className="text-sm text-gray-500 mt-2">Overall performance</p>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Create Course */}
          <div
            onClick={() => setShowCourseCreation(true)}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all hover:from-blue-100 hover:to-blue-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <Plus className="text-blue-600" size={24} />
              <h3 className="font-semibold text-gray-900">Create Course</h3>
            </div>
            <p className="text-gray-600 text-sm">Build a new course with lessons</p>
          </div>

          {/* Grade Submissions */}
          <div
            onClick={() => setShowGrading(true)}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all hover:from-orange-100 hover:to-orange-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="text-orange-600" size={24} />
              <h3 className="font-semibold text-gray-900">Grade Work</h3>
            </div>
            <p className="text-gray-600 text-sm">Review and grade student submissions</p>
          </div>

          {/* View Analytics */}
          {courses.length > 0 && (
            <div
              onClick={() => handleViewAnalytics(courses[0])}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all hover:from-purple-100 hover:to-purple-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="text-purple-600" size={24} />
                <h3 className="font-semibold text-gray-900">Class Analytics</h3>
              </div>
              <p className="text-gray-600 text-sm">View course performance data</p>
            </div>
          )}
        </div>

        {/* Your Courses */}
        {courses.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
            </div>

            <div className="divide-y">
              {courses.map(course => (
                <div key={course.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {course.level}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-600">Students</p>
                      <p className="text-lg font-bold text-gray-900">{course.totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Pending Grades</p>
                      <p className="text-lg font-bold text-orange-600">{course.pendingGrades}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleViewAnalytics(course)}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
                      >
                        View Analytics
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CourseCreationModal
        isOpen={showCourseCreation}
        onClose={() => setShowCourseCreation(false)}
        onCreateCourse={handleCreateCourse}
      />

      <StudentSubmissionGradingModal
        isOpen={showGrading}
        onClose={() => setShowGrading(false)}
        submissions={submissions}
        onGradeSubmission={handleGradeSubmission}
      />

      <ClassAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        analyticsData={selectedCourse}
      />
    </div>
  );
};
