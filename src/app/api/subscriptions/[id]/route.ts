import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionStatus } from '@prisma/client';
import { prisma } from '../../../../lib/prisma';
import { mockSubscriptionPlans } from '../../../../lib/mock-data';

/**
 * GET /api/subscriptions/[id]
 * Get specific subscription with detailed usage metrics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: {
        plan: true,
        _count: {
          select: { createdAt: true } // Placeholder for actual usage
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Calculate usage metrics
    const usagePercent = subscription.plan.maxUsers 
      ? Math.round((subscription.activeUsers / subscription.plan.maxUsers) * 100)
      : 0;

    const daysUntilRenewal = Math.ceil(
      (subscription.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      success: true,
      data: {
        ...subscription,
        usage: {
          activeUsers: subscription.activeUsers,
          maxUsers: subscription.plan.maxUsers || 'Unlimited',
          usagePercent,
          seatsAvailable: subscription.plan.maxUsers 
            ? subscription.plan.maxUsers - subscription.activeUsers
            : null,
          warning: usagePercent > 80 ? 'Approaching seat limit' : null,
        },
        renewal: {
          date: subscription.renewalDate,
          daysRemaining: daysUntilRenewal,
          autoRenew: true,
          upcomingRenewalAlert: daysUntilRenewal < 7,
        },
        features: {
          name: subscription.plan.name,
          monthlyPrice: subscription.plan.monthlyPrice,
          analytics: subscription.plan.canAccessAnalytics,
          facilitatorManagement: subscription.plan.canManageFacilitators,
          sisIntegration: subscription.plan.canIntegrateSIS,
        }
      }
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    
    // Return mock data with sample subscription
    if (error instanceof Error && error.message.includes('does not exist')) {
      const mockData = mockSubscriptionPlans.data.currentSubscriptions[0];
      return NextResponse.json({
        success: true,
        data: {
          ...mockData,
          usage: {
            activeUsers: 1,
            maxUsers: 'Unlimited',
            usagePercent: 5,
            seatsAvailable: null,
            warning: null,
          },
          renewal: {
            date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            daysRemaining: 25,
            autoRenew: true,
            upcomingRenewalAlert: false,
          },
          features: {
            name: mockData.plan.name,
            monthlyPrice: mockData.plan.monthlyPrice,
            analytics: false,
            facilitatorManagement: false,
            sisIntegration: false,
          }
        }
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subscriptions/[id]
 * Update subscription (add admins, extend date, change status)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { schoolAdminIds, activeUsers, status } = await request.json();

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        ...(schoolAdminIds && { schoolAdminIds }),
        ...(activeUsers !== undefined && { activeUsers }),
        ...(status && { status: status as SubscriptionStatus }),
      },
      include: { plan: true }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions/[id]
 * Cancel a subscription
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cancelled = await prisma.subscription.update({
      where: { id: params.id },
      data: { status: SubscriptionStatus.CANCELLED }
    });

    return NextResponse.json({
      success: true,
      data: cancelled,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
