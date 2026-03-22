import dynamic from "next/dynamic";
import { Suspense } from "react";

const JoinImpactClubClient = dynamic(
  () => import("@/components/JoinImpactClubClient"),
  { ssr: false }
);

export default function JoinImpactClubPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-dark-900 via-blue-900/20 to-dark-900 overflow-hidden">
        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl font-black text-white">Join ImpactKnowledge</h1>
            <p className="text-xl text-gray-300">
              Select a programme that aligns with your goals
            </p>
          </div>
        </div>
      </section>

      {/* Load client component */}
      <Suspense fallback={<div className="min-h-screen bg-dark-900" />}>
        <JoinImpactClubClient />
      </Suspense>
    </main>
  );
}
