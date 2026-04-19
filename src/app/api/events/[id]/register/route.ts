import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getEvent, registerForEvent, getEventRegistrations, logActivity } from "@/lib/firestore-utils";
import * as admin from "firebase-admin";

/**
 * POST /api/events/[id]/register
 * Register for an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = payload.sub as string;
    const eventId = params.id;

    // Get event from Firestore
    const event = await getEvent(eventId);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event has already started
    const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
    if (eventDate < new Date()) {
      return NextResponse.json(
        { error: "Event has already started" },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.capacity && event.registeredCount >= event.capacity) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      );
    }

    // Register for event (will check for existing registration)
    const result = await registerForEvent(eventId, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Could not register for event" },
        { status: result.conflict ? 409 : 400 }
      );
    }

    // Log activity
    await logActivity(userId, {
      type: 'event_registered',
      description: `Registered for event: ${event.title}`,
      eventId: eventId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        registrationId: result.registrationId,
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          startTime: event.startTime,
          endTime: event.endTime,
          venue: event.venue,
          location: event.location,
          capacity: event.capacity,
        },
        status: "REGISTERED",
      },
    });
  } catch (error) {
    console.error("❌ Error registering for event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/register
 * Cancel event registration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = payload.sub as string;
    const eventId = params.id;

    // Get event and check if event exists and hasn't started
    const event = await getEvent(eventId);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event has already started
    const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
    if (eventDate < new Date()) {
      return NextResponse.json(
        { error: "Cannot cancel registration for an event that has already started" },
        { status: 400 }
      );
    }

    // Get registrations to find and delete user registration
    const registrations = await getEventRegistrations(eventId);
    const userReg = registrations.find((reg: any) => reg.userId === userId);

    if (!userReg) {
      return NextResponse.json(
        { error: "You are not registered for this event" },
        { status: 404 }
      );
    }

    // Delete registration from Firestore
    const db = admin.firestore();
    await db.collection("event_registrations").doc(userReg.id).delete();

    // Decrement registered count
    await db.collection("events").doc(eventId).update({
      registeredCount: admin.firestore.FieldValue.increment(-1),
    });

    // Log activity
    await logActivity(userId, {
      type: 'event_registration_cancelled',
      description: `Cancelled registration for event: ${event.title}`,
      eventId: eventId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("❌ Error cancelling event registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}