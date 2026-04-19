'use server';

import { RefundRequest, RefundStatus, RefundStats } from '@/types/refund';
import {
  notifyRefundRequested,
  notifyRefundApproved,
  notifyRefundRejected,
} from '@/lib/adminNotifications';
import { getOrderById } from '@/lib/orderManager';

// Mock data for refund requests
const MOCK_REFUNDS: RefundRequest[] = [
  {
    id: 'refund-1',
    transactionId: 'txn-001',
    userId: 'user-1',
    courseId: 'course-1',
    amount: 99.99,
    currency: 'USD',
    reason: 'CHANGED_MIND',
    description: 'I realized this course is not for me',
    status: 'PENDING',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
    metadata: {
      originalPaymentMethod: 'credit_card',
    },
  },
  {
    id: 'refund-2',
    transactionId: 'txn-002',
    userId: 'user-2',
    courseId: 'course-2',
    amount: 149.99,
    currency: 'USD',
    reason: 'DEFECTIVE',
    description: 'Course videos are not playing properly',
    status: 'APPROVED',
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-09'),
    approvedAt: new Date('2024-12-09'),
    approvedBy: 'admin@example.com',
    metadata: {
      originalPaymentMethod: 'credit_card',
      refundAmount: 149.99,
    },
  },
  {
    id: 'refund-3',
    transactionId: 'txn-003',
    userId: 'user-3',
    courseId: 'course-3',
    amount: 79.99,
    currency: 'USD',
    reason: 'DUPLICATE',
    description: 'Appears to have been charged twice',
    status: 'COMPLETED',
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-07'),
    approvedAt: new Date('2024-12-06'),
    approvedBy: 'admin@example.com',
    completedAt: new Date('2024-12-07'),
    metadata: {
      originalPaymentMethod: 'credit_card',
      refundAmount: 79.99,
    },
  },
  {
    id: 'refund-4',
    transactionId: 'txn-004',
    userId: 'user-4',
    courseId: 'course-4',
    amount: 199.99,
    currency: 'USD',
    reason: 'NOT_AS_DESCRIBED',
    description: 'Course content does not match advertised curriculum',
    status: 'REJECTED',
    createdAt: new Date('2024-12-03'),
    updatedAt: new Date('2024-12-04'),
    rejectionReason: 'Course content matches description. Request denied.',
    metadata: {
      originalPaymentMethod: 'credit_card',
    },
  },
  {
    id: 'refund-5',
    transactionId: 'txn-005',
    userId: 'user-5',
    courseId: 'course-5',
    amount: 59.99,
    currency: 'USD',
    reason: 'OTHER',
    description: 'Personal financial constraints',
    status: 'PENDING',
    createdAt: new Date('2024-12-12'),
    updatedAt: new Date('2024-12-12'),
    metadata: {
      originalPaymentMethod: 'credit_card',
    },
  },
];

/**
 * GET /api/refunds
 * Get refund requests with filtering and pagination
 */
export async function getRefunds(
  status?: RefundStatus,
  page: number = 1,
  limit: number = 10
): Promise<{
  refunds: RefundRequest[];
  total: number;
  pages: number;
}> {
  try {
    let filtered = [...MOCK_REFUNDS];

    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }

    const total = filtered.length;
    const pages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const refunds = filtered.slice(startIdx, startIdx + limit);

    return { refunds, total, pages };
  } catch (error) {
    console.error('Error fetching refunds:', error);
    throw error;
  }
}

/**
 * GET /api/refunds/:id
 * Get specific refund request
 */
export async function getRefundById(id: string): Promise<RefundRequest | null> {
  try {
    return MOCK_REFUNDS.find((r) => r.id === id) || null;
  } catch (error) {
    console.error('Error fetching refund:', error);
    throw error;
  }
}

/**
 * POST /api/refunds
 * Create new refund request
 */
export async function createRefund(
  refundData: Omit<RefundRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RefundRequest> {
  try {
    const newRefund: RefundRequest = {
      id: `refund-${Date.now()}`,
      ...refundData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    MOCK_REFUNDS.push(newRefund);

    // Trigger admin notification for refund request
    notifyRefundRequested(newRefund.id, newRefund.userId, newRefund.amount, newRefund.reason);

    return newRefund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}

/**
 * PUT /api/refunds/:id/approve
 * Approve a refund request
 */
export async function approveRefund(
  id: string,
  approvedBy: string
): Promise<RefundRequest> {
  try {
    const index = MOCK_REFUNDS.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Refund not found');

    MOCK_REFUNDS[index] = {
      ...MOCK_REFUNDS[index],
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy,
      updatedAt: new Date(),
      metadata: {
        ...MOCK_REFUNDS[index].metadata,
        refundAmount: MOCK_REFUNDS[index].amount,
      },
    };

    // Trigger admin notification
    notifyRefundApproved(id, MOCK_REFUNDS[index].userId, MOCK_REFUNDS[index].amount);

    return MOCK_REFUNDS[index];
  } catch (error) {
    console.error('Error approving refund:', error);
    throw error;
  }
}

/**
 * PUT /api/refunds/:id/reject
 * Reject a refund request
 */
export async function rejectRefund(
  id: string,
  rejectionReason: string
): Promise<RefundRequest> {
  try {
    const index = MOCK_REFUNDS.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Refund not found');

    MOCK_REFUNDS[index] = {
      ...MOCK_REFUNDS[index],
      status: 'REJECTED',
      rejectionReason,
      updatedAt: new Date(),
    };

    // Trigger admin notification
    notifyRefundRejected(id, MOCK_REFUNDS[index].userId, rejectionReason);

    return MOCK_REFUNDS[index];
  } catch (error) {
    console.error('Error rejecting refund:', error);
    throw error;
  }
}

/**
 * PUT /api/refunds/:id/complete
 * Mark refund as completed
 */
export async function completeRefund(id: string): Promise<RefundRequest> {
  try {
    const index = MOCK_REFUNDS.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Refund not found');

    MOCK_REFUNDS[index] = {
      ...MOCK_REFUNDS[index],
      status: 'COMPLETED',
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    return MOCK_REFUNDS[index];
  } catch (error) {
    console.error('Error completing refund:', error);
    throw error;
  }
}

/**
 * GET /api/refunds/stats
 * Get refund statistics
 */
export async function getRefundStats(): Promise<RefundStats> {
  try {
    const completed = MOCK_REFUNDS.filter((r) => r.status === 'COMPLETED').length;
    const approved = MOCK_REFUNDS.filter((r) => r.status === 'APPROVED').length;
    const totalRequests = MOCK_REFUNDS.length;
    const approvalRate = totalRequests > 0 ? ((approved + completed) / totalRequests) * 100 : 0;

    const totalAmount = MOCK_REFUNDS.filter((r) =>
      ['APPROVED', 'COMPLETED'].includes(r.status)
    ).reduce((sum, r) => sum + r.amount, 0);

    const statuses: { [key in RefundStatus]: number } = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      COMPLETED: 0,
      FAILED: 0,
    };

    MOCK_REFUNDS.forEach((r) => {
      statuses[r.status]++;
    });

    return {
      totalRequests,
      totalAmount,
      avgProcessingTime: 24, // hours (mock)
      approvalRate: Math.round(approvalRate * 100) / 100,
      byStatus: statuses,
    };
  } catch (error) {
    console.error('Error fetching refund stats:', error);
    throw error;
  }
}
