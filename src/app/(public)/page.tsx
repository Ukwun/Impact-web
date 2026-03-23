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
import BecomePartner from "@/components/landing/BecomePartner";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <main className="overflow-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Our Ecosystem */}
      <ProgrammesNCDF />

      {/* 3. How It Works */}
      <HowItWorksNCDF />

      {/* 4. Why ImpactKnowledge Is Different */}
      <ComparisonSection />

      {/* 5. The Challenge Section */}
      <ChallengeSection />

      {/* 6. Impact & SDGs */}
      <ImpactSDG />

      {/* 7. Real Stories, Real Impact */}
      <Testimonials />

      {/* 8. Trusted By Leaders */}
      <Partners />

      {/* 9. Start Your Journey */}
      <FinalCTA />

      {/* 10. Become a Partner */}
      <BecomePartner />
    </main>
  );
}
