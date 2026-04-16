import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/events/my-registrations
 * Fetch current user's event registrations
 * Authenticated users only
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's registrations with event details
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            eventDate: true,
            startTime: true,
            endTime: true,
            venue: true,
            location: true,
            eventType: true,
            capacity: true,
            _count: {
              select: { registrations: true },
            },
          },
        },
      },
      orderBy: {
        event: {
          eventDate: "desc",
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("❌ Error fetching user registrations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
