import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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
  const body = await request.json();

  try {
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check capacity
    if (event._count.registrations >= event.capacity) {
      return NextResponse.json({ error: "Event is at capacity" }, { status: 400 });
    }

    // Check registration deadline
    if (new Date() > event.registrationDeadline) {
      return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 });
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId,
        eventId,
        registeredAt: new Date(),
        status: "registered"
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          registrationId: registration.id,
          eventId: registration.eventId,
          status: "registered",
          registeredAt: registration.registeredAt.toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
