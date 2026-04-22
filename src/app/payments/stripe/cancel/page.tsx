'use client';

import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function StripeCancelPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-dark-800 rounded-lg p-8 text-center">
        <XCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 mb-8">
          Your payment process was cancelled. No payment was charged to your account.
        </p>

        <div className="space-y-3">
          <Link
            href="/payments"
            className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>

        {paymentId && (
          <p className="text-xs text-gray-600 mt-6 break-words">
            Payment ID: {paymentId}
          </p>
        )}
      </div>
    </div>
  );
}
