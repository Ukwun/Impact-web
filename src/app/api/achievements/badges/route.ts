/**
 * BADGE API ROUTES
 * File: src/app/api/achievements/badges/route.ts
 * 
 * Handles:
 * GET  - Fetch user badges
 * POST - Award badge to user
 */

import { NextRequest, NextResponse } from 'next/server';
import BadgeService, { BADGE_DEFINITIONS } from '@/services/badgeService';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/achievements/badges
 * Fetch all badges for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch all badges for user
    const badges = await BadgeService.getUserBadges(payload.sub);

    // Fetch available badges for comparison
    const allBadges = Object.values(BADGE_DEFINITIONS || {});

    return NextResponse.json(
      {
        success: true,
        data: {
          earned: badges,
          available: allBadges,
          totalPoints: badges.reduce((sum: number, b: any) => sum + (b.points || 0), 0),
          totalBadges: badges.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/achievements/badges
 * Award badge to user (admin/system use)
 * 
 * Body: { badgeId: string, userId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { badgeId, userId } = body;

    // Can only award to self unless admin
    const targetUserId = userId || payload.sub;
    if (targetUserId !== payload.sub && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate badge exists
    const badgeExists = Object.keys(BADGE_DEFINITIONS || {}).includes(badgeId);
    if (!badgeExists) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Award badge
    const awarded = await BadgeService.awardBadge(targetUserId, badgeId);

    if (!awarded) {
      return NextResponse.json(
        { error: 'Badge already awarded or eligibility check failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Badge awarded successfully',
        badgeId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error awarding badge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
