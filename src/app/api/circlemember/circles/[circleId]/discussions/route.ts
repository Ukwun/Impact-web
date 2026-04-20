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

    const userId = payload.userId;
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

    // Get discussions in the circle
    const discussions = await prisma.discussion.findMany({
      where: { circleId },
      include: {
        author: {
          select: { name: true },
        },
        _count: {
          select: { discussionLikes: true, discussionReplies: true },
        },
        discussionLikes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response
    const formattedDiscussions = discussions.map(d => ({
      id: d.id,
      author: d.author.name,
      authorRole: 'Member',
      title: d.title,
      content: d.content,
      createdAt: d.createdAt.toISOString(),
      likes: d._count.discussionLikes,
      replies: d._count.discussionReplies,
      isLiked: d.discussionLikes.length > 0,
      tags: d.tags || [],
    }));

    return NextResponse.json(formattedDiscussions);
  } catch (error) {
    console.error('Get discussions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
