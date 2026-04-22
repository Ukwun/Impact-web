"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<
    "stripe" | "flutterwave" | "bank" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handlePaymentMethodSelect = async (method: "stripe" | "flutterwave" | "bank") => {
    setLoading(true);
    try {
      setSelectedMethod(method);
      // Redirect to appropriate payment page
      if (method === "stripe") {
        router.push("/payments/stripe");
      } else if (method === "flutterwave") {
        router.push("/payments/flutterwave");
      } else {
        router.push("/payments/bank-transfer");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-white">Payment Methods</h1>
        <p className="text-gray-400 mb-8">
          Choose your preferred payment method to complete your enrollment
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Flutterwave Card */}
          <div className="bg-dark-800 border border-primary-500 rounded-lg p-8 hover:shadow-lg hover:shadow-primary-500/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Flutterwave</h2>
              <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded">
                Recommended
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              Fast, secure payment with multiple card and mobile money options
            </p>
            <ul className="space-y-2 mb-8 text-gray-300 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-400 rounded-full mr-3"></span>
                Visa, Mastercard, American Express
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-400 rounded-full mr-3"></span>
                Mobile money (MTN, Airtel, Vodafone)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-400 rounded-full mr-3"></span>
                Instant confirmation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-400 rounded-full mr-3"></span>
                Secure and encrypted
              </li>
            </ul>
            <button
              onClick={() => handlePaymentMethodSelect("flutterwave")}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Pay with Flutterwave"}
            </button>
          </div>

          {/* Bank Transfer Card */}
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-8 hover:shadow-lg hover:shadow-gray-600/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Bank Transfer</h2>
              <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded">
                Manual
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              Direct bank transfer to our corporate account
            </p>
            <ul className="space-y-2 mb-8 text-gray-300 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                GTBank Transfer
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Other Nigerian Banks
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                International transfers
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Manual confirmation required
              </li>
            </ul>
            <button
              onClick={() => handlePaymentMethodSelect("bank")}
              disabled={loading}
              className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Use Bank Transfer"}
            </button>
          </div>

          {/* Stripe Card */}
          <div className="bg-dark-800 border border-blue-600 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-600/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Stripe</h2>
              </div>
              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded">
                Global
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              Pay securely with your debit or credit card (USA & UK supported)
            </p>
            <ul className="space-y-2 mb-8 text-gray-300 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Visa, Mastercard, Amex, Discover
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Works worldwide (USD, GBP)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Instant confirmation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                Bank-level security
              </li>
            </ul>
            <button
              onClick={() => handlePaymentMethodSelect("stripe")}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Pay with Stripe"}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-dark-800/50 border border-gray-700 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-400 text-sm">
            <div>
              <p className="font-semibold text-white mb-2">
                📧 Email Support
              </p>
              <p>support@impactedu.ng</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">
                💬 Live Chat
              </p>
              <p>Available Mon-Fri, 9 AM - 5 PM WAT</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-primary-400 hover:text-primary-300 text-sm font-semibold"
          >
            ← Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
