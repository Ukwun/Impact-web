'use client';

import { useAuth } from '@/hooks/useAuth';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';
import { useState, useEffect } from 'react';
import { BookOpen, Users, BarChart3, TrendingUp } from 'lucide-react';
import CourseFormModal from '@/components/CourseFormModal';

export default function FacilitatorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgCompletion: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  // Fetch facilitator's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch('/api/courses?filter=facilitator', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();

        if (data.success && data.data.courses) {
          const facilitatorCourses = data.data.courses.filter(
            (c: any) => c.createdBy === `${user?.firstName} ${user?.lastName}`
          );
          setCourses(facilitatorCourses);

          // Calculate stats
          const totalStudents = facilitatorCourses.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0);
          const avgCompletion = facilitatorCourses.length > 0
            ? Math.round(
                facilitatorCourses.reduce((sum: number, c: any) => sum + (c.completion || 0), 0) /
                facilitatorCourses.length
              )
            : 0;
          const avgRating = facilitatorCourses.length > 0
            ? (
                facilitatorCourses.reduce((sum: number, c: any) => sum + (c.rating || 4.5), 0) /
                facilitatorCourses.length
              ).toFixed(1)
            : 0;

          setStats({
            totalCourses: facilitatorCourses.length,
            totalStudents,
            avgCompletion,
            avgRating: parseFloat(avgRating as string),
          });
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const statConfig = [
    { icon: BookOpen, label: 'Courses Teaching', value: stats.totalCourses.toString(), color: 'primary' },
    { icon: Users, label: 'Total Students', value: stats.totalStudents.toString(), color: 'secondary' },
    { icon: BarChart3, label: 'Avg Completion', value: `${stats.avgCompletion}%`, color: 'green' },
    { icon: TrendingUp, label: 'Avg Rating', value: `${stats.avgRating.toFixed(1)}/5`, color: 'blue' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Welcome back, Facilitator {user?.firstName}! 👨‍🏫
        </h1>
        <p className="text-gray-400">
          Manage your courses, track student progress, and create impact
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((stat, idx) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            primary: 'from-primary-500 to-primary-600',
            secondary: 'from-secondary-500 to-secondary-600',
            green: 'from-green-500 to-green-600',
            blue: 'from-blue-500 to-blue-600',
          };

          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-dark-500 to-dark-600 rounded-2xl p-6 border-2 border-dark-400 hover:border-primary-500 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[stat.color]} flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">My Courses</h2>
            <button
              onClick={() => {
                setEditingCourse(null);
                setShowCreateModal(true);
              }}
              className="text-primary-400 hover:text-primary-300 font-semibold text-sm"
            >
              + Create Course
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No courses yet. <span
                onClick={() => {
                  setEditingCourse(null);
                  setShowCreateModal(true);
                }}
                className="text-primary-400 cursor-pointer hover:text-primary-300"
              >
                Create one now!
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg p-6 border-2 border-dark-400 hover:border-primary-500 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{course.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{course.enrollmentCount || 0} students enrolled</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-black text-yellow-400">★</span>
                        <span className="font-bold text-white">{course.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Difficulty</span>
                      <span className="font-semibold text-white">{course.difficulty || 'Beginner'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setShowCreateModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded font-semibold text-sm transition-colors"
                    >
                      Edit Course
                    </button>
                    <button className="flex-1 px-4 py-2 bg-dark-400 hover:bg-dark-300 text-white rounded font-semibold text-sm transition-colors">
                      View Analytics
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white mb-6">Quick Actions</h2>

          <div className="space-y-3">
            <button
              onClick={() => {
                setEditingCourse(null);
                setShowCreateModal(true);
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold transition-all duration-300 flex items-center gap-3 justify-center"
            >
              <BookOpen size={20} />
              Create Course
            </button>

            <button className="w-full px-6 py-4 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white rounded-lg font-bold transition-all duration-300 flex items-center gap-3 justify-center">
              <Users size={20} />
              Message Students
            </button>

            <button className="w-full px-6 py-4 bg-dark-500 hover:bg-dark-400 text-white rounded-lg font-bold transition-all duration-300 border-2 border-dark-400 flex items-center gap-3 justify-center">
              <BarChart3 size={20} />
              View Reports
            </button>
          </div>

          {/* Recent Submissions */}
          <div className="mt-8 bg-gradient-to-br from-dark-500 to-dark-600 rounded-lg p-6 border-2 border-dark-400">
            <h3 className="font-bold text-white mb-4">Recent Submissions</h3>
            <div className="space-y-3">
              <div className="py-2 border-b border-dark-400">
                <p className="text-sm font-semibold text-white">Assignment: Pitch Deck</p>
                <p className="text-xs text-gray-400">5 submissions pending review</p>
              </div>
              <div className="py-2 border-b border-dark-400">
                <p className="text-sm font-semibold text-white">Quiz: Module 4</p>
                <p className="text-xs text-gray-400">42 students completed</p>
              </div>
              <div className="py-2">
                <p className="text-sm font-semibold text-white">Project: Business Plan</p>
                <p className="text-xs text-gray-400">8 submissions reviewed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCourse(null);
        }}
        editingCourse={editingCourse}
        onSuccess={() => {
          setShowCreateModal(false);
          setEditingCourse(null);
          // Refresh courses
          window.location.reload();
        }}
      />
    </div>
  );
}
