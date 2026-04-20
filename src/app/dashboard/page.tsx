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
import UniversityMemberDashboard from "@/components/dashboard/UniversityMemberDashboard";
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

  // Fetch fresh user profile from Firestore to get latest role
  const fetchFreshUserProfile = async (token: string, userId: string) => {
    try {
      console.log("🔄 Fetching fresh user profile from Firestore...");
      
      // Use AbortController to timeout after 5 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const freshUser = data.data || data;
        console.log("✅ Fresh user profile loaded:", freshUser.firstName, "Role:", freshUser.role);
        return freshUser;
      } else {
        console.warn("⚠️ Could not fetch fresh profile, using cached");
        return null;
      }
    } catch (err) {
      console.error("❌ Error fetching fresh profile:", err);
      return null;
    }
  };

  // Check auth AFTER Zustand hydrates
  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage first
    if (!hasHydrated) {
      console.log("⏳ Waiting for Zustand to hydrate...");
      return;
    }

    console.log("✅ Zustand hydrated! storeUser:", storeUser);

    const loadUser = async () => {
      let token: string | null = null;
      let cachedUser: User | null = null;

      // If user is in Zustand store, use it
      if (storeUser) {
        console.log("✅ Using user from Zustand store");
        token = localStorage.getItem(AUTH_TOKEN_KEY);
        cachedUser = storeUser;
      } else {
        // Otherwise check localStorage as fallback
        const savedUser = localStorage.getItem(AUTH_USER_KEY);
        const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        
        if (savedUser && savedToken) {
          try {
            cachedUser = JSON.parse(savedUser);
            token = savedToken;
            console.log("✅ Restoring user from localStorage");
            setToken(savedToken);
            setUser(cachedUser);
          } catch (e) {
            console.error("❌ Failed to parse user:", e);
            localStorage.removeItem(AUTH_USER_KEY);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setIsLoading(false);
            router.push("/auth/login");
            return;
          }
        }
      }

      if (token && cachedUser) {
        // Skip upfront token validation - let dashboard components handle it
        // If token is invalid, they'll get 401/403 errors and redirect to login
        console.log("✅ User and token found, loading dashboard");
        
        // Try to refresh user profile in background without blocking
        const freshUser = await fetchFreshUserProfile(token, cachedUser.id || cachedUser.uid || "");
        if (freshUser) {
          const updatedUser = { ...cachedUser, ...freshUser, role: freshUser.role || cachedUser.role };
          setLocalUser(updatedUser);
          setUser(updatedUser);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
          console.log("✅ Updated user profile in background");
        } else {
          setLocalUser(cachedUser);
          console.log("⚠️ Using cached user profile (background refresh failed)");
        }
        
        setIsLoading(false);
        return;
      }

      // No auth found - redirect to login
      console.log("❌ No auth found, redirecting to login");
      setIsLoading(false);
      router.push("/auth/login");
    };

    loadUser();
  }, [hasHydrated, storeUser, router, setUser, setToken]);

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
    const normalizedRole = user?.role?.toLowerCase();
    console.log(`🔍 Normalized role for switch: "${normalizedRole}" (original: "${user?.role}")`);
    
    try {
      switch (normalizedRole) {
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
          console.log("📊 Rendering UniversityMemberDashboard");
          return <UniversityMemberDashboard />;
        default:
          console.warn("⚠️ No dashboard for role:", user?.role, "normalized:", normalizedRole);
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
