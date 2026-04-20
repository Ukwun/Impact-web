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
    const { circleId } = await request.json();

    if (!circleId) {
      return NextResponse.json(
        { error: 'circleId is required' },
        { status: 400 }
      );
    }

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

    // Check if already joined
    const existingMembership = await prisma.userCircle.findUnique({
      where: {
        userId_circleId: { userId, circleId },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Already a member of this circle' },
        { status: 400 }
      );
    }

    // Create membership
    const membership = await prisma.userCircle.create({
      data: {
        userId,
        circleId,
        joinedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: membership.id,
      circleId: membership.circleId,
      joinedAt: membership.joinedAt.toISOString(),
    });
  } catch (error) {
    console.error('Join circle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
