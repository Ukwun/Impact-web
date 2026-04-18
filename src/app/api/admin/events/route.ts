import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * GET /api/admin/events
 * Get all events (admin only, for management)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload?.role || !["admin", "school_admin"].includes(payload.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { eventDate: "desc" },
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { registrations: true } },
        },
      }),
      prisma.event.count(),
    ]);

    return NextResponse.json({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.eventDate,
        location: e.location,
        status: e.status || "published",
        registrations: e._count.registrations,
        creator: e.creator,
        createdAt: e.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Create a new event (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload?.role || !["admin", "school_admin"].includes(payload.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      eventDate,
      location,
      capacity,
      eventType,
    } = body;

    if (!title || !eventDate) {
      return NextResponse.json(
        { error: "Title and event date are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || "",
        eventDate: new Date(eventDate),
        location: location || "",
        capacity: capacity || 100,
        eventType: eventType || "workshop",
        creatorId: payload.sub as string,
        status: "published",
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[id]
 * Update an event (admin only, or event creator)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload?.role || !["admin", "school_admin"].includes(payload.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const body = await request.json();

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only allow creator or admin to edit
    if (
      event.creatorId !== payload.sub &&
      payload.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: body.title || event.title,
        description: body.description !== undefined ? body.description : event.description,
        eventDate: body.eventDate ? new Date(body.eventDate) : event.eventDate,
        location: body.location || event.location,
        capacity: body.capacity || event.capacity,
        eventType: body.eventType || event.eventType,
        status: body.status || event.status,
      },
    });

    return NextResponse.json({
      success: true,
      event: updated,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Delete an event (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload?.role || !["admin", "school_admin"].includes(payload.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.event.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
