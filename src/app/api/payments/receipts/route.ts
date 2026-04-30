import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

/**
 * GET /api/payments/receipts
 * Returns all payment receipts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.user.id;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { course: true },
    });
    return NextResponse.json({ success: true, receipts: payments });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
