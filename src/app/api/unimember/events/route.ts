import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload || payload.role !== "UNI_MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = payload.userId;

  try {
    // Get user's registered events
    const registeredEventIds = await prisma.eventRegistration.findMany({
      where: { userId },
      select: { eventId: true }
    });

    const registeredIds = new Set(registeredEventIds.map((r) => r.eventId));

    // Get all upcoming events
    const events = await prisma.event.findMany({
      where: {
        eventDate: { gte: new Date() },
        isActive: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        startTime: true,
        endTime: true,
        location: true,
        format: true,
        category: true,
        registrationDeadline: true,
        capacity: true,
        speakers: true,
        tags: true,
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { eventDate: "asc" },
      take: 50
    });

    // Format response
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      eventDate: event.eventDate.toISOString(),
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      format: event.format,
      speakers:
        event.speakers && Array.isArray(event.speakers)
          ? event.speakers.map((s: any) => ({
              name: s.name || "Speaker",
              title: s.title || "Professional"
            }))
          : [],
      attendeeCount: event._count.registrations,
      capacity: event.capacity,
      registrationDeadline: event.registrationDeadline.toISOString(),
      tags: event.tags || [],
      isRegistered: registeredIds.has(event.id)
    }));

    return NextResponse.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    console.error("Events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
