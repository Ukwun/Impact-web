"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

export default function FlutterwavePaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(5000); // Default amount in NGN
  const [courseId, setCourseId] = useState(searchParams.get("courseId") || "");

  const handlePayment = async () => {
    if (!user || !courseId) {
      setError("Missing required information");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment record
      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          userId: user.id,
          amount: amount,
          currency: "NGN",
          purpose: "course_enrollment",
          paymentMethod: "FLUTTERWAVE",
          metadata: {
            courseId,
          },
        }),
      });

      const createData = await createRes.json();
      if (!createData.success) {
        throw new Error(createData.error || "Failed to create payment");
      }

      const paymentId = createData.paymentId;

      // Initialize Flutterwave checkout
      const checkoutRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          paymentId,
          courseId,
          amount,
          currency: "NGN",
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutData.success) {
        throw new Error(checkoutData.error || "Failed to initialize payment");
      }

      // Redirect to Flutterwave
      if (checkoutData.data?.authorizationUrl) {
        window.location.href = checkoutData.data.authorizationUrl;
      }
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="text-primary-400 hover:text-primary-300 mb-6 text-sm font-semibold"
        >
          ← Back
        </button>

        <div className="bg-dark-800 border border-gray-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Flutterwave Payment
          </h1>
          <p className="text-gray-400 mb-6">
            Quick and secure payment processing
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Amount Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Pay
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-dark-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-dark-900 rounded px-4 py-3 text-sm text-gray-300">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₦{amount.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-semibold text-white">
                <span>Total:</span>
                <span>₦{amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <p className="text-sm font-medium text-gray-300 mb-3">
                Accepted Payment Methods:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                  Visa
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                  Mastercard
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                  MTN Mobile Money
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-primary-400 rounded-full mr-2"></span>
                  Airtel Money
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading || !user || !courseId}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>

            {/* Security Note */}
            <p className="text-xs text-gray-500 text-center">
              🔒 Your payment is secure and processed by Flutterwave
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
