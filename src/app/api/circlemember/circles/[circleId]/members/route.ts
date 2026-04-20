import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { circleId: string } }
) {
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

    const circleId = params.circleId;

    // Verify circle exists
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
    });

    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found' },
        { status: 404 }
      );
    }

    // Get circle members with their contribution stats
    const members = await prisma.userCircle.findMany({
      where: { circleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get contribution stats for each member
    const memberIds = members.map(m => m.user.id);
    const discussions = await prisma.discussion.findMany({
      where: { circleId },
      include: {
        _count: {
          select: { discussionReplies: true },
        },
      },
    });

    const formattedMembers = members.map(uc => {
      const memberDiscussions = discussions.filter(d => d.authorId === uc.user.id);
      const totalReplies = memberDiscussions.reduce(
        (sum, d) => sum + d._count.discussionReplies,
        0
      );

      return {
        id: uc.user.id,
        name: uc.user.name,
        title: 'Circle Member',
        expertise: ['Community', 'Collaboration', 'Networking'],
        contributions: memberDiscussions.length,
        discussions: memberDiscussions.length,
        joinedDate: uc.joinedAt.toISOString(),
        bio: `Active member of ${circle.name}. Passionate about ${circle.category}.`,
      };
    });

    // Sort by activity
    formattedMembers.sort(
      (a, b) => (b.contributions + b.discussions) - (a.contributions + a.discussions)
    );

    return NextResponse.json(formattedMembers.slice(0, 50));
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
