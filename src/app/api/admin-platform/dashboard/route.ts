import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Invalid role' },
        { status: 403 }
      );
    }

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get active users (logged in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.user.count({
      where: {
        lastActive: { gte: thirtyDaysAgo },
      },
    });

    // Get user growth
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: { gte: thisMonthStart },
      },
    });

    // Get schools count
    const totalSchools = await prisma.school.count();

    // Get circles count
    const totalCircles = await prisma.circle.count();

    // Get discussions count
    const totalDiscussions = await prisma.discussion.count();

    // Get platform uptime (simulated - in real app would track actual uptime)
    const platformUptime = 99.85;
    const averageResponseTime = 145; // ms

    return NextResponse.json({
      totalUsers,
      activeUsers,
      userGrowth: Math.round((newUsersThisMonth / Math.max(totalUsers / 12, 1)) * 100),
      totalSchools,
      totalCircles,
      totalDiscussions,
      platformUptime,
      averageResponseTime,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
