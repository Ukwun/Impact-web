import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventDate: z.string().datetime(),
  startTime: z.string(),
  endTime: z.string(),
  venue: z.string(),
  location: z.string(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  image: z.string().url().optional(),
  eventType: z.enum(["NATIONAL", "STATE", "SCHOOL", "CIRCLE", "WEBINAR", "WORKSHOP"]),
});

/**
 * GET /api/events
 * Fetch all published events from PostgreSQL
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType");
    const includePast = searchParams.get("includePast") === "true";

    // Build filter query
    const where: any = { isPublished: true };
    if (!includePast) {
      where.eventDate = { gte: new Date() };
    }

    if (eventType && eventType !== "all") {
      where.eventType = eventType.toUpperCase();
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        registrations: { select: { id: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { eventDate: "asc" },
    });

    // Transform data
    const eventsResponse = events.map((event) => ({
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
      currentAttendees: event.registrations.length,
      image: event.image,
      creator: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
      isCancelled: event.isCancelled,
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

    // Check if user is admin, facilitator
    if (!["ADMIN", "FACILITATOR"].includes(payload.role?.toUpperCase() || "")) {
      return NextResponse.json(
        { error: "Only admins and facilitators can create events" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = CreateEventSchema.parse(body);

    // Create event in PostgreSQL
    const newEvent = await prisma.event.create({
      data: {
        ...validatedData,
        createdById: payload.sub,
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    console.log(`✅ Event created: ${newEvent.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newEvent.id,
          title: newEvent.title,
          eventDate: newEvent.eventDate,
          creator: `${newEvent.createdBy.firstName} ${newEvent.createdBy.lastName}`,
          createdAt: newEvent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("❌ Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}


