'use client';

/**
 * Course Content Hooks
 * React hooks for managing course content with caching and mutations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { CourseContent, CourseLesson, ContentBlock, CourseContentDraft } from '@/types/courseContent';
import {
  getCourseContent,
  getLesson,
  getLessonsByCourse,
  createNewLesson,
  updateLesson,
  updateLessonContent,
  publishLesson,
  unpublishLesson,
  deleteLesson,
  saveDraft,
  uploadMedia,
  getCourseAnalytics,
} from '@/lib/courseContentManager';

// Simple cache implementation
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

/**
 * Hook to fetch course content
 */
export function useCourseContent(courseId: string) {
  const [content, setContent] = useState<CourseContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      const cacheKey = `courseContent-${courseId}`;
      const cached = getCachedData(cacheKey);

      if (cached) {
        setContent(cached as CourseContent);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getCourseContent(courseId);
        setContent(data);
        setCachedData(cacheKey, data, 60000); // 1 minute
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch content'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const refetch = useCallback(async () => {
    if (!courseId) return;
    const cacheKey = `courseContent-${courseId}`;
    cache.delete(cacheKey);
    const data = await getCourseContent(courseId);
    setContent(data);
  }, [courseId]);

  return {
    content,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch a specific lesson
 */
export function useLesson(lessonId: string) {
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchData = async () => {
      const cacheKey = `lesson-${lessonId}`;
      const cached = getCachedData(cacheKey);

      if (cached) {
        setLesson(cached as CourseLesson);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getLesson(lessonId);
        setLesson(data);
        setCachedData(cacheKey, data, 30000); // 30 seconds
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch lesson'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const refetch = useCallback(async () => {
    if (!lessonId) return;
    const cacheKey = `lesson-${lessonId}`;
    cache.delete(cacheKey);
    const data = await getLesson(lessonId);
    setLesson(data);
  }, [lessonId]);

  return {
    lesson,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch all lessons for a course
 */
export function useLessons(courseId: string) {
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      const cacheKey = `lessons-${courseId}`;
      const cached = getCachedData(cacheKey);

      if (cached) {
        setLessons(cached as CourseLesson[]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getLessonsByCourse(courseId);
        setLessons(data);
        setCachedData(cacheKey, data, 60000); // 1 minute
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch lessons'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const refetch = useCallback(async () => {
    if (!courseId) return;
    const cacheKey = `lessons-${courseId}`;
    cache.delete(cacheKey);
    const data = await getLessonsByCourse(courseId);
    setLessons(data);
  }, [courseId]);

  return {
    lessons,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for course content mutations (create, update, delete)
 */
export function useCourseContentMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewLesson_ = useCallback(
    async (courseId: string, lessonData: Partial<CourseLesson>) => {
      setIsLoading(true);
      setError(null);

      try {
        const lesson = await createNewLesson(courseId, lessonData);
        return lesson;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create lesson';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateLesson_ = useCallback(
    async (lessonId: string, updates: Partial<CourseLesson>) => {
      setIsLoading(true);
      setError(null);

      try {
        const lesson = await updateLesson(lessonId, updates);
        return lesson;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update lesson';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateContent = useCallback(
    async (lessonId: string, content: ContentBlock[]) => {
      setIsLoading(true);
      setError(null);

      try {
        const lesson = await updateLessonContent(lessonId, content);
        return lesson;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update content';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const publish = useCallback(
    async (lessonId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const lesson = await publishLesson(lessonId);
        return lesson;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to publish lesson';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const unpublish = useCallback(
    async (lessonId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        return await unpublishLesson(lessonId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to unpublish lesson';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const delete_ = useCallback(
    async (lessonId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        return await deleteLesson(lessonId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete lesson';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createLesson: createNewLesson_,
    updateLesson: updateLesson_,
    updateContent,
    publish,
    unpublish,
    deleteLesson: delete_,
    isLoading,
    error,
  };
}

/**
 * Hook for auto-saving drafts
 */
export function useAutoSaveDraft(courseContentId: string, content: Partial<CourseContent>, enabled = true) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !courseContentId) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new auto-save timeout (5 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await saveDraft(courseContentId, content);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 5000); // Wait 5 seconds for more changes before saving

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [courseContentId, content, enabled]);

  return { lastSaved, isSaving };
}

/**
 * Hook for media uploads
 */
export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const upload = useCallback(
    async (file: File): Promise<{ url: string; id: string } | null> => {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress((p) => Math.min(p + 20, 90));
        }, 200);

        const result = await uploadMedia(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setUploadError(errorMsg);
        return null;
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    []
  );

  return { upload, isUploading, uploadError, uploadProgress };
}

/**
 * Hook for course analytics
 */
export function useCourseAnalytics(courseId: string) {
  const [analytics, setAnalytics] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      const cacheKey = `courseAnalytics-${courseId}`;
      const cached = getCachedData(cacheKey);

      if (cached) {
        setAnalytics(cached);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getCourseAnalytics(courseId);
        setAnalytics(data);
        setCachedData(cacheKey, data, 300000); // 5 minute cache
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  return {
    analytics,
    isLoading,
    error,
  };
}
