import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getEmailService, emailTemplates } from "@/lib/email-service";
import prisma from "@/lib/db";

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

    // Check if event exists and is available for registration
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        venue: true,
        eventDate: true,
        startTime: true,
        endTime: true,
        capacity: true,
        isPublished: true,
        isCancelled: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.isPublished || event.isCancelled) {
      return NextResponse.json(
        { error: "Event is not available for registration" },
        { status: 400 }
      );
    }

    if (event.eventDate < new Date()) {
      return NextResponse.json(
        { error: "Event has already started" },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.capacity && event._count.registrations >= event.capacity) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 409 }
      );
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId,
        eventId,
        status: "REGISTERED",
        registeredAt: new Date(),
      },
      include: {
        event: true,
        user: true,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        title: "Event Registration Confirmed 🎉",
        message: `You have successfully registered for "${event.title}". Location: ${event.location || event.venue}`,
        type: "EVENT_REMINDER",
        link: `/dashboard/events/${eventId}`,
      },
    });

    // Send confirmation email
    try {
      const emailService = getEmailService();
      const emailContent = emailTemplates.eventRegistration(registration);

      await emailService.send({
        to: registration.user.email,
        ...emailContent,
      });
    } catch (error) {
      console.error("Error sending event registration email:", error);
    }

    return NextResponse.json({
      success: true,
      data: {
        registrationId: registration.id,
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
        status: registration.status,
      },
    });
  } catch (error) {
    console.error("Error registering for event:", error);
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

    // Find and delete registration
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      include: {
        event: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Check if event has already started
    if (registration.event.eventDate < new Date()) {
      return NextResponse.json(
        { error: "Cannot cancel registration for an event that has already started" },
        { status: 400 }
      );
    }

    // Delete registration
    await prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    // Create cancellation notification
    await prisma.notification.create({
      data: {
        userId,
        title: "Registration Cancelled",
        message: `Your registration for "${registration.event.title}" has been cancelled.`,
        type: "SYSTEM",
        link: `/dashboard/events`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling event registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}