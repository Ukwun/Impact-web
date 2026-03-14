'use client';

import { useState, useEffect } from 'react';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration: number;
  materials?: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
    fileSize?: number;
  }>;
}

interface UseLessonReturn {
  lesson: Lesson | null;
  loading: boolean;
  error: string | null;
}

/**
 * useLesson Hook
 * Fetches single lesson details
 */
export function useLesson(lessonId: string): UseLessonReturn {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/lessons/${lessonId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch lesson');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setLesson(data.data);
          setError(null);
        } else {
          throw new Error(data.error || 'Failed to fetch lesson');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return { lesson, loading, error };
}
