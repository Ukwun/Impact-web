import { NextRequest, NextResponse } from "next/server";
import { getUserEventRegistrations, getEvent } from "@/lib/firestore-utils";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/events/my-registrations
 * Fetch current user's event registrations from Firestore
 * Authenticated users only
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = payload.sub as string;

    // Fetch user's registrations from Firestore
    const registrations = await getUserEventRegistrations(userId);

    // Enrich with event details
    const enrichedRegistrations = await Promise.all(
      registrations.map(async (reg: any) => {
        const event = await getEvent(reg.eventId);
        return {
          id: reg.id,
          eventId: reg.eventId,
          userId: reg.userId,
          registeredAt: reg.registeredAt,
          status: reg.status || "REGISTERED",
          event: event ? {
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
            registeredCount: event.registeredCount || 0,
          } : null,
        };
      })
    );

    // Filter out any null events and sort by eventDate descending
    const filteredRegistrations = enrichedRegistrations
      .filter((reg) => reg.event !== null)
      .sort((a, b) => {
        const dateA = a.event?.eventDate ? new Date(a.event.eventDate).getTime() : 0;
        const dateB = b.event?.eventDate ? new Date(b.event.eventDate).getTime() : 0;
        return dateB - dateA;
      });

    return NextResponse.json({
      success: true,
      data: filteredRegistrations,
    });
  } catch (error) {
    console.error("❌ Error fetching user registrations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
