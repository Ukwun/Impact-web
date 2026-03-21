"use client";

import { useState } from "react";
import SplashScreen from "@/components/landing/SplashScreen";
import HeroSection from "@/components/landing/HeroSection";
import ChallengeSection from "@/components/landing/ChallengeSection";
import ProgrammesNCDF from "@/components/landing/ProgrammesNCDF";
import HowItWorksNCDF from "@/components/landing/HowItWorksNCDF";
import ComparisonSection from "@/components/landing/ComparisonSection";
import ImpactSDG from "@/components/landing/ImpactSDG";
import Testimonials from "@/components/landing/Testimonials";
import Partners from "@/components/landing/Partners";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* The Challenge Section */}
      <ChallengeSection />

      {/* Our Programmes */}
      <ProgrammesNCDF />

      {/* How It Works */}
      <HowItWorksNCDF />

      {/* Why Different */}
      <ComparisonSection />

      {/* Impact & SDGs */}
      <ImpactSDG />

      {/* Testimonials */}
      <Testimonials />

      {/* Partners */}
      <Partners />

      {/* Final CTA */}
      <FinalCTA />
    </main>
  );
}
