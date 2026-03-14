"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getBankTransferDetails } from "@/lib/flutterwave-service";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

export default function BankTransferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [amount, setAmount] = useState(5000);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const bankDetails = getBankTransferDetails(amount);

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      // Create payment record
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          amount: amount,
          currency: "NGN",
          purpose: "course_enrollment",
          paymentMethod: "BANK_TRANSFER",
          metadata: {
            reference: bankDetails.reference,
            courseId: searchParams.get("courseId"),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Redirect to confirmation page
        router.push(`/payments/bank-confirmation?paymentId=${data.paymentId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-primary-400 hover:text-primary-300 mb-6 text-sm font-semibold"
        >
          ← Back
        </button>

        {/* Instructions */}
        <div className="bg-dark-800 border border-gray-700 rounded-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Bank Transfer</h1>
          <p className="text-gray-400">
            Follow the steps below to complete your payment
          </p>
        </div>

        {/* Step 1: Amount */}
        <div className="bg-dark-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-semibold">
              1
            </div>
            <h2 className="text-xl font-bold text-white">Enter Amount</h2>
          </div>
          <div className="ml-11">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Pay (NGN)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">₦</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 bg-dark-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Bank Details */}
        <div className="bg-dark-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-semibold">
              2
            </div>
            <h2 className="text-xl font-bold text-white">Bank Details</h2>
          </div>
          <div className="ml-11 space-y-4">
            {/* Bank Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Bank Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bankDetails.bankName}
                  readOnly
                  className="flex-1 bg-dark-900 border border-gray-600 rounded px-3 py-2 text-white"
                />
                <button
                  onClick={() => handleCopyAccount(bankDetails.bankName)}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-semibold transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Account Number
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  readOnly
                  className="flex-1 bg-dark-900 border border-gray-600 rounded px-3 py-2 text-white font-mono"
                />
                <button
                  onClick={() => handleCopyAccount(bankDetails.accountNumber)}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-semibold transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Account Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bankDetails.accountName}
                  readOnly
                  className="flex-1 bg-dark-900 border border-gray-600 rounded px-3 py-2 text-white"
                />
                <button
                  onClick={() => handleCopyAccount(bankDetails.accountName)}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-semibold transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Amount
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`₦${amount.toLocaleString()}`}
                  readOnly
                  className="flex-1 bg-dark-900 border border-gray-600 rounded px-3 py-2 text-white font-semibold"
                />
                <button
                  onClick={() => handleCopyAccount(amount.toString())}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-semibold transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Payment Reference
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bankDetails.reference}
                  readOnly
                  className="flex-1 bg-dark-900 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                />
                <button
                  onClick={() => handleCopyAccount(bankDetails.reference)}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-semibold transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Instructions */}
        <div className="bg-dark-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-semibold">
              3
            </div>
            <h2 className="text-xl font-bold text-white">How to Pay</h2>
          </div>
          <div className="ml-11 space-y-2 text-sm text-gray-300">
            {bankDetails.instructions.map((instruction, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-primary-400 mt-0.5">
                  {idx + 1}
                </span>
                {instruction}
              </p>
            ))}
          </div>
        </div>

        {/* Step 4: Confirm */}
        <div className="bg-dark-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-semibold">
              4
            </div>
            <h2 className="text-xl font-bold text-white">Confirm Payment</h2>
          </div>
          <div className="ml-11">
            <p className="text-sm text-gray-400 mb-4">
              Once you've sent the transfer, click the button below to confirm.
              Your enrollment will be activated once we verify the payment.
            </p>
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "I've Made the Transfer"}
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Need help? Contact support@impactedu.ng</p>
        </div>
      </div>
    </div>
  );
}
