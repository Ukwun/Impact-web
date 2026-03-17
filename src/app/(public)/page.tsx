"use client";

import { useState } from "react";
import SplashScreen from "@/components/landing/SplashScreen";
import HeroSection from "@/components/landing/HeroSection";
import ImpactNumbersModern from "@/components/landing/ImpactNumbersModern";
import ProgrammesOverviewModern from "@/components/landing/ProgrammesOverviewModern";
import HowItWorksModern from "@/components/landing/HowItWorksModern";
import FeaturedCourses from "@/components/landing/FeaturedCourses";
import UpcomingEvents from "@/components/landing/UpcomingEvents";
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

      {/* Impact Numbers */}
      <ImpactNumbersModern />

      {/* Programmes Overview */}
      <ProgrammesOverviewModern />

      {/* How It Works */}
      <HowItWorksModern />

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Upcoming Events */}
      <UpcomingEvents />

      {/* Testimonials */}
      <Testimonials />

      {/* Partners */}
      <Partners />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
