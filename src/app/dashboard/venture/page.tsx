import { Metadata } from "next";
import { redirect } from "next/navigation";
import VentureLabSystem from "@/components/systems/VentureLabSystem";
import { verifyAuth } from "@/lib/auth-service";

export const metadata: Metadata = {
  title: "Venture Lab | ImpactApp",
  description: "Build your business plan, prepare projections, run investor simulations, and submit your capstone pitch.",
};

export default async function VentureLabPage() {
  try {
    const auth = await verifyAuth();

    if (!auth.isAuthenticated) {
      redirect("/login?redirect=/dashboard/venture");
    }

    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eff6ff,_#fff7ed_45%,_#ffffff)]">
        <VentureLabSystem />
      </main>
    );
  } catch (error) {
    console.error("Venture Lab Error:", error);
    redirect("/login");
  }
}