"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/context/AuthStore";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const { login, user, error, isLoading, hasHydrated } = useAuthStore();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!hasHydrated) return; // Wait for hydration to complete

    if (user) {
      // User is already authenticated, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, hasHydrated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    const success = await login(formData.email, formData.password);
    if (success) {
      setSuccessMessage("Login successful! Redirecting...");

      // Wait a bit for the store to update, then redirect
      setTimeout(() => {
        // The useEffect above will handle the redirect based on user role
        // No need to manually redirect here
      }, 1000);
    }
  };

  // Show loading while checking authentication status
  if (!hasHydrated || (user && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-6 text-white font-semibold text-lg">Checking authentication...</p>
          <p className="mt-2 text-gray-400 text-sm">Redirecting to your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 opacity-10 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <Container className="max-w-md relative z-10">
        <Card className="p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white">Welcome Back</h1>
              <p className="text-gray-400">Sign in to access your ImpactApp account</p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-900/30 border-2 border-green-600 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-green-300 text-sm font-medium">{successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/30 border-2 border-red-600 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-300 text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-bold text-white">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 font-semibold">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="lg"
                className="w-full min-h-12"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dark-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-dark-700/80 text-gray-400 font-medium">Or</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t-2 border-dark-600">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-bold text-primary-400 hover:text-primary-300"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
