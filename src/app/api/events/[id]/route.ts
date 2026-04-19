import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const UpdateEventSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  eventDate: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venue: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().min(1).optional(),
  image: z.string().url().optional(),
  eventType: z.enum(["NATIONAL", "STATE", "SCHOOL", "CIRCLE", "WEBINAR", "WORKSHOP"]).optional(),
  isPublished: z.boolean().optional(),
  isCancelled: z.boolean().optional(),
  cancelledReason: z.string().optional(),
});

// Helper to verify authentication
function getAuthUser(req: NextRequest): any {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/events/[id]
 * Get a single event details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        location: event.location,
        capacity: event.capacity,
        image: event.image,
        eventType: event.eventType,
        isPublished: event.isPublished,
        isCancelled: event.isCancelled,
        cancelledReason: event.cancelledReason,
        creator: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
        attendees: event.registrations.map((reg) => ({
          id: reg.user.id,
          name: `${reg.user.firstName} ${reg.user.lastName}`,
          email: reg.user.email,
          status: reg.status,
          registeredAt: reg.registeredAt,
        })),
        registrationCount: event.registrations.length,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Fetch event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[id]
 * Update an event (creator or admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    // Verify authentication
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, title: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify ownership or admin status
    const isAdmin = user.role?.toUpperCase() === "ADMIN";
    const isCreator = event.createdById === user.sub;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { success: false, error: "You can only update your own events" },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validatedData = UpdateEventSchema.parse(body);

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: validatedData,
    });

    console.log(`✅ Event updated: ${eventId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        eventDate: updatedEvent.eventDate,
        isPublished: updatedEvent.isPublished,
        isCancelled: updatedEvent.isCancelled,
        updatedAt: updatedEvent.updatedAt,
      },
    });
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

    console.error("❌ Update event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]
 * Delete/cancel an event (creator or admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    // Verify authentication
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, title: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify ownership or admin status
    const isAdmin = user.role?.toUpperCase() === "ADMIN";
    const isCreator = event.createdById === user.sub;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own events" },
        { status: 403 }
      );
    }

    // Delete event (cascade deletes registrations)
    await prisma.event.delete({
      where: { id: eventId },
    });

    console.log(`✅ Event deleted: ${eventId}`);

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
