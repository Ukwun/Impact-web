"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/context/AuthStore";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import { ArrowRight, CheckCircle2, Lock, User, MapPin } from "lucide-react";

const ROLES = [
  { value: "student", label: "Student (ImpactSchools)" },
  { value: "parent", label: "Parent / Guardian" },
  { value: "facilitator", label: "Facilitator" },
  { value: "school_admin", label: "School Administrator" },
  { value: "uni_member", label: "University Member (ImpactUni)" },
  { value: "circle_member", label: "Professional (ImpactCircle)" },
  { value: "mentor", label: "Mentor" },
  { value: "admin", label: "Platform Admin" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    role: "",
    institution: "",
    state: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUser, setToken, user } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, []); // Only run once on mount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Register the user - register endpoint now returns token
      console.log("📝 Submitting signup form...", formData);
      
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("📝 Register response status:", registerResponse.status);

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        console.error("❌ Registration failed:", errorData);
        throw new Error(errorData.error || "Registration failed");
      }

      const registerData = await registerResponse.json();
      console.log("📝 Register response data:", registerData);
      
      // Validate that we got a token
      if (!registerData.data?.token) {
        console.error("❌ No token in response:", registerData);
        throw new Error("Registration successful but no authentication token received. Please try logging in manually.");
      }

      if (!registerData.data?.user) {
        console.error("❌ No user in response:", registerData);
        throw new Error("Registration successful but no user data received. Please try logging in manually.");
      }

      // Use AuthStore to properly persist authentication
      console.log("✅ Setting user in auth store...", registerData.data.user);
      setToken(registerData.data.token);
      setUser(registerData.data.user);
      
      // Store token in localStorage as backup
      localStorage.setItem(AUTH_TOKEN_KEY, registerData.data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(registerData.data.user));
      console.log("✅ Auth data saved to localStorage");

      // Redirect to onboarding with a small delay to ensure state is set
      console.log("🔄 Redirecting to onboarding...");
      setError("");
      
      // Give React time to update state before redirecting
      setTimeout(() => {
        router.push(`/onboarding?role=${formData.role}`);
      }, 100);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred. Please try again.";
      console.error("⚠️ Signup error:", errorMsg);
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const StepIndicator = ({ current, total }: { current: number; total: number }) => (
    <div className="space-y-4 mb-8">
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1">
            <div
              className={`h-2.5 rounded-full transition-all ${
                i < current ? "bg-primary-500" : "bg-gray-300"
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-gray-300 text-center">
        Step {current} of {total}
      </p>
    </div>
  );

  const stepTitles = [
    { title: "Personal Details", icon: User },
    { title: "Role & Location", icon: MapPin },
    { title: "Secure Account", icon: Lock },
  ];

  const StepTitle = () => {
    const CurrentIcon = stepTitles[step - 1].icon;
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <CurrentIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-black text-text-500">
          {stepTitles[step - 1].title}
        </h2>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 opacity-10 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <Container className="max-w-md relative z-10">
        <Card className="p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Join ImpactApp
              </h1>
              <p className="text-gray-300 font-medium">Create your account in 3 simple steps</p>
            </div>

            {/* Progress */}
            <StepIndicator current={step} total={3} />

            {/* Step Title */}
            <StepTitle />

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-danger-500 rounded-xl text-danger-600 text-sm font-medium flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} method="POST" className="space-y-5">
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      First Name
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+234 (0) XXX XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 2: Role & Institution */}
              {step === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      Your Role
                    </label>
                    <Select value={formData.role} name="role" onChange={handleChange} required>
                      <option value="">Select your role</option>
                      {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      State of Residence
                    </label>
                    <Input
                      type="text"
                      name="state"
                      placeholder="e.g., Lagos"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      School / Institution (Optional)
                    </label>
                    <Input
                      type="text"
                      name="institution"
                      placeholder="Your school or organization"
                      value={formData.institution}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Step 3: Security */}
              {step === 3 && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-300 mt-2 font-medium">
                      ✓ At least 8 characters, uppercase & numbers
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-500 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      name="passwordConfirm"
                      placeholder="••••••••"
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-primary-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="terms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      required
                      className="w-5 h-5 accent-primary-500 cursor-pointer mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 font-medium cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="text-primary-600 font-bold hover:underline">
                        Terms of Use
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary-600 font-bold hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="light"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type={step === 3 ? "submit" : "button"}
                  disabled={isLoading}
                  size="lg"
                  className="flex-1"
                  onClick={step === 3 ? undefined : handleNext}
                >
                  {isLoading ? (
                    "Loading..."
                  ) : step === 3 ? (
                    <>
                      Create Account
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      Next Step
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-300 font-medium">Already registered?</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-gray-300 text-sm font-medium">
                <Link href="/auth/login" className="text-primary-600 font-bold hover:text-primary-700">
                  Sign in to your account
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
