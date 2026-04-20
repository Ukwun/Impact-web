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

    // Get user's circle memberships
    const userCircles = await prisma.userCircle.findMany({
      where: { userId },
      include: {
        circle: true,
      },
    });

    // Get circle IDs for the user
    const circleIds = userCircles.map(uc => uc.circleId);

    // Calculate metrics
    const joinedCirclesCount = circleIds.length;

    const discussions = await prisma.discussion.findMany({
      where: { circleId: { in: circleIds } },
      include: {
        _count: {
          select: { discussionLikes: true, discussionReplies: true },
        },
      },
    });

    const userContributions = discussions.filter(d => d.authorId === userId).length;
    const totalDiscussions = discussions.length;

    const userMessages = await prisma.circleMessage.count({
      where: { senderId: userId },
    });

    // Get recent activity
    const recentDiscussion = discussions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return NextResponse.json({
      joinedCircles: joinedCirclesCount,
      activeDiscussions: totalDiscussions,
      myContributions: userContributions,
      messagesCount: userMessages,
      recentActivity: recentDiscussion
        ? new Date(recentDiscussion.createdAt).toLocaleDateString()
        : 'No activity yet',
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
