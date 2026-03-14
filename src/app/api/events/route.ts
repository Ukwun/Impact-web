import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/events
 * Fetch all published events (upcoming by default)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const eventType = searchParams.get("eventType");
    const featured = searchParams.get("featured") === "true";

    // Build filter query
    const where: any = {
      isPublished: true,
      isCancelled: false,
      eventDate: {
        gte: new Date(), // Only upcoming events
      },
    };

    if (eventType && eventType !== "all") {
      where.eventType = eventType.toUpperCase();
    }

    // Fetch events
    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      take: limit,
      orderBy: { eventDate: "asc" },
    });

    // Transform data
    const eventsResponse = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      location: event.location,
      eventType: event.eventType,
      capacity: event.capacity,
      registrationCount: event._count.registrations,
      createdBy: {
        name: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
      },
      createdAt: event.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        events: eventsResponse,
      },
    });
  } catch (error) {
    console.error("Fetch events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new event (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: Add authentication check here
    // const token = req.headers.get("authorization");
    // if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, eventDate, startTime, endTime, venue, location, eventType, capacity, createdById } = body;

    if (!title || !eventDate || !createdById) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || "",
        eventDate: new Date(eventDate),
        startTime: startTime || "09:00",
        endTime: endTime || "17:00",
        venue: venue || "",
        location: location || "",
        eventType: eventType || "WEBINAR",
        capacity: capacity || 100,
        createdById,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        data: { event },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
