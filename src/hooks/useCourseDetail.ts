'use client';

import { useState, useEffect } from 'react';

interface Module {
  id: string;
  title: string;
  order: number;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number;
  videoUrl?: string;
  order: number;
  moduleId?: string;
  isCompleted?: boolean;
}

interface Enrollment {
  id: string;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  lastAccessedAt: string;
  completedLessonIds: string[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  difficulty: string;
  duration: number;
  language: string;
  instructor: string;
  enrollmentCount: number;
  lessonCount: number;
  isPublished: boolean;
  createdAt: string;
}

interface UseCourseDetailReturn {
  course: CourseDetail | null;
  lessons: Lesson[];
  modules: Module[];
  isEnrolled: boolean;
  enrollment: Enrollment | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useCourseDetail Hook
 * Fetches single course with lessons and enrollment status
 */
export function useCourseDetail(courseId: string): UseCourseDetailReturn {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }

      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
        setLessons(data.lessons || []);
        setModules(data.modules || []);
        setIsEnrolled(data.isEnrolled);
        setEnrollment(data.enrollment);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch course');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setCourse(null);
      setLessons([]);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  return {
    course,
    lessons,
    modules,
    isEnrolled,
    enrollment,
    loading,
    error,
    refetch: fetchCourse,
  };
}
