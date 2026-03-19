"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Star, Users, BookOpen, Zap, Badge } from "lucide-react";
import Link from "next/link";

export default function MembershipBenefitsTeaser() {
  const tiers = [
    {
      name: "Student",
      description: "Start your learning journey",
      icon: BookOpen,
      features: ["Learning pathways", "Community access", "Certifications"],
      color: "from-blue-500",
      cta: "Get Started",
    },
    {
      name: "Professional",
      description: "Accelerate your career",
      icon: Zap,
      features: ["Advanced courses", "Mentorship", "Job board"],
      color: "from-primary-500",
      cta: "Upgrade",
      featured: true,
    },
    {
      name: "Leader",
      description: "Build and inspire others",
      icon: Badge,
      features: ["Content creation", "Team management", "Impact platform"],
      color: "from-secondary-500",
      cta: "Apply",
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-dark-900 to-dark-800 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-400/30">
            <Star className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-bold text-primary-300">Membership Benefits</span>
          </div>
          <h2 className="text-5xl font-black text-white">
            Six Membership Tiers, One Mission
          </h2>
          <p className="text-xl text-gray-300">
            Choose the tier that matches your stage in life and unlock pathways for growth, leadership, and impact
          </p>
        </div>

        {/* Membership Tiers Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <div
                key={idx}
                className={`relative group rounded-2xl overflow-hidden transition-all duration-500 ${
                  tier.featured ? "md:scale-105 ring-2 ring-primary-400" : ""
                }`}
              >
                <div
                  className={`relative h-full rounded-2xl border backdrop-blur-sm p-8 flex flex-col ${
                    tier.featured
                      ? "bg-gradient-to-br from-primary-500/20 to-secondary-500/10 border-primary-400/50"
                      : "bg-gradient-to-br from-dark-700/50 to-dark-800/30 border-dark-600/30 group-hover:border-dark-500/60"
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 text-dark-900 text-xs font-black">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} to-transparent flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 flex-1">{tier.description}</p>

                  <ul className="space-y-2 mb-8">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-2 text-gray-300 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/membership">
                    <Button
                      variant={tier.featured ? "primary" : "outline"}
                      size="sm"
                      className="w-full gap-2"
                    >
                      {tier.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* See All Tiers CTA */}
        <div className="text-center">
          <Link href="/membership">
            <Button variant="outline" size="lg" className="gap-2 border-primary-400 text-primary-300 hover:bg-primary-500/10">
              View All 6 Membership Tiers
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
