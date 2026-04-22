'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your payment...');

  const sessionId = searchParams.get('sessionId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    // Verify payment with backend
    const verifyPayment = async () => {
      try {
        if (!paymentId) {
          setStatus('error');
          setMessage('Payment ID not found');
          return;
        }

        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/payments/${paymentId}/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.data.status === 'COMPLETED') {
          setStatus('success');
          setMessage('Payment completed successfully! You are now enrolled.');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage('Unable to verify payment. Please contact support.');
      }
    };

    verifyPayment();
  }, [paymentId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        {status === 'loading' && (
          <div className="bg-dark-800 rounded-lg p-8 text-center">
            <Loader className="w-16 h-16 mx-auto mb-4 text-primary-500 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">Processing Payment</h1>
            <p className="text-gray-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-dark-800 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">Redirecting to dashboard...</p>
            <Link
              href="/dashboard"
              className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-dark-800 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Issue</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Return to Dashboard
              </Link>
              <Link
                href="/payments"
                className="block w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Try Another Payment Method
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
