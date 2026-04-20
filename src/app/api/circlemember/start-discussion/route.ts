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
    const { circleId, title, content, tags } = await request.json();

    if (!circleId || !title || !content) {
      return NextResponse.json(
        { error: 'circleId, title, and content are required' },
        { status: 400 }
      );
    }

    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 5 and 200 characters' },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

    // Verify circle exists and user is a member
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
    });

    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found' },
        { status: 404 }
      );
    }

    const membership = await prisma.userCircle.findUnique({
      where: {
        userId_circleId: { userId, circleId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this circle to post' },
        { status: 403 }
      );
    }

    // Create discussion
    const discussion = await prisma.discussion.create({
      data: {
        circleId,
        authorId: userId,
        title,
        content,
        tags: tags || [],
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      id: discussion.id,
      circleId: discussion.circleId,
      title: discussion.title,
      content: discussion.content,
      tags: discussion.tags,
      createdAt: discussion.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Post discussion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
