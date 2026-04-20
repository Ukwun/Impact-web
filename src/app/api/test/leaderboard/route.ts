import { NextRequest, NextResponse } from 'next/server';
import { emitLeaderboardUpdate, notifyAchievementUnlocked } from '@/lib/socket-events';

/**
 * Test endpoint to demonstrate leaderboard real-time updates
 * POST /api/test/leaderboard
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      newScore,
      activityType,
      achievementData
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Emit leaderboard update
    if (newScore !== undefined) {
      emitLeaderboardUpdate({
        userId,
        newScore: newScore || 100,
        activityType: activityType || 'test_activity',
        timestamp: new Date(),
      });
    }

    // Emit achievement unlock if provided
    if (achievementData) {
      notifyAchievementUnlocked(userId, achievementData);
    }

    return NextResponse.json({
      success: true,
      message: `Leaderboard update emitted for user ${userId}`,
    });
  } catch (error) {
    console.error('Error emitting leaderboard update:', error);
    return NextResponse.json(
      { error: 'Failed to emit leaderboard update' },
      { status: 500 }
    );
  }
}
