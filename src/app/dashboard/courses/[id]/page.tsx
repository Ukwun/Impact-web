'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Clock, Award, ChevronRight, Play, AlertCircle, Loader } from 'lucide-react';
import { useCourseDetail, useEnrollment } from '@/hooks';
import { Button } from '@/components/ui/Button';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string;
  
  const { course, lessons, modules, isEnrolled, enrollment, loading, error, refetch } = useCourseDetail(courseId);
  const { enrolling, error: enrollmentError, success: enrollmentSuccess, enroll } = useEnrollment();
  const [showEnrollSuccess, setShowEnrollSuccess] = useState(false);

  useEffect(() => {
    if (enrollmentSuccess) {
      setShowEnrollSuccess(true);
      setTimeout(() => {
        refetch();
        setShowEnrollSuccess(false);
      }, 2000);
    }
  }, [enrollmentSuccess, refetch]);

  const handleEnroll = async () => {
    const success = await enroll(courseId);
    if (success) {
      // Refetch course data to show updated enrollment status
      await refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-500/20 border-2 border-danger-500 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-danger-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-danger-500">Error Loading Course</h3>
            <p className="text-danger-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Course not found</p>
      </div>
    );
  }

  // Group lessons by module
  const lessonsByModule = modules.map(mod => ({
    ...mod,
    lessons: lessons.filter(l => l.moduleId === mod.id).sort((a, b) => a.order - b.order),
  }));

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showEnrollSuccess && (
        <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
            ✓
          </div>
          <p className="text-green-300 font-semibold">Successfully enrolled! Redirecting...</p>
        </div>
      )}

      {/* Enrollment Error */}
      {enrollmentError && (
        <div className="bg-danger-500/20 border-2 border-danger-500 rounded-lg p-4">
          <p className="text-danger-300">{enrollmentError}</p>
        </div>
      )}

      {/* Course Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-2xl p-8 text-white">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
              {course.difficulty}
            </span>
            {/* Removed rating since not provided in API */}
          </div>
          <h1 className="text-4xl lg:text-5xl font-black">{course.title}</h1>
          <p className="text-lg text-white/90">{course.description}</p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <BookOpen size={20} />
              <span>{course.lessonCount} lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>{Math.ceil(course.duration / 60)}h hours</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <span>{course.enrollmentCount.toLocaleString()} students</span>
            </div>
          </div>

          {isEnrolled && enrollment && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Course Progress</span>
                <span className="font-bold">{Math.round(enrollment.progress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${enrollment.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          {isEnrolled && enrollment ? (
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${lessons[0]?.id || ''}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Play size={20} />
              Continue Learning
            </Link>
          ) : (
            <Button
              onClick={handleEnroll}
              disabled={enrolling}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {enrolling ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Enroll Now'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Course Curriculum */}
      {isEnrolled ? (
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white">Course Curriculum</h2>

          <div className="space-y-4">
            {lessonsByModule.map((module) => {
              const completedCount = module.lessons.filter(l => l.isCompleted).length;
              return (
                <div
                  key={module.id}
                  className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg border-2 border-dark-400 overflow-hidden"
                >
                  {/* Module Header */}
                  <div className="px-6 py-4 border-b border-dark-400 flex items-center justify-between hover:bg-dark-400/50 transition-colors cursor-pointer">
                    <h3 className="font-bold text-white">{module.title}</h3>
                    <span className="text-gray-400 text-sm">
                      {completedCount}/{module.lessons.length}
                    </span>
                  </div>

                  {/* Lessons */}
                  {module.lessons.length > 0 ? (
                    <div className="divide-y divide-dark-400">
                      {module.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                          className="px-6 py-4 flex items-center gap-4 hover:bg-dark-400/50 transition-colors group"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              lesson.isCompleted
                                ? 'bg-green-600 text-white'
                                : 'bg-dark-400 text-gray-400 group-hover:bg-primary-600 group-hover:text-white'
                            }`}
                          >
                            {lesson.isCompleted ? '✓' : <Play size={14} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                              {lesson.title}
                            </p>
                            <p className="text-sm text-gray-400">{lesson.duration} minutes</p>
                          </div>

                          <ChevronRight className="text-gray-400 group-hover:text-primary-400 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-4 text-gray-400 text-sm">No lessons in this module yet</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-dark-500 rounded-lg border-2 border-dark-400 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Not Enrolled Yet</h3>
          <p className="text-gray-400 mb-6">Enroll in this course to view the curriculum and start learning</p>
          <Button
            onClick={handleEnroll}
            disabled={enrolling}
            className="inline-flex items-center gap-2"
          >
            {enrolling ? (
              <>
                <Loader size={18} className="animate-spin" />
                Enrolling...
              </>
            ) : (
              'Enroll Now'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
