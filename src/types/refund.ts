export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
export type RefundReason = 'CHANGED_MIND' | 'DEFECTIVE' | 'NOT_AS_DESCRIBED' | 'DUPLICATE' | 'OTHER';

export interface RefundRequest {
  id: string;
  transactionId: string;
  userId: string;
  courseId?: string;
  amount: number;
  currency: string;
  reason: RefundReason;
  description: string;
  status: RefundStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  completedAt?: Date;
  rejectionReason?: string;
  metadata?: {
    originalPaymentMethod?: string;
    refundAmount?: number;
    processingFee?: number;
    [key: string]: any;
  };
}

export interface RefundStats {
  totalRequests: number;
  totalAmount: number;
  avgProcessingTime: number; // in hours
  approvalRate: number; // percentage
  byStatus: {
    [key in RefundStatus]: number;
  };
}

export interface RefundFilters {
  status?: RefundStatus;
  reason?: RefundReason;
  dateRange?: { start: Date; end: Date };
  minAmount?: number;
  maxAmount?: number;
}

export function createRefundRequest(
  transactionId: string,
  userId: string,
  amount: number,
  currency: string,
  reason: RefundReason,
  description: string,
  courseId?: string
): Omit<RefundRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  return {
    transactionId,
    userId,
    courseId,
    amount,
    currency,
    reason,
    description,
    status: 'PENDING',
    metadata: {},
  };
}

export const REFUND_REASONS: { value: RefundReason; label: string; description: string }[] = [
  {
    value: 'CHANGED_MIND',
    label: 'Changed Mind',
    description: 'I changed my mind about this purchase',
  },
  {
    value: 'DEFECTIVE',
    label: 'Defective/Technical Issues',
    description: 'The course has technical problems or quality issues',
  },
  {
    value: 'NOT_AS_DESCRIBED',
    label: 'Not As Described',
    description: 'The course content does not match the description',
  },
  {
    value: 'DUPLICATE',
    label: 'Duplicate Purchase',
    description: 'I accidentally purchased this twice',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other reason (please specify below)',
  },
];

export const REFUND_STATUS_COLORS: { [key in RefundStatus]: string } = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  FAILED: 'bg-red-500/10 text-red-300 border-red-500/20',
};
