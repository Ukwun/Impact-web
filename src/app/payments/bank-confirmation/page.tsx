"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BankConfirmationContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-800 border border-yellow-600/30 rounded-lg p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Payment Processing
          </h1>
          <p className="text-gray-400 text-center mb-8">
            We've received your transfer request
          </p>

          {/* Status Information */}
          <div className="bg-dark-900 rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-400">Payment ID</span>
                <span className="text-white font-mono text-sm">{paymentId}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-400">Status</span>
                <span className="inline-flex items-center gap-2 text-yellow-400">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  Pending Confirmation
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Next Step</span>
                <span className="text-white">Account Verification</span>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              What happens next?
            </h2>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-semibold text-white">
                  1
                </span>
                <span>
                  We verify the bank transfer has been received on our account
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-semibold text-white">
                  2
                </span>
                <span>
                  Once confirmed, you'll receive an email notification and SMS
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-semibold text-white">
                  3
                </span>
                <span>Your course enrollment will be activated immediately</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-semibold text-white">
                  4
                </span>
                <span>You'll have full access to all course materials</span>
              </li>
            </ol>
          </div>

          {/* Timeline */}
          <div className="bg-dark-900 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
              Expected Timeline
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <span className="font-semibold text-white">Same day:</span> If
                transferred before 2 PM WAT
              </p>
              <p>
                <span className="font-semibold text-white">Next business day:</span>{" "}
                If transferred after 2 PM WAT or on weekends
              </p>
            </div>
          </div>

          {/* Support */}
          <div className="bg-primary-600/10 border border-primary-600/30 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Need Assistance?</h3>
            <p className="text-gray-300 mb-4 text-sm">
              If your payment hasn't been confirmed within 24 hours, please
              contact our support team:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                <a
                  href="mailto:support@impactedu.ng"
                  className="text-primary-400 hover:text-primary-300"
                >
                  support@impactedu.ng
                </a>
              </p>
              <p>
                <span className="font-semibold text-white">Phone:</span>{" "}
                <a
                  href="tel:+2347012345678"
                  className="text-primary-400 hover:text-primary-300"
                >
                  +234 701 234 5678
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
            >
              Continue to Dashboard
            </Link>
            <Link
              href="/dashboard/courses"
              className="flex-1 bg-dark-900 border border-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-dark-800 transition-colors text-center"
            >
              Browse Courses
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}

export default function BankConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <BankConfirmationContent />
    </Suspense>
  );
}
