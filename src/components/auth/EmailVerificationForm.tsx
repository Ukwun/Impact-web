"use client";
import { useState, useEffect, useRef } from "react";

export default function EmailVerificationForm({ email, onSuccess }: { email: string; onSuccess?: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [resending, setResending] = useState(false);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (success) return;
    if (timer <= 0) {
      setResendAvailable(true);
      return;
    }
    timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current!);
  }, [timer, success]);

  // Reset timer on resend
  const handleResend = async () => {
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      console.log("[EmailVerification] Resending code to:", email);
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to resend code");
      } else {
        setTimer(600);
        setResendAvailable(false);
        setInfo("A new verification code has been sent to your email.");
      }
    } catch (e) {
      setError("Network error");
      console.error("[EmailVerification] Resend error:", e);
    } finally {
      setResending(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    setSuccess(false);
    try {
      console.log("[EmailVerification] Verifying code for:", email, code);
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setInfo("Email verified successfully! You may continue.");
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      setError("Network error");
      console.error("[EmailVerification] Verification error:", err);
    } finally {
      setLoading(false);
    }
  }

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-semibold">Verify your email</h2>
      <p className="text-sm text-gray-600">Enter the 6-digit code sent to <span className="font-mono">{email}</span>.</p>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        minLength={6}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        placeholder="6-digit code"
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        required
        disabled={loading || success}
      />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {timer > 0
            ? `Code expires in ${minutes}:${seconds.toString().padStart(2, "0")}`
            : "Code expired. Request a new code."}
        </span>
        <button
          type="button"
          className="text-primary-600 hover:underline disabled:opacity-50 ml-2"
          onClick={handleResend}
          disabled={!resendAvailable || resending}
        >
          {resending ? "Resending..." : "Resend code"}
        </button>
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        disabled={loading || code.length !== 6 || success || timer <= 0}
      >
        {loading ? "Verifying..." : "Verify Email"}
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {info && <div className="text-blue-700 text-sm">{info}</div>}
      {success && <div className="text-green-700 text-sm">Email verified! You may continue.</div>}
    </form>
  );
}
