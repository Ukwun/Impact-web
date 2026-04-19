/**
 * Lesson operations using Firestore
 * Handles all CRUD operations for lessons
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
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// Types
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  duration?: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  materials?: any[];
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  duration?: number;
  order?: number;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  duration?: number;
  order?: number;
}

/**
 * Get a single lesson by ID
 */
export async function getLesson(
  lessonId: string,
  courseId: string
): Promise<Lesson | null> {
  try {
    const docRef = doc(db, "courses", courseId, "lessons", lessonId);
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
    } as Lesson;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
}

/**
 * Get all lessons for a course
 */
export async function listLessons(courseId: string): Promise<Lesson[]> {
  try {
    const lessonsRef = collection(db, "courses", courseId, "lessons");
    const q = query(lessonsRef, orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      courseId,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as Lesson[];
  } catch (error) {
    console.error("Error listing lessons:", error);
    throw error;
  }
}

/**
 * Create a new lesson
 */
export async function createLesson(
  courseId: string,
  input: CreateLessonInput
): Promise<Lesson> {
  try {
    const lessonsRef = collection(db, "courses", courseId, "lessons");
    const now = new Date();

    // Get next order if not specified
    let order = input.order ?? 0;
    if (!input.order) {
      const q = query(lessonsRef, orderBy("order", "desc"));
      const snapshot = await getDocs(q);
      order = (snapshot.docs[0]?.data().order ?? -1) + 1;
    }

    const docRef = doc(lessonsRef);
    const lessonData = {
      ...input,
      order,
      courseId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, lessonData);

    return {
      id: docRef.id,
      ...lessonData,
    } as Lesson;
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
}

/**
 * Update a lesson
 */
export async function updateLesson(
  lessonId: string,
  courseId: string,
  input: UpdateLessonInput
): Promise<Lesson | null> {
  try {
    const docRef = doc(db, "courses", courseId, "lessons", lessonId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const updateData = {
      ...input,
      updatedAt: new Date(),
    };

    await updateDoc(docRef, updateData);

    const updated = await getDoc(docRef);
    const data = updated.data();

    return {
      id: updated.id,
      ...data,
      createdAt: data?.createdAt?.toDate?.() || new Date(),
      updatedAt: data?.updatedAt?.toDate?.() || new Date(),
    } as Lesson;
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(
  lessonId: string,
  courseId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, "courses", courseId, "lessons", lessonId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
}

/**
 * Get lesson with user progress
 */
export async function getLessonWithProgress(
  lessonId: string,
  courseId: string,
  userId: string
): Promise<any | null> {
  try {
    const lesson = await getLesson(lessonId, courseId);

    if (!lesson) {
      return null;
    }

    // Get user progress if needed
    try {
      const progressRef = doc(
        db,
        "courses",
        courseId,
        "progress",
        userId,
        "lessons",
        lessonId
      );
      const progressSnap = await getDoc(progressRef);

      return {
        ...lesson,
        progress: progressSnap.exists() ? progressSnap.data() : null,
      };
    } catch {
      // Progress tracking optional
      return lesson;
    }
  } catch (error) {
    console.error("Error fetching lesson with progress:", error);
    throw error;
  }
}
