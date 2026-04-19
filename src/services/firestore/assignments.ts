/**
 * Assignment operations using Firestore
 * Handles assignments, submissions, and grading
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

export interface Assignment {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  maxScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionUrl?: string;
  notes?: string;
  score?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
}

/**
 * Get an assignment
 */
export async function getAssignment(
  assignmentId: string,
  courseId: string
): Promise<Assignment | null> {
  try {
    const docRef = doc(
      db,
      "courses",
      courseId,
      "assignments",
      assignmentId
    );
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
    } as Assignment;
  } catch (error) {
    console.error("Error fetching assignment:", error);
    throw error;
  }
}

/**
 * Get all assignments for a course or lesson
 */
export async function listAssignments(
  courseId: string,
  lessonId?: string
): Promise<Assignment[]> {
  try {
    let assignmentsRef = collection(
      db,
      "courses",
      courseId,
      "assignments"
    );

    let constraints = [];
    if (lessonId) {
      constraints.push(where("lessonId", "==", lessonId));
    }
    constraints.push(orderBy("dueDate", "asc"));

    const q = query(assignmentsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      courseId,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as Assignment[];
  } catch (error) {
    console.error("Error listing assignments:", error);
    throw error;
  }
}

/**
 * Get all submissions for an assignment
 */
export async function listSubmissions(
  assignmentId: string,
  courseId: string
): Promise<AssignmentSubmission[]> {
  try {
    const submissionsRef = collection(
      db,
      "courses",
      courseId,
      "assignments",
      assignmentId,
      "submissions"
    );

    const q = query(submissionsRef, orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      assignmentId,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
      gradedAt: doc.data().gradedAt?.toDate?.() || undefined,
    })) as AssignmentSubmission[];
  } catch (error) {
    console.error("Error listing submissions:", error);
    throw error;
  }
}

/**
 * Get user's submission for an assignment
 */
export async function getUserSubmission(
  assignmentId: string,
  courseId: string,
  userId: string
): Promise<AssignmentSubmission | null> {
  try {
    const submissionsRef = collection(
      db,
      "courses",
      courseId,
      "assignments",
      assignmentId,
      "submissions"
    );

    const q = query(submissionsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      assignmentId,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
      gradedAt: doc.data().gradedAt?.toDate?.() || undefined,
    } as AssignmentSubmission;
  } catch (error) {
    console.error("Error fetching user submission:", error);
    throw error;
  }
}

/**
 * Create or update a submission
 */
export async function submitAssignment(
  assignmentId: string,
  courseId: string,
  userId: string,
  submissionData: any
): Promise<AssignmentSubmission> {
  try {
    const submissionsRef = collection(
      db,
      "courses",
      courseId,
      "assignments",
      assignmentId,
      "submissions"
    );

    // Check if submission already exists
    const existing = await getUserSubmission(assignmentId, courseId, userId);

    if (existing) {
      // Update existing
      const docRef = doc(submissionsRef, existing.id);
      await updateDoc(docRef, {
        ...submissionData,
        updatedAt: new Date(),
      });
      return { ...existing, ...submissionData };
    } else {
      // Create new
      const docRef = doc(submissionsRef);
      const now = new Date();
      const data = {
        ...submissionData,
        userId,
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, data);
      return {
        id: docRef.id,
        assignmentId,
        ...data,
      } as AssignmentSubmission;
    }
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw error;
  }
}

/**
 * Grade a submission
 */
export async function gradeSubmission(
  assignmentId: string,
  submissionId: string,
  courseId: string,
  score: number,
  feedback: string
): Promise<AssignmentSubmission | null> {
  try {
    const docRef = doc(
      db,
      "courses",
      courseId,
      "assignments",
      assignmentId,
      "submissions",
      submissionId
    );

    await updateDoc(docRef, {
      score,
      feedback,
      gradedAt: new Date(),
      updatedAt: new Date(),
    });

    const updated = await getDoc(docRef);
    const data = updated.data();

    return {
      id: updated.id,
      assignmentId,
      ...data,
      submittedAt: data?.submittedAt?.toDate?.() || new Date(),
      gradedAt: data?.gradedAt?.toDate?.() || undefined,
    } as AssignmentSubmission;
  } catch (error) {
    console.error("Error grading submission:", error);
    throw error;
  }
}
