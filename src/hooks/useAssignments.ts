import { useState, useEffect } from "react";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

export interface AssignmentData {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  courseThumbnail?: string;
  dueDate: string;
  maxPoints: number;
  allowLateSubmission: boolean;
  rubric: Array<{
    id: string;
    criterion: string;
    points: number;
    description?: string;
  }>;
  submission?: {
    id: string;
    isSubmitted: boolean;
    submittedAt?: string;
    isLate: boolean;
    isGraded: boolean;
    score?: number;
    feedback?: string;
    files: Array<{
      id: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      uploadedAt: string;
    }>;
  };
  status: "GRADED" | "SUBMITTED" | "OVERDUE" | "PENDING";
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const headers: any = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch("/api/assignments", { headers });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to fetch assignments (${response.status})`);
        }
        const data = await response.json();
        setAssignments(data.data.assignments || []);
      } catch (err) {
        console.error("❌ Error fetching assignments:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  return { assignments, loading, error };
}

export function useAssignmentSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (assignmentId: string, files: File[], comments?: string) => {
    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      if (comments) {
        formData.append("comments", comments);
      }

      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit assignment");
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}
