import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get upcoming university events
    const events = await prisma.event.findMany({
      where: {
        AND: [
          { type: "UNIVERSITY" },
          { eventDate: { gte: new Date() } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        location: true,
        attendeeCount: true,
        maxAttendees: true,
      },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.eventDate.toISOString(),
        location: event.location,
        attendees: event.attendeeCount,
        maxAttendees: event.maxAttendees,
        spotsAvailable: event.maxAttendees - event.attendeeCount,
      })),
    });
  } catch (error) {
    console.error("Error fetching uni events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "UNI_MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { eventId, action } = await request.json();
    const userId = payload.userId;

    if (action === "register") {
      // Register for event
      const eventAttendee = await prisma.eventAttendee.create({
        data: {
          eventId,
          userId,
        },
      });

      // Increment attendee count
      await prisma.event.update({
        where: { id: eventId },
        data: { attendeeCount: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        message: "Registered for event",
        eventAttendee,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error registering for event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
