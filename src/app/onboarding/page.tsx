"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/context/AuthStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ArrowRight, ArrowLeft, Loader, CheckCircle2 } from "lucide-react";

const EDUCATION_LEVELS = [
  { value: "junior_secondary", label: "Junior Secondary" },
  { value: "senior_secondary", label: "Senior Secondary" },
  { value: "university", label: "University" },
];

const STUDENT_INTERESTS = [
  { value: "financial_literacy", label: "Financial Literacy" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "technology", label: "Technology" },
  { value: "leadership", label: "Leadership" },
  { value: "business", label: "Business" },
  { value: "investment", label: "Investment Basics" },
];

const STUDENT_GOALS = [
  { value: "money_management", label: "Understand money management" },
  { value: "start_business", label: "Start a business" },
  { value: "prepare_university", label: "Prepare for university" },
  { value: "leadership_skills", label: "Build leadership skills" },
];

const LEARNING_PACES = [
  { value: "10_mins_daily", label: "10 minutes daily" },
  { value: "30_mins_daily", label: "30 minutes daily" },
  { value: "2_3_weekly", label: "2–3 lessons weekly" },
  { value: "weekend", label: "Weekend learning" },
];

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const FACILITATOR_SUBJECTS = [
  { value: "financial_literacy", label: "Financial Literacy" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "leadership", label: "Leadership" },
  { value: "business_dev", label: "Business Development" },
];

const CLASS_SIZES = [
  { value: "10_20", label: "10–20" },
  { value: "20_50", label: "20–50" },
  { value: "50_plus", label: "50+" },
];

const TEACHING_DAYS = [
  { value: "monday", label: "Monday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "friday", label: "Friday" },
  { value: "weekend", label: "Weekend" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, hasHydrated, setUser } = useAuthStore();
  const redirectedRef = useRef(false); // Prevent infinite redirect loops
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    location: "",
    institution: "",
    // Student
    educationLevel: "",
    interests: [] as string[],
    learningGoals: [] as string[],
    learningPace: "",
    skillLevel: "",
    notificationFrequency: "daily",
    // Facilitator
    teachingSubjects: [] as string[],
    classSize: "",
    teachingDays: [] as string[],
    // Parent
    childId: "",
    monitoringInterests: [] as string[],
    // Other roles
    fieldOfStudy: "",
    industry: "",
    expertise: "",
  });

  // Check authentication - wait for hydration first
  useEffect(() => {
    if (!redirectedRef.current && hasHydrated && !user) {
      redirectedRef.current = true;
      router.push("/auth/login");
    }
  }, [hasHydrated, user, router]);

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev as any)[field].includes(value)
        ? (prev as any)[field].filter((v: string) => v !== value)
        : [...(prev as any)[field], value],
    }));
  };

  const handleNext = async () => {
    setError("");

    // Validation
    if (step === 1) {
      if (!formData.location) {
        setError("Please select a location");
        return;
      }
    } else if (step === 2) {
      if (!formData.institution) {
        setError("Please enter your institution");
        return;
      }
    } else if (step === 3 && user.role === "student") {
      if (!formData.educationLevel) {
        setError("Please select your education level");
        return;
      }
    } else if (step === 4 && user.role === "student") {
      if (formData.interests.length === 0) {
        setError("Please select at least one interest");
        return;
      }
    } else if (step === 5 && user.role === "student") {
      if (!formData.learningPace || formData.learningGoals.length === 0) {
        setError("Please complete this step");
        return;
      }
    }

    if (step < getTotalSteps()) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (redirectedRef.current) {
      return; // Prevent duplicate submissions
    }

    setIsLoading(true);
    try {
      console.log("📝 Saving onboarding data...", formData);

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save onboarding");
      }

      const data = await response.json();

      console.log("✅ Onboarding saved successfully");
      
      // Update user in Zustand store with verified flag
      const updatedUser = {
        ...user,
        verified: true,
      };
      setUser(updatedUser);

      // Redirect to role-specific dashboard instead of login
      redirectedRef.current = true; // Mark as redirected to prevent re-submission
      const { getDashboardRoute } = await import("@/lib/rbac");
      const dashboardRoute = getDashboardRoute(user.role);
      router.push(dashboardRoute);
    } catch (err) {
      console.error("❌ Onboarding error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      redirectedRef.current = false; // Reset on error so they can retry
      setIsLoading(false);
    }
  };

  const getTotalSteps = () => {
    if (user.role === "student") return 6;
    if (user.role === "facilitator") return 5;
    if (user.role === "parent") return 4;
    return 3;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Where are you located?</h2>
            <p className="text-gray-400">This helps us provide location-specific content and events</p>
            <Input
              type="text"
              name="location"
              placeholder="Enter your state or region (e.g., Lagos, Abuja)"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Which institution are you with?</h2>
            <p className="text-gray-400">School, university, or organization name</p>
            <Input
              type="text"
              name="institution"
              placeholder="Institution name"
              value={formData.institution}
              onChange={handleChange}
            />
          </div>
        );

      case 3:
        if (user.role === "student") {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">What's your education level?</h2>
              <Select value={formData.educationLevel} name="educationLevel" onChange={handleChange} required>
                <option value="">Select education level</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </div>
          );
        }
        if (user.role === "facilitator") {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Which subjects do you teach?</h2>
              <div className="grid grid-cols-1 gap-3">
                {FACILITATOR_SUBJECTS.map((subject) => (
                  <label key={subject.value} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600">
                    <input
                      type="checkbox"
                      checked={formData.teachingSubjects.includes(subject.value)}
                      onChange={() => handleMultiSelect("teachingSubjects", subject.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{subject.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }
        return null;

      case 4:
        if (user.role === "student") {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Which topics interest you?</h2>
              <div className="grid grid-cols-1 gap-3">
                {STUDENT_INTERESTS.map((interest) => (
                  <label key={interest.value} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest.value)}
                      onChange={() => handleMultiSelect("interests", interest.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{interest.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }
        if (user.role === "facilitator") {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">How many students do you typically teach?</h2>
              <Select value={formData.classSize} name="classSize" onChange={handleChange} required>
                <option value="">Select class size</option>
                {CLASS_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </Select>
            </div>
          );
        }
        return null;

      case 5:
        if (user.role === "student") {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">What do you want to achieve?</h2>
              <div className="grid grid-cols-1 gap-3">
                {STUDENT_GOALS.map((goal) => (
                  <label key={goal.value} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600">
                    <input
                      type="checkbox"
                      checked={formData.learningGoals.includes(goal.value)}
                      onChange={() => handleMultiSelect("learningGoals", goal.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{goal.label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">How often do you want to learn?</label>
                <Select value={formData.learningPace} name="learningPace" onChange={handleChange} required>
                  <option value="">Select learning pace</option>
                  {LEARNING_PACES.map((pace) => (
                    <option key={pace.value} value={pace.value}>
                      {pace.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          );
        }
        if (user.role === "facilitator") {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Which days do you usually teach?</h2>
              <div className="grid grid-cols-1 gap-3">
                {TEACHING_DAYS.map((day) => (
                  <label key={day.value} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600">
                    <input
                      type="checkbox"
                      checked={formData.teachingDays.includes(day.value)}
                      onChange={() => handleMultiSelect("teachingDays", day.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }
        return null;

      case 6:
        if (user.role === "student") {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">What's your current skill level?</h2>
              <Select value={formData.skillLevel} name="skillLevel" onChange={handleChange} required>
                <option value="">Select skill level</option>
                {SKILL_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Notification Frequency</label>
                <Select value={formData.notificationFrequency} name="notificationFrequency" onChange={handleChange}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </Select>
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-12">
      <Container className="max-w-lg">
        <Card className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex gap-2">
              {Array.from({ length: getTotalSteps() }).map((_, i) => (
                <div key={i} className="flex-1">
                  <div className={`h-2 rounded-full transition-all ${i < step ? "bg-primary-500" : "bg-gray-600"}`} />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-3">Step {step} of {getTotalSteps()}</p>
          </div>

          {/* Content */}
          <div className="space-y-6 mb-8">{renderStep()}</div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-300 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="light"
                size="lg"
                className="flex-1"
                onClick={() => setStep(step - 1)}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : step === getTotalSteps() ? (
                <>
                  Complete <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Option */}
          <p className="text-center text-gray-400 text-sm mt-6">
            <button onClick={() => router.push("/auth/login")} className="text-primary-500 hover:underline">
              Skip for now — you can complete later
            </button>
          </p>
        </Card>
      </Container>
    </div>
  );
}
