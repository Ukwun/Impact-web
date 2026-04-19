'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Zap, Loader, AlertCircle } from 'lucide-react';
import { useUserProgress } from '@/hooks/useLMS';

interface Enrollment {
  enrollmentId: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    difficulty: string;
    duration: number;
  };
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesCompleted: number;
  assignmentsSubmitted: number;
  lastAccessedAt: string | null;
  enrolledAt: string;
}

export default function LearningJourneyPage() {
  const { progress, loading, error } = useUserProgress();
  const [activeEnrollments, setActiveEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (progress?.enrollments) {
      // Filter active (not completed) enrollments and sort by last accessed
      const active = progress.enrollments
        .filter((e) => !e.isCompleted)
        .sort((a, b) => {
          if (!a.lastAccessedAt) return 1;
          if (!b.lastAccessedAt) return -1;
          return new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();
        });
      setActiveEnrollments(active);
    }
  }, [progress]);

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Your Learning Journey</h1>
          <p className="text-gray-400">Track your progress and continue where you left off</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-400" size={24} />
          <div>
            <h3 className="text-white font-bold mb-1">Unable to load courses</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Your Learning Journey</h1>
          <p className="text-gray-400">Track your progress and continue where you left off</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-primary-400 mr-3" size={24} />
          <p className="text-gray-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Your Learning Journey</h1>
        <p className="text-gray-400">Track your progress and continue where you left off</p>
      </div>

      {activeEnrollments.length > 0 ? (
        <>
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeEnrollments.slice(0, 2).map((enrollment) => (
                <Link
                  key={enrollment.enrollmentId}
                  href={`/dashboard/learning-journey/${enrollment.course.id}`}
                  className="group bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-primary-600/20"
                >
                  {enrollment.course.thumbnail && (
                    <div className="w-full h-32 bg-gradient-to-r from-primary-600 to-primary-700 overflow-hidden">
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{enrollment.course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{enrollment.course.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-primary-400 font-semibold">{Math.round(enrollment.progress)}%</span>
                      </div>
                      <div className="w-full bg-dark-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>

                      <div className="flex gap-4 text-xs text-gray-400 pt-2">
                        <div>📚 {enrollment.lessonsCompleted}/{enrollment.totalLessons} lessons</div>
                        <div>✉️ {enrollment.assignmentsSubmitted} submitted</div>
                      </div>
                    </div>

                    <span className="inline-block mt-4 text-primary-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Continue →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {activeEnrollments.length > 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">All Enrolled Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEnrollments.map((enrollment) => (
                  <Link
                    key={enrollment.enrollmentId}
                    href={`/dashboard/learning-journey/${enrollment.course.id}`}
                    className="group bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-primary-600/20"
                  >
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                      {enrollment.course.title}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">{Math.round(enrollment.progress)}% complete</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          enrollment.difficulty === 'ADVANCED' ? 'bg-red-500/20 text-red-400' :
                          enrollment.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {enrollment.difficulty}
                        </span>
                      </div>
                      <div className="w-full bg-dark-600 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-dark-500 border border-dark-400 rounded-2xl p-12 text-center">
          <BookOpen className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
          <p className="text-gray-400 mb-6">Enroll in your first course to start learning</p>
          <Link
            href="/dashboard/courses"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/assignments"
          className="bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary-600/20"
        >
          <h3 className="text-xl font-bold text-white mb-2">Assignments</h3>
          <p className="text-gray-400 text-sm">View pending assignments</p>
          <span className="inline-block mt-4 text-primary-400 font-semibold text-sm">View all →</span>
        </Link>

        <Link
          href="/dashboard/progress"
          className="bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary-600/20"
        >
          <h3 className="text-xl font-bold text-white mb-2">Progress Tracker</h3>
          <p className="text-gray-400 text-sm">Track your learning progress</p>
          <span className="inline-block mt-4 text-primary-400 font-semibold text-sm">View all →</span>
        </Link>

        <Link
          href="/achievements/badges"
          className="bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary-600/20"
        >
          <h3 className="text-xl font-bold text-white mb-2">Achievements</h3>
          <p className="text-gray-400 text-sm">Earn badges and certificates</p>
          <span className="inline-block mt-4 text-primary-400 font-semibold text-sm">View all →</span>
        </Link>
      </div>
    </div>
  );
}
