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

    if (!payload || payload.role !== 'CIRCLE_MEMBER') {
      return NextResponse.json(
        { error: 'Forbidden: Invalid role' },
        { status: 403 }
      );
    }

    const userId = payload.userId;

    // Get all circles with member counts and recent activity
    const circles = await prisma.circle.findMany({
      include: {
        _count: {
          select: { members: true, discussions: true },
        },
        discussions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Get user's joined circles
    const userCircles = await prisma.userCircle.findMany({
      where: { userId },
      select: { circleId: true },
    });

    const joinedCircleIds = new Set(userCircles.map(uc => uc.circleId));

    // Format response
    const formattedCircles = circles.map(circle => ({
      id: circle.id,
      name: circle.name,
      description: circle.description,
      category: circle.category,
      focusAreas: circle.focusAreas || [],
      memberCount: circle._count.members,
      joined: joinedCircleIds.has(circle.id),
      recentActivity: circle.discussions[0]
        ? new Date(circle.discussions[0].createdAt).toLocaleDateString()
        : 'No activity',
    }));

    return NextResponse.json(formattedCircles);
  } catch (error) {
    console.error('Get circles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
