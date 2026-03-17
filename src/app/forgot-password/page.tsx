"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mail, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-dark-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-400">Enter your email and we'll send you a reset link</p>
          </div>

          {status === "sent" ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm">
                ✓ If that email is registered, a reset link has been sent. Check your inbox (and spam folder).
              </p>
              <button
                onClick={() => router.push("/auth/login")}
                className="mt-4 w-full text-center text-primary-400 hover:text-primary-300 transition-colors font-semibold"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send Reset Link"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Remember your password?{' '}
                <a href="/auth/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                  Sign in
                </a>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
