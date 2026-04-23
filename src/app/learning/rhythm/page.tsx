/**
 * Weekly Rhythm System Route
 * /learning/rhythm - Structured learning schedule automation
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import WeeklyRhythmSystem from "@/components/systems/WeeklyRhythmSystem";
import { verifyAuth } from "@/lib/auth-service";

export const metadata: Metadata = {
  title: "Weekly Learning Rhythm | ImpactApp",
  description: "Your personalized weekly learning schedule with daily guidance, session tracking, and optimization insights",
};

export default async function WeeklyRhythmPage() {
  try {
    const auth = await verifyAuth();

    if (!auth) {
      redirect("/login?redirect=/learning/rhythm");
    }

    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <WeeklyRhythmSystem />
      </main>
    );
  } catch (error) {
    console.error("Weekly Rhythm Error:", error);
    redirect("/login");
  }
}
