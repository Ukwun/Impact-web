import { useState, useEffect } from "react";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

// ============ Types ============

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  modules: Module[];
  _count?: { enrollments: number };
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  materials: Material[];
  instructor?: string;
}

export interface Material {
  name: string;
  url: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  totalPoints: number;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: { questionId: string; answer: string }[];
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  rubric: RubricItem[];
}

export interface RubricItem {
  id: string;
  criteria: string;
  points: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  files: SubmissionFile[];
  submittedAt: string;
  isLate: boolean;
}

export interface SubmissionFile {
  name: string;
  size: number;
  mimeType: string;
}

export interface UserProgress {
  enrollments: Enrollment[];
}

export interface Enrollment {
  id: string;
  courseId: string;
  course: Course;
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  assignmentSubmissions: AssignmentSubmission[];
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt: string | null;
}

// ============ Hooks ============

/**
 * Fetch all published courses
 */
export function useCourses(page = 1, limit = 10) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [page, limit]);

  return { courses, loading, error };
}

/**
 * Fetch single lesson by ID
 */
export function useLesson(lessonId: string) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/lessons/${lessonId}`);
        if (!response.ok) throw new Error("Failed to fetch lesson");
        const data = await response.json();
        setLesson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return { lesson, loading, error };
}

/**
 * Fetch single quiz by ID
 */
export function useQuiz(quizId: string) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) throw new Error("Failed to fetch quiz");
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  return { quiz, loading, error };
}

/**
 * Submit quiz answers and get score
 */
export async function submitQuiz(
  quizId: string,
  answers: { questionId: string; answer: string }[]
): Promise<QuizAttempt> {
  const response = await fetch(`/api/quizzes/${quizId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) throw new Error("Failed to submit quiz");
  return response.json();
}

/**
 * Fetch single assignment by ID
 */
export function useAssignment(assignmentId: string) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assignments/${assignmentId}`);
        if (!response.ok) throw new Error("Failed to fetch assignment");
        const data = await response.json();
        setAssignment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  return { assignment, loading, error };
}

/**
 * Submit assignment files
 */
export async function submitAssignment(
  assignmentId: string,
  files: File[]
): Promise<AssignmentSubmission> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`/api/assignments/${assignmentId}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to submit assignment");
  return response.json();
}

/**
 * Fetch user's progress and enrollments
 */
export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const headers: any = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch("/api/progress", { headers });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to fetch progress (${response.status})`);
        }
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        console.error("❌ Error fetching progress:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  return { progress, loading, error };
}

/**
 * Fetch student enrollments for a facilitator's class
 */
export function useClassStudents(classId: string) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const headers: any = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        // This would be a custom endpoint - for now, we'll use progress endpoint
        const response = await fetch("/api/progress", { headers });
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data.enrollments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  return { students, loading, error };
}
