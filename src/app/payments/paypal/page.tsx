"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaypalCheckoutPage() {
  const [amount, setAmount] = useState(50);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/paypal/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });
      const data = await res.json();
      if (data.success && data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        setError(data.error || "Failed to create PayPal order");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Pay with PayPal</h1>
      <div className="mb-4">
        <label className="block mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Currency</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Processing..." : "Pay with PayPal"}
      </button>
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}
