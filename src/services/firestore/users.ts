/**
 * User operations using Firestore
 * Handles all CRUD operations for users
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
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  verified: boolean;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  password?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  verified?: boolean;
  active?: boolean;
}

/**
 * Get a single user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, "users", userId);
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
    } as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as User;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

/**
 * Get all users (admin only)
 */
export async function listUsers(filters?: {
  role?: string;
  active?: boolean;
}): Promise<User[]> {
  try {
    let constraints = [];

    if (filters?.role) {
      constraints.push(where("role", "==", filters.role));
    }

    if (filters?.active !== undefined) {
      constraints.push(where("active", "==", filters.active));
    }

    const usersRef = collection(db, "users");
    const q =
      constraints.length > 0
        ? query(usersRef, ...constraints, orderBy("createdAt", "desc"))
        : query(usersRef, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    })) as User[];
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    const usersRef = collection(db, "users");
    const now = new Date();

    const docRef = doc(usersRef);
    const userData = {
      ...input,
      role: input.role ?? "LEARNER",
      verified: false,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    // Remove password from Firestore (should be in Firebase Auth)
    const { password, ...dataToStore } = userData;

    await setDoc(docRef, dataToStore);

    return {
      id: docRef.id,
      ...dataToStore,
    } as User;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update a user
 */
export async function updateUser(
  userId: string,
  input: UpdateUserInput
): Promise<User | null> {
  try {
    const docRef = doc(db, "users", userId);
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
    } as User;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete a user (soft delete)
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    // Soft delete
    await updateDoc(docRef, {
      active: false,
      deleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Update user verification status
 */
export async function verifyUser(userId: string): Promise<User | null> {
  return updateUser(userId, { verified: true });
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      lastLogin: new Date(),
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
}

/**
 * Count users
 */
export async function countUsers(): Promise<number> {
  try {
    const users = await listUsers();
    return users.length;
  } catch (error) {
    console.error("Error counting users:", error);
    throw error;
  }
}
