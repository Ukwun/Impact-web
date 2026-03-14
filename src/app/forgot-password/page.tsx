"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
      } else {
        setError(data.error || "Failed to send link");
        setStatus("error");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-6 py-12">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Forgot your password?</h2>
        {status === "sent" ? (
          <p className="text-green-400">
            If that email is registered, a reset link has been sent. Check your
            inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-primary-600 text-white py-2 rounded-md disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
        <p className="mt-4 text-sm">
          Remembered?{' '}
          <a href="/login" className="text-primary-400 underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
