'use client';

import { useState } from 'react';

interface UseLessonCompleteReturn {
  marking: boolean;
  error: string | null;
  success: boolean;
  markComplete: (lessonId: string, secondsWatched?: number) => Promise<boolean>;
  reset: () => void;
}

/**
 * useLessonComplete Hook
 * Handles marking a lesson as complete
 */
export function useLessonComplete(): UseLessonCompleteReturn {
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const markComplete = async (
    lessonId: string,
    secondsWatched?: number
  ): Promise<boolean> => {
    try {
      setMarking(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secondsWatched: secondsWatched || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark lesson as complete');
      }

      if (data.success) {
        setSuccess(true);
        console.log(`✅ Marked lesson ${lessonId} as complete`);
        return true;
      } else {
        throw new Error(data.error || 'Failed to mark lesson complete');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Mark complete error:', message);
      return false;
    } finally {
      setMarking(false);
    }
  };

  const reset = () => {
    setMarking(false);
    setError(null);
    setSuccess(false);
  };

  return { marking, error, success, markComplete, reset };
}
