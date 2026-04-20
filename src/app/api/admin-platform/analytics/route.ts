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

    // Get user counts by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const byRole: Record<string, number> = {};
    usersByRole.forEach(row => {
      byRole[row.role] = row._count;
    });

    // Get user counts by status
    const byStatus: Record<string, number> = {
      active: 0,
      inactive: 0,
      suspended: 0,
    };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    byStatus.active = await prisma.user.count({
      where: { lastActive: { gte: thirtyDaysAgo } },
    });

    byStatus.inactive = await prisma.user.count({
      where: {
        lastActive: { lt: thirtyDaysAgo },
        status: { not: 'suspended' },
      },
    });

    byStatus.suspended = await prisma.user.count({
      where: { status: 'suspended' },
    });

    // Get top schools
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const topSchools = await Promise.all(
      schools.map(async school => ({
        name: school.name,
        userCount: school._count.users,
        activeCount: await prisma.user.count({
          where: {
            schoolId: school.id,
            lastActive: { gte: thirtyDaysAgo },
          },
        }),
      }))
    );

    // Get monthly activity (last 12 months)
    const monthlyActivity: Array<{ month: string; users: number; discussions: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      });

      const discussions = await prisma.discussion.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      });

      monthlyActivity.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        users: newUsers,
        discussions,
      });
    }

    return NextResponse.json({
      byRole,
      byStatus,
      topSchools,
      monthlyActivity,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
