/**
 * Event operations using Firestore
 * Handles events and event registrations
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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface Event {
  id: string;
  title: string;
  description?: string;
  image?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  capacity?: number;
  registeredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: "registered" | "attended" | "cancelled";
  registeredAt: Date;
  attendedAt?: Date;
}

/**
 * Get an event
 */
export async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const docRef = doc(db, "events", eventId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      startDate: data.startDate?.toDate?.() || new Date(),
      endDate: data.endDate?.toDate?.() || new Date(),
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Event;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
}

/**
 * List all events, optionally filtered
 */
export async function listEvents(filters?: {
  upcoming?: boolean;
  past?: boolean;
}): Promise<Event[]> {
  try {
    const eventsRef = collection(db, "events");
    const now = new Date();

    let constraints = [];

    if (filters?.upcoming !== undefined && filters.upcoming) {
      constraints.push(where("startDate", ">", now));
    }

    if (filters?.past !== undefined && filters.past) {
      constraints.push(where("endDate", "<", now));
    }

    constraints.push(orderBy("startDate", "asc"));

    const q = query(eventsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate?.() || new Date(),
        endDate: data.endDate?.toDate?.() || new Date(),
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Event;
    });
  } catch (error) {
    console.error("Error listing events:", error);
    throw error;
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  return listEvents({ upcoming: true });
}

/**
 * Get past events
 */
export async function getPastEvents(): Promise<Event[]> {
  return listEvents({ past: true });
}

/**
 * Register a user for an event
 */
export async function registerForEvent(
  eventId: string,
  userId: string
): Promise<EventRegistration> {
  try {
    // Check if already registered
    const existing = await getUserEventRegistration(eventId, userId);
    if (existing && existing.status !== "cancelled") {
      return existing;
    }

    const registrationsRef = collection(
      db,
      "events",
      eventId,
      "registrations"
    );

    const docRef = doc(registrationsRef);
    const now = new Date();
    const data = {
      eventId,
      userId,
      status: "registered",
      registeredAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, data);

    // Increment registered count
    await updateEvent(eventId, {
      registeredCount: (await getEvent(eventId))?.registeredCount || 0 + 1,
    });

    return {
      id: docRef.id,
      ...data,
      registeredAt: now,
    } as EventRegistration;
  } catch (error) {
    console.error("Error registering for event:", error);
    throw error;
  }
}

/**
 * Cancel event registration
 */
export async function cancelEventRegistration(
  eventId: string,
  registrationId: string
): Promise<boolean> {
  try {
    const docRef = doc(
      db,
      "events",
      eventId,
      "registrations",
      registrationId
    );

    await updateDoc(docRef, {
      status: "cancelled",
      updatedAt: new Date(),
    });

    // Decrement registered count
    const event = await getEvent(eventId);
    if (event) {
      await updateEvent(eventId, {
        registeredCount: Math.max(0, (event.registeredCount || 1) - 1),
      });
    }

    return true;
  } catch (error) {
    console.error("Error cancelling event registration:", error);
    throw error;
  }
}

/**
 * Mark user as attended
 */
export async function markEventAttendance(
  eventId: string,
  registrationId: string
): Promise<EventRegistration | null> {
  try {
    const docRef = doc(
      db,
      "events",
      eventId,
      "registrations",
      registrationId
    );

    const now = new Date();
    await updateDoc(docRef, {
      status: "attended",
      attendedAt: now,
      updatedAt: now,
    });

    const updated = await getDoc(docRef);
    const data = updated.data();

    return {
      id: updated.id,
      ...data,
      registeredAt: data?.registeredAt?.toDate?.() || new Date(),
      attendedAt: data?.attendedAt?.toDate?.() || undefined,
    } as EventRegistration;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
}

/**
 * Get user's event registrations
 */
export async function getUserEventRegistrations(
  userId: string
): Promise<EventRegistration[]> {
  try {
    // Fetch from all events registrations
    const eventsRef = collection(db, "events");
    const eventsSnap = await getDocs(eventsRef);

    const registrations: EventRegistration[] = [];

    for (const eventDoc of eventsSnap.docs) {
      const registrationsRef = collection(
        db,
        "events",
        eventDoc.id,
        "registrations"
      );
      const q = query(registrationsRef, where("userId", "==", userId));
      const regsSnap = await getDocs(q);

      regsSnap.docs.forEach((doc) => {
        const data = doc.data();
        registrations.push({
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate?.() || new Date(),
          attendedAt: data.attendedAt?.toDate?.() || undefined,
        } as EventRegistration);
      });
    }

    return registrations;
  } catch (error) {
    console.error("Error fetching user event registrations:", error);
    throw error;
  }
}

/**
 * Get event registrations
 */
export async function getEventRegistrations(
  eventId: string
): Promise<EventRegistration[]> {
  try {
    const registrationsRef = collection(
      db,
      "events",
      eventId,
      "registrations"
    );

    const q = query(registrationsRef, orderBy("registeredAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      registeredAt: doc.data().registeredAt?.toDate?.() || new Date(),
      attendedAt: doc.data().attendedAt?.toDate?.() || undefined,
    })) as EventRegistration[];
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    throw error;
  }
}

/**
 * Get user's registration for a specific event
 */
export async function getUserEventRegistration(
  eventId: string,
  userId: string
): Promise<EventRegistration | null> {
  try {
    const registrationsRef = collection(
      db,
      "events",
      eventId,
      "registrations"
    );

    const q = query(registrationsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      registeredAt: doc.data().registeredAt?.toDate?.() || new Date(),
      attendedAt: doc.data().attendedAt?.toDate?.() || undefined,
    } as EventRegistration;
  } catch (error) {
    console.error("Error fetching user event registration:", error);
    throw error;
  }
}

/**
 * Update an event
 */
export async function updateEvent(
  eventId: string,
  updates: any
): Promise<Event | null> {
  try {
    const docRef = doc(db, "events", eventId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });

    return getEvent(eventId);
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}
