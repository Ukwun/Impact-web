'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  difficulty: string;
  duration: number;
  language: string;
  instructor: string;
  lessonCount: number;
  moduleCount: number;
  enrollmentCount: number;
  createdAt: string;
  isLoading?: boolean;
}

interface UseCoursesReturn {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

/**
 * useCourses Hook
 * Fetches courses from the API
 */
export function useCourses(limit: number = 10, difficulty?: string): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let url = `/api/courses?limit=${limit}`;
        if (difficulty) {
          url += `&difficulty=${difficulty}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data.data?.courses || []);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [limit, difficulty]);

  return { courses, loading, error };
}
