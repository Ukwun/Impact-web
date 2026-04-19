'use client';

import { useState, useEffect } from 'react';
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useRefunds, useRefundStats, useRefundMutations } from '@/hooks/useRefund';
import { useNotifications } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';
import { RefundStatus, REFUND_STATUS_COLORS } from '@/types/refund';

export default function AdminRefundsPage() {
  const [selectedStatus, setSelectedStatus] = useState<RefundStatus | undefined>('PENDING');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);

  const { refunds, total, pages, isLoading: isLoadingRefunds } = useRefunds(
    selectedStatus,
    page,
    10
  );
  const { stats, isLoading: isLoadingStats } = useRefundStats();
  const { approveRefundRequest, rejectRefundRequest, completeRefundRequest, isLoading } =
    useRefundMutations();
  const { addNotification } = useNotifications();

  const handleApprove = async (refundId: string) => {
    try {
      await approveRefundRequest(refundId, 'admin@example.com');
      addNotification(
        createNotification(
          'Refund Approved',
          'The refund request has been approved and is being processed.',
          'success',
          { priority: 'medium', duration: 4000 }
        )
      );
    } catch (error) {
      addNotification(
        createNotification('Approval Failed', 'Could not approve refund request', 'error', {
          priority: 'high',
        })
      );
    }
  };

  const handleReject = async (refundId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await rejectRefundRequest(refundId, rejectionReason);
      setShowRejectionForm(null);
      setRejectionReason('');
      addNotification(
        createNotification(
          'Refund Rejected',
          'The refund request has been rejected.',
          'info',
          { priority: 'medium', duration: 4000 }
        )
      );
    } catch (error) {
      addNotification(
        createNotification('Rejection Failed', 'Could not reject refund request', 'error', {
          priority: 'high',
        })
      );
    }
  };

  const handleComplete = async (refundId: string) => {
    try {
      await completeRefundRequest(refundId);
      addNotification(
        createNotification(
          'Refund Completed',
          'The refund has been processed and funds returned to customer.',
          'success',
          { priority: 'medium', duration: 4000 }
        )
      );
    } catch (error) {
      addNotification(
        createNotification('Completion Failed', 'Could not mark refund as completed', 'error', {
          priority: 'high',
        })
      );
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  return (
    <div className="min-h-screen bg-dark-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Refund Management</h1>
          <p className="text-gray-400">Review and process customer refund requests</p>
        </div>

        {/* Statistics */}
        {!isLoadingStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-white">{stats.totalRequests}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-300 mb-1">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.byStatus.PENDING}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300 mb-1">Approved</p>
              <p className="text-2xl font-bold text-white">{stats.byStatus.APPROVED}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-300 mb-1">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.byStatus.COMPLETED}</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-purple-300 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-white">${stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as RefundStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded font-medium transition ${
                selectedStatus === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-600 text-gray-400 hover:bg-dark-500'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Refund Table */}
        <div className="bg-dark-700 rounded-lg border border-dark-600 overflow-hidden">
          {isLoadingRefunds ? (
            <div className="p-8 text-center text-gray-400">Loading refund requests...</div>
          ) : refunds.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No refund requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-800 border-b border-dark-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                  {refunds.map((refund) => (
                    <tr
                      key={refund.id}
                      className="hover:bg-dark-800 transition"
                      onClick={() => setExpandedId(expandedId === refund.id ? null : refund.id)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {refund.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {formatCurrency(refund.amount, refund.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {refund.reason.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            REFUND_STATUS_COLORS[refund.status]
                          }`}
                        >
                          {refund.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {refund.status === 'PENDING' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(refund.id);
                                }}
                                disabled={isLoading}
                                className="text-green-400 hover:text-green-300 disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowRejectionForm(refund.id);
                                }}
                                disabled={isLoading}
                                className="text-red-400 hover:text-red-300 disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {refund.status === 'APPROVED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComplete(refund.id);
                              }}
                              disabled={isLoading}
                              className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                              title="Mark Complete"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="border-t border-dark-600 px-6 py-4 flex items-center justify-between bg-dark-800">
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

        {/* Rejection Form Modal */}
        {showRejectionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectionForm(null)} />
            <div className="relative bg-dark-800 border border-dark-600 rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-bold text-white mb-4">Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why you're rejecting this refund request..."
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none mb-4"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectionForm(null)}
                  className="flex-1 px-4 py-2 bg-dark-600 text-white rounded font-medium hover:bg-dark-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectionForm)}
                  disabled={isLoading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
