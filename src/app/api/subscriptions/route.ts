import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionStatus } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/subscriptions
 * Returns available subscription plans and user's current subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const rawToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const tokenPayload = rawToken ? verifyToken(rawToken) : null;
    if (!tokenPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = tokenPayload.sub;

    // Get all subscription plans
    const plans = await prisma.subscriptionPlan.findMany({
      select: {
        id: true,
        tierType: true,
        name: true,
        monthlyPrice: true,
        features: true,
        maxUsers: true,
        canAccessAnalytics: true,
        canManageFacilitators: true,
        canIntegrateSIS: true,
      },
      orderBy: { monthlyPrice: 'asc' }
    });

    // Get user's active subscriptions
    const userSubscriptions = await prisma.subscription.findMany({
      where: {
        subscriberId: userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE] }
      },
      include: {
        plan: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        availablePlans: plans,
        currentSubscriptions: userSubscriptions,
        canSubscribe: userSubscriptions.length === 0 || userSubscriptions.some(s => !s.schoolName),
      }
    });
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription for user/school
 */
export async function POST(request: NextRequest) {
  try {
    const rawToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const tokenPayload = rawToken ? verifyToken(rawToken) : null;
    if (!tokenPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = tokenPayload.sub;
    const { planId, schoolName, schoolAdminIds = [] } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { success: false, error: 'Plan ID required' },
        { status: 400 }
      );
    }

    // Verify plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        subscriberId: userId,
        planId,
        status: SubscriptionStatus.ACTIVE,
        schoolName: schoolName || null,
        schoolAdminIds: schoolAdminIds,
        activeUsers: 1,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        startDate: new Date(),
      },
      include: { plan: true }
    });

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Subscription created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
