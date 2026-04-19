/**
 * Quiz operations using Firestore
 * Handles quizzes, questions, and attempts
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  description?: string;
  passingScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: "multiple-choice" | "true-false" | "essay" | "fill-in";
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score?: number;
  passed?: boolean;
  answers: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Get a quiz
 */
export async function getQuiz(
  quizId: string,
  courseId: string
): Promise<Quiz | null> {
  try {
    const docRef = doc(db, "courses", courseId, "quizzes", quizId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Quiz;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw error;
  }
}

/**
 * List all quizzes for a course or lesson
 */
export async function listQuizzes(
  courseId: string,
  lessonId?: string
): Promise<Quiz[]> {
  try {
    const quizzesRef = collection(db, "courses", courseId, "quizzes");
    let constraints = [];

    if (lessonId) {
      constraints.push(where("lessonId", "==", lessonId));
    }
    constraints.push(orderBy("createdAt", "asc"));

    const q = query(quizzesRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      courseId,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as Quiz[];
  } catch (error) {
    console.error("Error listing quizzes:", error);
    throw error;
  }
}

/**
 * Get quiz questions
 */
export async function getQuizQuestions(
  quizId: string,
  courseId: string
): Promise<QuizQuestion[]> {
  try {
    const questionsRef = collection(
      db,
      "courses",
      courseId,
      "quizzes",
      quizId,
      "questions"
    );

    const q = query(questionsRef, orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      quizId,
      ...doc.data(),
    })) as QuizQuestion[];
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    throw error;
  }
}

/**
 * Start a quiz attempt
 */
export async function startQuizAttempt(
  quizId: string,
  courseId: string,
  userId: string
): Promise<QuizAttempt> {
  try {
    const attemptsRef = collection(
      db,
      "courses",
      courseId,
      "quizzes",
      quizId,
      "attempts"
    );

    const docRef = doc(attemptsRef);
    const now = new Date();
    const data = {
      quizId,
      userId,
      answers: {},
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, data);

    return {
      id: docRef.id,
      ...data,
      startedAt: now,
    } as QuizAttempt;
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    throw error;
  }
}

/**
 * Save quiz answers
 */
export async function saveQuizAnswers(
  quizId: string,
  attemptId: string,
  courseId: string,
  answers: Record<string, any>
): Promise<QuizAttempt | null> {
  try {
    const docRef = doc(
      db,
      "courses",
      courseId,
      "quizzes",
      quizId,
      "attempts",
      attemptId
    );

    await updateDoc(docRef, {
      answers,
      updatedAt: new Date(),
    });

    const updated = await getDoc(docRef);
    const data = updated.data();

    return {
      id: updated.id,
      ...data,
      startedAt: data?.startedAt?.toDate?.() || new Date(),
      completedAt: data?.completedAt?.toDate?.() || undefined,
    } as QuizAttempt;
  } catch (error) {
    console.error("Error saving quiz answers:", error);
    throw error;
  }
}

/**
 * Submit/complete a quiz
 */
export async function submitQuiz(
  quizId: string,
  attemptId: string,
  courseId: string,
  score: number,
  passingScore?: number
): Promise<QuizAttempt | null> {
  try {
    const docRef = doc(
      db,
      "courses",
      courseId,
      "quizzes",
      quizId,
      "attempts",
      attemptId
    );

    const passed =
      passingScore !== undefined ? score >= passingScore : score >= 60;

    await updateDoc(docRef, {
      score,
      passed,
      completedAt: new Date(),
      updatedAt: new Date(),
    });

    const updated = await getDoc(docRef);
    const data = updated.data();

    return {
      id: updated.id,
      ...data,
      startedAt: data?.startedAt?.toDate?.() || new Date(),
      completedAt: data?.completedAt?.toDate?.() || undefined,
    } as QuizAttempt;
  } catch (error) {
    console.error("Error submitting quiz:", error);
    throw error;
  }
}

/**
 * Get user's quiz attempts
 */
export async function getUserQuizAttempts(
  quizId: string,
  courseId: string,
  userId: string
): Promise<QuizAttempt[]> {
  try {
    const attemptsRef = collection(
      db,
      "courses",
      courseId,
      "quizzes",
      quizId,
      "attempts"
    );

    const q = query(
      attemptsRef,
      where("userId", "==", userId),
      orderBy("startedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startedAt: doc.data().startedAt?.toDate?.() || new Date(),
      completedAt: doc.data().completedAt?.toDate?.() || undefined,
    })) as QuizAttempt[];
  } catch (error) {
    console.error("Error fetching user quiz attempts:", error);
    throw error;
  }
}

/**
 * Get quiz statistics
 */
export async function getQuizStats(
  quizId: string,
  courseId: string
): Promise<any> {
  try {
    const attemptsRef = collection(
      db,
      "courses",
      courseId,
      "quizzes",
      quizId,
      "attempts"
    );

    const q = query(
      attemptsRef,
      where("completedAt", "!=", null)
    );
    const querySnapshot = await getDocs(q);

    const attempts = querySnapshot.docs.map((doc) => doc.data());

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
      };
    }

    const scores = attempts
      .filter((a: any) => a.score !== undefined)
      .map((a: any) => a.score);
    const passedCount = attempts.filter((a: any) => a.passed).length;

    return {
      totalAttempts: attempts.length,
      averageScore:
        scores.length > 0
          ? (scores.reduce((a: number, b: number) => a + b, 0) /
              scores.length).toFixed(2)
          : 0,
      passRate: ((passedCount / attempts.length) * 100).toFixed(2),
    };
  } catch (error) {
    console.error("Error fetching quiz statistics:", error);
    throw error;
  }
}
