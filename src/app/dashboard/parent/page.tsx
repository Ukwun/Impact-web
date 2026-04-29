/**
 * Parent Dashboard Route
 * /dashboard/parent - Comprehensive parent learning oversight
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import ParentDashboard from "@/components/dashboards/ParentDashboard";
import { verifyAuth } from "@/lib/auth-service";

export const metadata: Metadata = {
  title: "Parent Dashboard | ImpactApp",
  description: "Monitor your children's learning progress, track assignments, and communicate with teachers",
};

export default async function ParentDashboardPage() {
  try {
    const auth = await verifyAuth();

    if (!auth || auth.role !== "PARENT") {
      redirect("/auth/login?error=unauthorized&redirect=/dashboard/parent");
    }

    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        <ParentDashboard />
      </main>
    );
  } catch (error) {
    console.error("Parent Dashboard Error:", error);
    redirect("/auth/login");
  }
}
