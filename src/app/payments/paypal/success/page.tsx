"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaypalSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      fetch(`/api/payments/paypal/capture?orderId=${token}`)
        .then(res => res.json())
        .then(data => {
          // Optionally show receipt or redirect
          router.push("/dashboard?payment=success");
        });
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p>Your PayPal payment was processed. Redirecting...</p>
      </div>
    </div>
  );
}
