/**
 * Project Showcase System Route
 * /projects - Portfolio, capstone projects, and peer showcase
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProjectShowcaseSystem from "@/components/systems/ProjectShowcaseSystem";
import { verifyAuth } from "@/lib/auth-service";

export const metadata: Metadata = {
  title: "Project Showcase | ImpactApp",
  description: "Showcase your work, build your portfolio, collaborate on projects, and earn peer recognition",
};

export default async function ProjectShowcasePage() {
  try {
    const auth = await verifyAuth();

    if (!auth) {
      redirect("/login?redirect=/projects");
    }

    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        <ProjectShowcaseSystem />
      </main>
    );
  } catch (error) {
    console.error("Project Showcase Error:", error);
    redirect("/login");
  }
}
