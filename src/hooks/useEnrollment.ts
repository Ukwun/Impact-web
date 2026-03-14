'use client';

import { useState } from 'react';

interface EnrollmentResponse {
  success: boolean;
  message?: string;
  error?: string;
  enrollment?: {
    id: string;
    courseId: string;
    userId: string;
    progress: number;
    isCompleted: boolean;
    enrolledAt: string;
    course: {
      id: string;
      title: string;
      description: string;
      difficulty: string;
      duration: number;
    };
  };
}

interface UseEnrollmentReturn {
  enrolling: boolean;
  error: string | null;
  success: boolean;
  enroll: (courseId: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * useEnrollment Hook
 * Handles course enrollment
 */
export function useEnrollment(): UseEnrollmentReturn {
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const enroll = async (courseId: string): Promise<boolean> => {
    try {
      setEnrolling(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: EnrollmentResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll in course');
      }

      if (data.success) {
        setSuccess(true);
        console.log(`✅ Enrolled in course: ${courseId}`);
        return true;
      } else {
        throw new Error(data.error || 'Enrollment failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Enrollment error:', message);
      return false;
    } finally {
      setEnrolling(false);
    }
  };

  const reset = () => {
    setEnrolling(false);
    setError(null);
    setSuccess(false);
  };

  return { enrolling, error, success, enroll, reset };
}
