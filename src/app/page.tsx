"use client";

import { useState } from "react";
import SplashScreen from "@/components/landing/SplashScreen";
import HeroSection from "@/components/landing/HeroSection";
import ProgrammesOverviewModern from "@/components/landing/ProgrammesOverviewModern";
import ImpactNumbersModern from "@/components/landing/ImpactNumbersModern";
import HowItWorksModern from "@/components/landing/HowItWorksModern";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FeaturedCourses";
import UpcomingEvents from "@/components/landing/UpcomingEvents";
import Partners from "@/components/landing/Partners";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      <HeroSection />
      <ProgrammesOverviewModern />
      <ImpactNumbersModern />
      <HowItWorksModern />
      <Testimonials />
      <FinalCTA />
      <UpcomingEvents />
      <Partners />
    </main>
  );
}
