'use client';

/**
 * Integrated Orders & Refunds Page
 * Shows user's purchase history and allows refund requests
 */

import { useState, useEffect } from 'react';
import { ShoppingBag, AlertCircle, CheckCircle, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';
import { getUserOrders, getRefundableOrders } from '@/lib/orderManager';
import { getRefunds, createRefund } from '@/lib/refundManager';
import type { Order } from '@/types/orders';
import type { RefundRequest } from '@/types/refund';

export default function OrdersAndRefundsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addNotification } = useNotifications();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showRefundForm, setShowRefundForm] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('CHANGED_MIND');
  const [refundDescription, setRefundDescription] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [userOrders, userRefunds] = await Promise.all([
          getUserOrders(user.uid),
          getRefunds(user.uid),
        ]);
        setOrders(userOrders);
        setRefunds(userRefunds);
      } catch (err) {
        console.error('Failed to load orders:', err);
        addNotification(
          createNotification('Failed to Load Orders', 'Please try again later', 'error', {
            priority: 'high',
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, mounted, addNotification]);

  if (!mounted) return null;

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleRefundRequest = async (orderId: string) => {
    if (!refundDescription.trim()) {
      addNotification(
        createNotification(
          'Description Required',
          'Please provide details about your refund request',
          'error',
          { priority: 'high' }
        )
      );
      return;
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      await createRefund({
        transactionId: order.id,
        userId: user.uid,
        courseId: '', // From order item
        amount: order.total,
        currency: 'USD',
        reason: refundReason as any,
        description: refundDescription,
        status: 'PENDING',
      });

      addNotification(
        createNotification(
          'Refund Requested',
          'Your request has been submitted. An admin will review it shortly.',
          'success',
          { priority: 'medium', duration: 5000 }
        )
      );

      setShowRefundForm(null);
      setRefundDescription('');
      setRefundReason('CHANGED_MIND');

      // Reload refunds
      const updated = await getRefunds(user.uid);
      setRefunds(updated);
    } catch (err) {
      addNotification(
        createNotification('Request Failed', 'Could not submit refund request', 'error', {
          priority: 'high',
        })
      );
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const activeRefunds = refunds.filter((r) => r.status === 'PENDING' || r.status === 'APPROVED');

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-dark-800 to-dark-900 border-b border-dark-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Orders & Refunds
          </h1>
          <p className="text-gray-400 mt-2">Manage your purchases and refund requests</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Active Refunds Section */}
        {activeRefunds.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-500" />
              Active Refund Requests ({activeRefunds.length})
            </h2>

            <div className="space-y-3">
              {activeRefunds.map((refund) => (
                <div key={refund.id} className="bg-dark-800 rounded-lg border border-dark-700 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Refund Request for ${refund.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">{refund.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Request ID: {refund.id} · {refund.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        refund.status === 'APPROVED'
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {refund.status === 'APPROVED' ? '✓ Approved' : '⏳ Pending Review'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Section */}
        <h2 className="text-xl font-semibold text-white mb-4">Order History</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-dark-800 rounded-lg border border-dashed border-dark-600 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = selectedOrder === order.id;
              const refundExists = refunds.some((r) => r.transactionId === order.id);
              const canRequestRefund =
                order.status === 'completed' &&
                !refundExists &&
                new Date().getTime() - new Date(order.completedAt || 0).getTime() <
                  30 * 24 * 60 * 60 * 1000;

              return (
                <div
                  key={order.id}
                  className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden"
                >
                  {/* Summary */}
                  <button
                    onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark-700 transition"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(order.status)}
                      <div className="text-left">
                        <p className="font-medium text-white">
                          Order {order.id.substring(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-400">
                          {order.items.map((item) => item.itemName).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.orderedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-white text-lg">${order.total.toFixed(2)}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 ml-4 transition ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Details */}
                  {isExpanded && (
                    <div className="border-t border-dark-700 px-6 py-4 bg-dark-900/50">
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">Items</h4>
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-400">{item.itemName}</span>
                              <span className="text-white">${item.totalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="border-t border-dark-700 pt-3 space-y-2">
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Tax (10%)</span>
                            <span>${order.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold text-white border-t border-dark-700 pt-2">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Refund Actions */}
                        {canRequestRefund && (
                          <>
                            {showRefundForm === order.id ? (
                              <div className="border-t border-dark-700 pt-4 mt-4">
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">
                                  Request Refund
                                </h4>

                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">
                                      Reason
                                    </label>
                                    <select
                                      value={refundReason}
                                      onChange={(e) => setRefundReason(e.target.value)}
                                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
                                    >
                                      <option value="CHANGED_MIND">Changed my mind</option>
                                      <option value="DEFECTIVE">Content issue</option>
                                      <option value="NOT_AS_DESCRIBED">Not as described</option>
                                      <option value="DUPLICATE">Duplicate charge</option>
                                      <option value="OTHER">Other</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">
                                      Details
                                    </label>
                                    <textarea
                                      value={refundDescription}
                                      onChange={(e) => setRefundDescription(e.target.value)}
                                      placeholder="Please tell us why you want a refund..."
                                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleRefundRequest(order.id)}
                                      className="flex-1 px-3 py-2 bg-primary-500 text-white rounded font-medium text-sm hover:bg-primary-600 transition"
                                    >
                                      Submit Request
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowRefundForm(null);
                                        setRefundDescription('');
                                      }}
                                      className="flex-1 px-3 py-2 bg-dark-700 text-white rounded font-medium text-sm hover:bg-dark-600 transition"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowRefundForm(order.id)}
                                className="w-full mt-3 px-4 py-2 bg-dark-700 text-primary-400 rounded font-medium text-sm hover:bg-dark-600 transition border border-dark-600"
                              >
                                Request Refund
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
