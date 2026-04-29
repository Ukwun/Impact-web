/**
 * Admin Dashboard Route
 * /dashboard/admin - School administration and oversight
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import SchoolAdminDashboard from "@/components/dashboards/SchoolAdminDashboard";
import { verifyAuth } from "@/lib/auth-service";

export const metadata: Metadata = {
  title: "Admin Dashboard | ImpactApp",
  description: "School administration dashboard for student management, course oversight, analytics, and institutional metrics",
};

export default async function AdminDashboardPage() {
  try {
    const auth = await verifyAuth();

    if (!auth || (auth.role !== "ADMIN" && auth.role !== "SUPER_ADMIN")) {
      redirect("/auth/login?error=unauthorized&redirect=/dashboard/admin");
    }

    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <SchoolAdminDashboard />
      </main>
    );
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    redirect("/auth/login");
  }
}
