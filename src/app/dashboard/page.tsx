"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/context/AuthStore";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import FacilitatorDashboard from "@/components/dashboard/FacilitatorDashboard";
import ParentDashboard from "@/components/dashboard/ParentDashboard";
import SchoolAdminDashboard from "@/components/dashboard/SchoolAdminDashboard";
import MentorDashboard from "@/components/dashboard/MentorDashboard";
import CircleMemberDashboard from "@/components/dashboard/CircleMemberDashboard";
import { Card } from "@/components/ui/Card";
import { AlertCircle, Loader } from "lucide-react";
import { User } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user: storeUser, hasHydrated, setUser, setToken, setHasHydrated } = useAuthStore();
  const [user, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user needs onboarding (not yet verified/completed onboarding)
  const needsOnboarding = user && user.verified !== true;

  // Check auth AFTER Zustand hydrates
  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage first
    if (!hasHydrated) {
      console.log("⏳ Waiting for Zustand to hydrate...");
      return;
    }

    console.log("✅ Zustand hydrated! storeUser:", storeUser);

    // If user is in Zustand store, use it
    if (storeUser) {
      console.log("✅ Using user from Zustand store");
      setLocalUser(storeUser);
      setIsLoading(false);
      return;
    }

    // Otherwise check localStorage as fallback
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("✅ Restoring user from localStorage");
        setToken(savedToken);
        setUser(parsedUser);
        setLocalUser(parsedUser);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error("❌ Failed to parse user:", e);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }

    // No auth found - redirect to login
    console.log("❌ No auth found, redirecting to login");
    setIsLoading(false);
    router.push("/auth/login");
  }, [hasHydrated, storeUser, router, setUser, setToken]); // Only run once on mount

  // Redirect to onboarding if needed
  useEffect(() => {
    if (needsOnboarding && user) {
      console.log("🔄 New user detected, redirecting to onboarding");
      router.push("/onboarding");
    }
  }, [needsOnboarding, router, user]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, don't render (useEffect will have redirected)
  if (!user) {
    return null;
  }

  console.log("📊 Rendering dashboard for user:", user.firstName, user.lastName, "Role:", user.role);

  // Render dashboard based on user role
  const renderDashboard = () => {
    try {
      switch (user?.role?.toLowerCase()) {
        case "student":
          console.log("📊 Rendering StudentDashboard");
          return <StudentDashboard />;
        case "admin":
          console.log("📊 Rendering AdminDashboard");
          return <AdminDashboard />;
        case "facilitator":
          console.log("📊 Rendering FacilitatorDashboard");
          return <FacilitatorDashboard />;
        case "school_admin":
          console.log("📊 Rendering SchoolAdminDashboard");
          return <SchoolAdminDashboard />;
        case "parent":
          console.log("📊 Rendering ParentDashboard");
          return <ParentDashboard />;
        case "mentor":
          console.log("📊 Rendering MentorDashboard");
          return <MentorDashboard />;
        case "circle_member":
          console.log("📊 Rendering CircleMemberDashboard");
          return <CircleMemberDashboard />;
        case "uni_member":
          console.log("📊 Rendering StudentDashboard for uni_member");
          return <StudentDashboard />;
        default:
          console.warn("⚠️ No dashboard for role:", user?.role);
          return (
            <Card className="p-12 text-center bg-yellow-50 border-2 border-yellow-200">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-yellow-700 mb-2">
                Dashboard Not Available
              </h2>
              <p className="text-yellow-600">
                Your dashboard for role "{user?.role}" is coming soon. Please contact support.
              </p>
            </Card>
          );
      }
    } catch (err) {
      console.error("❌ Error rendering dashboard:", err);
      return (
        <Card className="p-12 text-center bg-red-50 border-2 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-red-700 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-600">
            {err instanceof Error ? err.message : "An unknown error occurred"}
          </p>
        </Card>
      );
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
}
