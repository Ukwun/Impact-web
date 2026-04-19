import { NextRequest, NextResponse } from "next/server";
import { getEvent, updateEvent, deleteEvent, logActivity } from "@/lib/firestore-utils";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/events/[id]
 * Get event details from Firestore
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const event = await getEvent(eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("❌ Get event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[id]
 * Update event (creator or admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get event from Firestore
    const event = await getEvent(eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify authorization (creator or admin)
    if (event.createdBy !== payload.sub && payload.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this event" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, eventDate, startTime, endTime, venue, location, capacity, image, eventType } = body;

    // Prepare updates
    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (eventDate) updates.eventDate = new Date(eventDate);
    if (startTime) updates.startTime = startTime;
    if (endTime) updates.endTime = endTime;
    if (venue) updates.venue = venue;
    if (location) updates.location = location;
    if (capacity !== undefined) updates.capacity = capacity;
    if (image) updates.image = image;
    if (eventType) updates.eventType = eventType;

    const updatedEvent = await updateEvent(eventId, updates);

    // Log activity
    await logActivity(payload.sub, {
      type: 'event_updated',
      description: `Updated event: ${event.title}`,
      eventId: eventId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error("❌ Update event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]
 * Delete event (creator or admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get event from Firestore
    const event = await getEvent(eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify authorization (creator or admin)
    if (event.createdBy !== payload.sub && payload.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this event" },
        { status: 403 }
      );
    }

    // Delete event
    await deleteEvent(eventId);

    // Log activity
    await logActivity(payload.sub, {
      type: 'event_deleted',
      description: `Deleted event: ${event.title}`,
      eventId: eventId,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Event "${event.title}" has been deleted`,
    });
  } catch (error) {
    console.error("❌ Delete event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
