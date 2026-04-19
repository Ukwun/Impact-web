'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useUserProgress } from '@/hooks/useLMS';

export default function ProgressPage() {
  const { progress, loading, error } = useUserProgress();
  const [stats, setStats] = useState({
    totalProgress: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
  });

  useEffect(() => {
    if (progress?.enrollments) {
      const enrollments = progress.enrollments;
      const totalProgress = Math.round(
        enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length
      );
      const completedCourses = enrollments.filter((e) => e.isCompleted).length;
      const inProgressCourses = enrollments.filter((e) => !e.isCompleted).length;
      const totalLessons = enrollments.reduce((acc, e) => acc + e.totalLessons, 0);
      const completedLessons = enrollments.reduce((acc, e) => acc + e.lessonsCompleted, 0);

      setStats({
        totalProgress,
        completedCourses,
        inProgressCourses,
        totalLessons,
        completedLessons,
      });
    }
  }, [progress]);

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/learning-journey" className="text-primary-400 hover:text-primary-300">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white">Progress Tracker</h1>
            <p className="text-gray-400">Monitor your learning progress across all courses</p>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-400" size={24} />
          <div>
            <h3 className="text-white font-bold mb-1">Unable to load progress</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/learning-journey" className="text-primary-400 hover:text-primary-300">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white">Progress Tracker</h1>
            <p className="text-gray-400">Monitor your learning progress across all courses</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-primary-400 mr-3" size={24} />
          <p className="text-gray-400">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/learning-journey" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-4xl font-black text-white">Progress Tracker</h1>
          <p className="text-gray-400">Monitor your learning progress across all courses</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-500 border border-dark-400 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Overall Progress</p>
              <p className="text-3xl font-black text-primary-400">{stats.totalProgress}%</p>
            </div>
            <TrendingUp className="text-primary-400" size={32} />
          </div>
        </div>

        <div className="bg-dark-500 border border-dark-400 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Completed Courses</p>
              <p className="text-3xl font-black text-green-400">{stats.completedCourses}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-dark-500 border border-dark-400 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">In Progress</p>
              <p className="text-3xl font-black text-primary-400">{stats.inProgressCourses}</p>
            </div>
            <Loader className="text-primary-400" size={32} />
          </div>
        </div>

        <div className="bg-dark-500 border border-dark-400 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Lessons Complete</p>
              <p className="text-3xl font-black text-blue-400">
                {stats.completedLessons}/{stats.totalLessons}
              </p>
            </div>
            <TrendingUp className="text-blue-400" size={32} />
          </div>
        </div>
      </div>

      {/* Course Progress */}
      {progress?.enrollments && progress.enrollments.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Course Progress</h2>
          <div className="space-y-4">
            {progress.enrollments.map((course) => (
              <Link
                key={course.enrollmentId}
                href={`/dashboard/learning-journey/${course.course.id}`}
                className="block bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary-600/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white hover:text-primary-400 transition-colors mb-2">
                      {course.course.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{course.course.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary-400">{Math.round(course.progress)}%</p>
                    <p className={`text-sm font-semibold ${course.isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                      {course.isCompleted ? '✓ Complete' : 'In Progress'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-dark-600 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Lessons</p>
                    <p className="font-bold text-white">{course.lessonsCompleted}/{course.totalLessons}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Quizzes</p>
                    <p className="font-bold text-white">{course.quizzesCompleted}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Assignments</p>
                    <p className="font-bold text-white">{course.assignmentsSubmitted}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Access</p>
                    <p className="font-bold text-white text-xs">
                      {course.lastAccessedAt
                        ? new Date(course.lastAccessedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-dark-500 border border-dark-400 rounded-2xl p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
          <p className="text-gray-400">Enroll in a course to start tracking your progress</p>
        </div>
      )}
    </div>
  );
}
