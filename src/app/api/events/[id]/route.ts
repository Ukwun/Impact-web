import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// Validation schema for updating event
const UpdateEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  capacity: z.number().min(1).optional(),
  registeredCount: z.number().min(0).optional(),
  eventType: z.enum(["NATIONAL", "STATE", "SCHOOL", "CIRCLE"]).optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
  thumbnail: z.string().url().optional(),
});

// Helper to get auth user from token
function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * GET /api/events/[id]
 * Get event details
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
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        registrations: {
          select: {
            id: true,
            registeredAt: true,
            attendanceStatus: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            registrations: true,
          },
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
        ...event,
        registrationCount: event._count.registrations,
      },
    });
  } catch (error) {
    console.error("Get event error:", error);
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
    const user = getAuthUser(req);

    // Verify authentication
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get event and verify creator/admin
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

    // Verify authorization
    if (
      event.createdById !== user.sub &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this event" },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validatedData = UpdateEventSchema.parse(body);

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: validatedData,
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        status: updatedEvent.status,
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

    console.error("Update event error:", error);
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
    const user = getAuthUser(req);

    // Verify authentication
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get event and verify creator/admin
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

    // Verify authorization
    if (
      event.createdById !== user.sub &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this event" },
        { status: 403 }
      );
    }

    // Delete event (cascade deletes registrations)
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: `Event "${event.title}" has been deleted`,
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
