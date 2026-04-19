import { NextRequest, NextResponse } from "next/server";
import { listEvents, createEvent, logActivity } from "@/lib/firestore-utils";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/events
 * Fetch all published events from Firestore (upcoming by default)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType");
    const includePast = searchParams.get("includePast") === "true";

    // Build filter query
    const filters: any = {
      upcoming: !includePast,
    };

    if (eventType && eventType !== "all") {
      filters.eventType = eventType.toUpperCase();
    }

    const events = await listEvents(filters);

    // Transform data
    const eventsResponse = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      location: event.location,
      capacity: event.capacity,
      currentAttendees: event.registeredCount || 0,
      image: event.image,
      createdAt: event.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: eventsResponse,
    });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new event (Admin/Facilitator only)
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin or facilitator
    if (!["ADMIN", "FACILITATOR"].includes(payload.role?.toUpperCase() || "")) {
      return NextResponse.json(
        { error: "Only admins and facilitators can create events" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, eventDate, startTime, endTime, venue, location, capacity, image, eventType } = body;

    if (!title || !eventDate) {
      return NextResponse.json(
        { error: "Title and event date are required" },
        { status: 400 }
      );
    }

    const eventData = {
      title,
      description,
      eventDate: new Date(eventDate),
      startTime,
      endTime,
      venue,
      location,
      capacity: capacity || 0,
      image,
      eventType: eventType || "MEETUP",
      createdBy: payload.sub,
    };

    const newEvent = await createEvent(eventData);

    // Log activity
    await logActivity(payload.sub, {
      type: 'event_created',
      description: `Created event: ${title}`,
      eventId: newEvent.id,
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}


