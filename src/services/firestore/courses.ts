/**
 * Course operations using Firestore
 * Handles all CRUD operations for courses
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

// Types
export interface Course {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
  language?: string;
  instructorId: string;
  instructorName?: string;
  price?: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  enrollmentCount?: number;
  rating?: number;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
  language?: string;
  instructorName?: string;
  price?: number;
  published?: boolean;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
  language?: string;
  instructorName?: string;
  price?: number;
  published?: boolean;
}

/**
 * Get a single course by ID
 */
export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const docRef = doc(db, "courses", courseId);
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
    } as Course;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

/**
 * Get all courses
 */
export async function listCourses(
  filters?: {
    published?: boolean;
    instructorId?: string;
    category?: string;
  }
): Promise<Course[]> {
  try {
    let constraints = [];

    if (filters?.published !== undefined) {
      constraints.push(where("published", "==", filters.published));
    }

    if (filters?.instructorId) {
      constraints.push(where("instructorId", "==", filters.instructorId));
    }

    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }

    const coursesRef = collection(db, "courses");
    const q =
      constraints.length > 0
        ? query(coursesRef, ...constraints, orderBy("createdAt", "desc"))
        : query(coursesRef, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as Course[];
  } catch (error) {
    console.error("Error listing courses:", error);
    throw error;
  }
}

/**
 * Create a new course
 */
export async function createCourse(
  instructorId: string,
  input: CreateCourseInput
): Promise<Course> {
  try {
    const coursesRef = collection(db, "courses");
    const now = new Date();

    const docRef = doc(coursesRef);
    const courseData = {
      ...input,
      instructorId,
      published: input.published ?? false,
      enrollmentCount: 0,
      rating: 0,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, courseData);

    return {
      id: docRef.id,
      ...courseData,
    } as Course;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}

/**
 * Update a course
 */
export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput
): Promise<Course | null> {
  try {
    const docRef = doc(db, "courses", courseId);
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
    } as Course;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<boolean> {
  try {
    const docRef = doc(db, "courses", courseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    // Don't fully delete, just mark as deleted or archive
    await updateDoc(docRef, {
      deleted: true,
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}

/**
 * Get courses by instructor
 */
export async function getInstructorCourses(
  instructorId: string
): Promise<Course[]> {
  return listCourses({ instructorId });
}

/**
 * Publish/unpublish a course
 */
export async function publishCourse(
  courseId: string,
  published: boolean
): Promise<Course | null> {
  return updateCourse(courseId, { published });
}

/**
 * Increment enrollment count
 */
export async function incrementEnrollmentCount(
  courseId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, "courses", courseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const currentCount = docSnap.data().enrollmentCount ?? 0;
    await updateDoc(docRef, {
      enrollmentCount: currentCount + 1,
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error incrementing enrollment count:", error);
    throw error;
  }
}

/**
 * Decrement enrollment count
 */
export async function decrementEnrollmentCount(
  courseId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, "courses", courseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const currentCount = docSnap.data().enrollmentCount ?? 0;
    await updateDoc(docRef, {
      enrollmentCount: Math.max(0, currentCount - 1),
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error decrementing enrollment count:", error);
    throw error;
  }
}
