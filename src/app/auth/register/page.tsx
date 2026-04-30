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
import dynamic from "next/dynamic";
const EmailVerificationForm = dynamic(() => import("@/components/auth/EmailVerificationForm"), { ssr: false });
import { getDashboardRoute } from "@/lib/rbac";
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

type FormDataType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  role: string;
  institution: string;
  state: string;
  agreeToTerms: boolean;
};

const validateFormData = (data: FormDataType, step: number) => {
  const errors: string[] = [];

  if (step >= 1) {
    if (!data.firstName.trim()) errors.push("First name is required");
    if (!data.lastName.trim()) errors.push("Last name is required");
    if (!data.email.trim()) errors.push("Email is required");
    if (!data.phone.trim()) errors.push("Phone number is required");
    if (!/^[a-zA-Z\s'-]+$/.test(data.firstName + ' ' + data.lastName)) {
      errors.push("Name can only contain letters, spaces, hyphens, and apostrophes");
    }
  }

  if (step >= 2) {
    if (!data.role) errors.push("Please select your role");
    if (!data.state.trim()) errors.push("State is required");
  }

  if (step >= 3) {
    if (!data.password) errors.push("Password is required");
    if (data.password !== data.passwordConfirm) errors.push("Passwords do not match");
    if (!data.agreeToTerms) errors.push("You must agree to the terms and conditions");
  }

  return errors;
};

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
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUser, setToken, register: registerUser, user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If already authenticated, show a helpful message instead of redirecting.
  // This avoids forcing users into the demo student account when they want to register.
  const isAlreadyAuthenticated = Boolean(user);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const validationErrors = validateFormData(formData, step);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }
    console.log("handleNext called, current step:", step);
    setStep(step + 1);
    setError(""); // Clear error on successful step
    console.log("step updated to:", step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateFormData(formData, 3);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      // Use the auth store's register method for proper state management
      console.log("📝 Submitting signup form...", formData);

      const result = await registerUser(formData);

      if (!result.success) {
        throw new Error(result.error || "Registration failed");
      }

      // Show verification form instead of redirecting immediately
      setPendingEmail(formData.email);
      setShowVerification(true);
      setIsLoading(false);
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
        <h2 className="text-2xl font-black text-white">
          {stepTitles[step - 1].title}
        </h2>
      </div>
    );
  };

  if (isAlreadyAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 opacity-10 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <Container className="max-w-md relative z-10">
          <Card className="p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-white">You're already signed in</h1>
                <p className="text-gray-300">
                  You are currently signed in as <span className="font-semibold text-white">{user?.email}</span> (
                  <span className="text-primary-300">{user?.role?.toLowerCase()}</span>).
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">
                  If you want to create a new account or register with a different role, please log out first.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => router.push(getDashboardRoute(user?.role))}
                    className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold"
                  >
                    Go to my dashboard
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoggingOut(true);
                      await logout();
                      setIsLoggingOut(false);
                    }}
                    className="w-full py-3 rounded-lg bg-dark-700 border border-white/20 text-white font-semibold hover:bg-dark-600"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Log out & create new account"}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  if (showVerification && pendingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 opacity-10 rounded-full blur-3xl -ml-48 -mb-48"></div>
        <Container className="max-w-md relative z-10">
          <Card className="p-8 shadow-2xl">
            <EmailVerificationForm email={pendingEmail} onSuccess={() => {
              // After successful verification, redirect to dashboard
              const dashboardRoute = getDashboardRoute(formData.role);
              window.location.href = dashboardRoute || "/dashboard";
            }} />
          </Card>
        </Container>
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
            <form onSubmit={handleSubmit} className="space-form">
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <>
                  <div>
                    <label className="block label-primary mb-2">
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
                    <label className="block label-primary mb-2">
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
                    <label className="block label-primary mb-2">
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
                    <label className="block label-secondary mb-2">
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
                    <label className="block label-secondary mb-2">
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
                    <label className="block label-secondary mb-2">
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
                    <label className="block label-secondary mb-2">
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
                    <label className="block label-secondary mb-2">
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
                    <label className="block label-secondary mb-2">
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
                    onClick={(e) => {
                      e.preventDefault();
                      setStep(step - 1);
                    }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type={step === 3 ? "submit" : "button"}
                  disabled={isLoading}
                  size="lg"
                  className="flex-1"
                  onClick={(e) => {
                    if (step === 3) {
                      // Let the form handle submission
                      return;
                    }
                    e.preventDefault();
                    console.log("Next button clicked, step:", step);
                    handleNext(e);
                  }}
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
