'use client';

import { useState } from 'react';
import { Badge, Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import { useRefunds } from '@/hooks/useRefund';
import { RefundStatus, REFUND_STATUS_COLORS } from '@/types/refund';

export function RefundHistory({ userId }: { userId: string }) {
  const [selectedStatus, setSelectedStatus] = useState<RefundStatus | undefined>();
  const [page, setPage] = useState(1);
  const { refunds, total, pages, isLoading, error } = useRefunds(selectedStatus, page, 5);

  const getStatusIcon = (status: RefundStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <AlertCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            setSelectedStatus(undefined);
            setPage(1);
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            !selectedStatus
              ? 'bg-primary-500 text-white'
              : 'bg-dark-600 text-gray-400 hover:text-gray-300'
          }`}
        >
          All
        </button>
        {(['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'] as RefundStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setPage(1);
            }}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              selectedStatus === status
                ? 'bg-primary-500 text-white'
                : 'bg-dark-600 text-gray-400 hover:text-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Refund List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading refund history...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">Error: {error}</div>
        ) : refunds.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No refund requests found</div>
        ) : (
          refunds.map((refund) => (
            <div
              key={refund.id}
              className={`p-4 rounded-lg border ${REFUND_STATUS_COLORS[refund.status]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getStatusIcon(refund.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">
                        Refund Request - {refund.transactionId}
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-current/20 rounded">
                        {refund.status}
                      </span>
                    </div>
                    <p className="text-sm text-current/80 mb-2">
                      {refund.reason.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-current/60">{refund.description}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-lg text-white">
                    {refund.amount.toFixed(2)} {refund.currency}
                  </p>
                  <p className="text-xs text-current/60">
                    {formatDate(refund.createdAt)}
                  </p>
                </div>
              </div>

              {refund.rejectionReason && (
                <div className="mt-3 p-2 bg-current/10 rounded text-xs">
                  <p className="font-medium">Rejection Reason:</p>
                  <p>{refund.rejectionReason}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-dark-600">
          <p className="text-sm text-gray-400">
            Page {page} of {pages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-dark-600 text-white rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-3 py-1 bg-dark-600 text-white rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
