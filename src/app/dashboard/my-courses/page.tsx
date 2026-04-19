'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, TrendingUp, Clock, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { getCourseEnrollments, getStudentProgress } from '@/lib/enrollmentManager';
import type { CourseEnrollment, StudentProgress } from '@/types/enrollment';
import { Button } from '@/components/ui/Button';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [progressData, setProgressData] = useState<Map<string, StudentProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  // For demo purposes, show user-1's courses
  const userId = 'user-1';

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        // Get courses where user-1 is enrolled (courses 1 and 2)
        const course1Enrollments = await getCourseEnrollments('course-1');
        const user1Course1 = course1Enrollments.find(e => e.userId === userId);
        
        const course2Enrollments = await getCourseEnrollments('course-2');
        const user1Course2 = course2Enrollments.find(e => e.userId === userId);

        const userEnrollments = [user1Course1, user1Course2].filter(Boolean) as CourseEnrollment[];
        setEnrollments(userEnrollments);

        // Get progress for each course
        const progressMap = new Map<string, StudentProgress>();
        for (const enrollment of userEnrollments) {
          const progress = await getStudentProgress(enrollment.courseId, userId);
          progressMap.set(enrollment.courseId, progress);
        }
        setProgressData(progressMap);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, [userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'active':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'dropped':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'active':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'dropped':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard" className="hover:text-primary-400 transition-colors">
          Dashboard
        </Link>
        <span>→</span>
        <span className="text-white">My Courses</span>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-8 h-8" />
          <h1 className="text-3xl font-bold">My Learning Journey</h1>
        </div>
        <p className="text-white/80">Track your progress and continue learning</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm font-semibold mb-1">Enrolled Courses</p>
          <p className="text-3xl font-bold text-white">{enrollments.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-400/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-300 text-sm font-semibold mb-1">Completed</p>
          <p className="text-3xl font-bold text-white">
            {enrollments.filter(e => e.status === 'completed').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-400/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-300 text-sm font-semibold mb-1">Active</p>
          <p className="text-3xl font-bold text-white">
            {enrollments.filter(e => e.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Courses List */}
      {enrollments.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-12 border border-gray-800 text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 text-lg mb-4">No courses yet</p>
          <p className="text-gray-400 mb-6">Explore our course catalog and start learning</p>
          <Link href="/courses">
            <Button variant="primary">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map(enrollment => {
            const progress = progressData.get(enrollment.courseId);

            return (
              <div
                key={enrollment.id}
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-primary-500/50 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      {/* Course Header */}
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(enrollment.status)}
                        <div>
                          <h3 className="text-xl font-bold text-white">{enrollment.courseName}</h3>
                          <p className="text-gray-400 text-sm">{enrollment.courseId}</p>
                        </div>
                      </div>

                      {/* Facilitator */}
                      <p className="text-gray-400 text-sm ml-8">
                        Facilitator: <span className="text-primary-400">{enrollment.facilitatorName}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border capitalize whitespace-nowrap ${getStatusColor(
                        enrollment.status
                      )}`}
                    >
                      {enrollment.status}
                    </span>
                  </div>

                  {/* Progress Section */}
                  {progress && (
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm">Overall Progress</span>
                          <span className="text-primary-400 font-bold">{progress.progressPercentage}%</span>
                        </div>
                        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                            style={{ width: `${progress.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400">Lessons Completed</p>
                          <p className="text-white font-bold">
                            {progress.completedLessons}/{progress.totalLessons}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400">Time Spent</p>
                          <p className="text-white font-bold">{progress.timeSpent} hours</p>
                        </div>
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400">Last Active</p>
                          <p className="text-white font-bold text-xs">{progress.lastAccessed}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    {enrollment.status === 'active' && (
                      <Link href={`/dashboard/courses/${enrollment.courseId}`} className="flex-1">
                        <Button variant="primary" className="w-full justify-center">
                          Continue Learning
                        </Button>
                      </Link>
                    )}
                    {enrollment.status === 'completed' && (
                      <Link href={`/dashboard/courses/${enrollment.courseId}`} className="flex-1">
                        <Button variant="secondary" className="w-full justify-center">
                          Review Course
                        </Button>
                      </Link>
                    )}
                    {enrollment.status === 'dropped' && (
                      <Link href={`/dashboard/courses/${enrollment.courseId}`} className="flex-1">
                        <Button variant="secondary" className="w-full justify-center">
                          Re-enroll
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/orders-and-refunds`} className="flex-1">
                      <Button variant="secondary" className="w-full justify-center">
                        Order & Refunds
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Enrollment Date Footer */}
                <div className="bg-gray-800/50 px-6 py-3 border-t border-gray-800 text-xs text-gray-400">
                  Enrolled on {enrollment.enrolledDate} •{' '}
                  {enrollment.status === 'completed'
                    ? `Completed on ${enrollment.completedDate || 'TBD'}`
                    : `Progress: ${progress?.progressPercentage || 0}%`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refunds Section Link */}
      <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          Need Help?
        </h3>
        <p className="text-gray-300 mb-4">
          Requested a refund? View your order history and refund status.
        </p>
        <Link href="/dashboard/orders-and-refunds">
          <Button variant="secondary" className="w-full justify-center">
            View Orders & Refunds
          </Button>
        </Link>
      </div>
    </div>
  );
}
