"use client";
import Link from "next/link";

export default function PaypalCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p>Your PayPal payment was cancelled. You can try again or return to your dashboard.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">Return to Dashboard</Link>
      </div>
    </div>
  );
}
