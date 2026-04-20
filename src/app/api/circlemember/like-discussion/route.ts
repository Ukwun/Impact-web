import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
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
    const { discussionId } = await request.json();

    if (!discussionId) {
      return NextResponse.json(
        { error: 'discussionId is required' },
        { status: 400 }
      );
    }

    // Verify discussion exists
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.discussionLike.findUnique({
      where: {
        userId_discussionId: { userId, discussionId },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.discussionLike.delete({
        where: {
          userId_discussionId: { userId, discussionId },
        },
      });

      return NextResponse.json({
        id: discussionId,
        liked: false,
      });
    } else {
      // Like
      const like = await prisma.discussionLike.create({
        data: {
          userId,
          discussionId,
        },
      });

      return NextResponse.json({
        id: discussionId,
        liked: true,
      });
    }
  } catch (error) {
    console.error('Like discussion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
