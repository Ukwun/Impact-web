import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

/**
 * GET /api/payments/receipts/admin
 * Returns all payment receipts for admin/owner
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { course: true, user: true },
    });
    return NextResponse.json({ success: true, receipts: payments });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
