import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
    const includePast = searchParams.get("includePast") === "true";

    // Build filter query
    const where: any = {
      isPublished: true,
      isCancelled: false,
    };

    if (!includePast) {
      where.eventDate = {
        gte: new Date(), // Only upcoming events by default
      };
    }

    if (eventType && eventType !== "all") {
      where.eventType = eventType.toUpperCase();
    }

    if (featured) {
      where.isFeatured = true;
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
        registrations: {
          select: {
            userId: true,
            registeredAt: true,
            status: true,
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
      eventType: event.eventType,
      eventDate: event.eventDate,
      endDate: event.endDate,
      location: event.location,
      isVirtual: event.isVirtual,
      virtualLink: event.virtualLink,
      maxAttendees: event.maxAttendees,
      currentAttendees: event._count.registrations,
      isFeatured: event.isFeatured,
      tags: event.tags,
      imageUrl: event.imageUrl,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      registrations: event.registrations,
    }));

    return NextResponse.json({
      success: true,
      data: eventsResponse,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
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

    // Check if user has permission to create events
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { role: true },
    });

    if (!user || !["ADMIN", "FACILITATOR"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      eventType,
      eventDate,
      endDate,
      location,
      isVirtual,
      virtualLink,
      maxAttendees,
      isFeatured,
      tags,
      imageUrl,
    } = body;

    if (!title || !description || !eventDate) {
      return NextResponse.json(
        { error: "Title, description, and event date are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventType: eventType || "WORKSHOP",
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        isVirtual: isVirtual || false,
        virtualLink,
        maxAttendees: maxAttendees || null,
        isFeatured: isFeatured || false,
        tags: tags || [],
        imageUrl,
        createdById: payload.sub as string,
        isPublished: false, // Events need to be published manually
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


