'use client';

import { useState } from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';
import { useRefundMutations } from '@/hooks/useRefund';
import { REFUND_REASONS, RefundReason } from '@/types/refund';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  courseId?: string;
  userId: string;
  amount: number;
  currency: string;
}

export function RefundRequestModal({
  isOpen,
  onClose,
  transactionId,
  courseId,
  userId,
  amount,
  currency,
}: RefundRequestModalProps) {
  const { addNotification } = useNotifications();
  const { createRefundRequest, isLoading, error } = useRefundMutations();

  const [selectedReason, setSelectedReason] = useState<RefundReason>('CHANGED_MIND');
  const [description, setDescription] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!agreedToTerms) {
      setSubmitError('You must agree to the refund policy');
      return;
    }

    if (description.trim().length < 10) {
      setSubmitError('Please provide a detailed reason (at least 10 characters)');
      return;
    }

    try {
      await createRefundRequest({
        transactionId,
        userId,
        courseId,
        amount,
        currency,
        reason: selectedReason,
        description,
        status: 'PENDING',
      });

      addNotification(
        createNotification(
          'Refund Request Submitted',
          'Your refund request has been submitted. We will review it within 24-48 hours.',
          'success',
          { priority: 'medium', duration: 5000 }
        )
      );

      onClose();
      setDescription('');
      setSelectedReason('CHANGED_MIND');
      setAgreedToTerms(false);
    } catch (err) {
      setSubmitError(error || 'Failed to submit refund request');
      addNotification(
        createNotification('Submission Failed', error || 'Please try again later', 'error', {
          priority: 'high',
        })
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 transform">
        <div className="mx-4 rounded-lg bg-dark-800 border border-dark-600 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-dark-600 bg-dark-800 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Request Refund</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Amount Info */}
            <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
              <p className="text-sm text-gray-400">Refund Amount</p>
              <p className="text-2xl font-bold text-white mt-1">
                {amount.toFixed(2)} {currency}
              </p>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Reason for Refund *
              </label>
              <div className="space-y-2">
                {REFUND_REASONS.map((reason) => (
                  <label key={reason.value} className="flex items-start gap-3 p-3 rounded-lg border border-dark-600 hover:border-primary-500/50 cursor-pointer transition">
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value as RefundReason)}
                      className="mt-1 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{reason.label}</p>
                      <p className="text-xs text-gray-400">{reason.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Details *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide a detailed explanation for your refund request (minimum 10 characters)"
                maxLength={500}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            {/* Error Messages */}
            {submitError && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{submitError}</p>
              </div>
            )}

            {/* Terms Agreement */}
            <label className="flex items-start gap-3 p-4 rounded-lg border border-dark-600 hover:border-primary-500/30 cursor-pointer transition">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4"
              />
              <div className="text-xs text-gray-400">
                <p>
                  I understand that refunds are processed within 24-48 hours to the original payment method. I agree to the refund policy and understand that once a refund is completed, course access will be revoked.
                </p>
              </div>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-dark-600">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-dark-600 text-white rounded-lg font-medium hover:bg-dark-500 transition disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms || description.length < 10}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
