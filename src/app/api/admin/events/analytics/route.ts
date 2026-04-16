import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/events/analytics
 * Get event analytics and metrics
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const payload = verifyToken(token || '');

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.sub as string;
    const timeRange = request.nextUrl.searchParams.get('timeRange') || 'month';

    // Calculate date range
    let startDate = new Date();
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Fetch user's events
    const events = await prisma.event.findMany({
      where: {
        createdById: userId,
        createdAt: { gte: startDate },
      },
      include: {
        registrations: {
          select: {
            id: true,
            userId: true,
            status: true,
            registeredAt: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    // Calculate total metrics
    const totalEvents = events.length;
    const totalRegistrations = events.reduce(
      (sum, event) => sum + event.registrations.length,
      0
    );

    // Calculate attendance rate (assuming registration status indicates attendance)
    const attendedCount = events.reduce(
      (sum, event) =>
        sum +
        event.registrations.filter((reg) => reg.status === 'REGISTERED').length,
      0
    );
    const attendanceRate =
      totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0;

    // Calculate capacity utilization
    let totalCapacity = 0;
    events.forEach((event) => {
      if (event.capacity) {
        totalCapacity += event.capacity;
      }
    });
    const averageCapacityUtilization =
      totalCapacity > 0
        ? Math.round((totalRegistrations / totalCapacity) * 100)
        : 0;

    // Events by type
    const eventsByType = Object.entries(
      events.reduce(
        (acc, event) => {
          const type = event.eventType || 'OTHER';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    ).map(([type, count]) => ({ type, count }));

    // Registrations trend (by date)
    const registrationsByDate: Record<string, number> = {};
    events.forEach((event) => {
      event.registrations.forEach((reg) => {
        const date = new Date(reg.registeredAt).toISOString().split('T')[0];
        registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
      });
    });

    const registrationsTrend = Object.entries(registrationsByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, registrations]) => ({
        date,
        registrations,
      }));

    // Top events by registrations
    const topEvents = events
      .map((event) => ({
        id: event.id,
        title: event.title,
        registrations: event.registrations.length,
        capacity: event.capacity || 0,
      }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 5);

    // Registration status breakdown
    const registrationStatus = Object.entries(
      events.reduce(
        (acc, event) => {
          event.registrations.forEach((reg) => {
            const status = reg.status || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>
      )
    ).map(([status, count]) => ({ status, count }));

    return NextResponse.json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        attendanceRate,
        averageCapacityUtilization,
        eventsByType,
        registrationsTrend: registrationsTrend.length > 0 ? registrationsTrend : [],
        topEvents,
        registrationStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
