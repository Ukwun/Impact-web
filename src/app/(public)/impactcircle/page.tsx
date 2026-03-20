"use client";

import { Users, DollarSign, TrendingUp, Briefcase, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ImpactCirclePage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-amber-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/20 border border-amber-400/30 backdrop-blur-sm">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Capital Formation Ecosystem</span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight">
              ImpactCircle
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              A curated community for entrepreneurs and investors. Access capital intelligence forums, investment education, and a structured deal flow ecosystem for responsible capital deployment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/join-impact-club?programme=IMPACT_CIRCLE">
                <Button variant="primary" size="lg" className="gap-3">
                  Apply Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:circle@impactclub.com?subject=ImpactCircle%20Inquiry">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/5">
                  Schedule Consultation
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is ImpactCircle */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">What is ImpactCircle?</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ImpactCircle is an exclusive, curated community connecting seasoned entrepreneurs, angel investors, institutional investors, and impact-minded capital sources. Members participate in capital intelligence forums, investment education, and access to high-quality deal flow—creating a complete ecosystem for responsible investment and venture participation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Globe, title: "Capital Intelligence Forums", desc: "Curated events, market analysis, and investment thesis discussions." },
                { icon: TrendingUp, title: "Investment Education", desc: "Advanced modules on portfolio management, deal analysis, and capital deployment." },
                { icon: DollarSign, title: "Deal Access Ecosystem", desc: "Structured pipeline of investment opportunities vetted by our investment committee." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-amber-500/30 p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500/20 mb-6">
                    <item.icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Membership Categories</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  category: "Entrepreneur - Seekers",
                  desc: "Growing businesses seeking capital and strategic support",
                  benefits: ["Access to investor network", "Investment readiness coaching", "Pitch opportunity at forums", "Deal insights and market intelligence"]
                },
                {
                  category: "Investment - Angels",
                  desc: "Individual investors with deployment capital",
                  benefits: ["Vetted deal flow", "Due diligence support", "Portfolio monitoring", "Angel cohort collaboration"]
                },
                {
                  category: "Institution - Partners",
                  desc: "Institutional capital sources and financial institutions",
                  benefits: ["Curated portfolio opportunities", "Market research & reports", "Co-investment structures", "Impact measurement frameworks"]
                },
              ].map((member, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 p-8">
                  <h3 className="text-xl font-black text-amber-400 mb-2">{member.category}</h3>
                  <p className="text-gray-300 mb-6">{member.desc}</p>
                  <ul className="space-y-3">
                    {member.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <DollarSign className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                        <span className="text-sm text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Impact */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Capital Ecosystem Impact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { stat: "500+", label: "Active community members" },
                { stat: "$50M+", label: "Capital deployed through platform" },
                { stat: "150+", label: "Companies funded" },
                { stat: "2000+", label: "Jobs created by portfolio companies" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-amber-500/20 p-8 text-center">
                  <div className="text-5xl font-black text-amber-400 mb-3">{item.stat}</div>
                  <p className="text-gray-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">How It Works</h2>
            
            <div className="space-y-6">
              {[
                { step: "1", title: "Application & Vetting", desc: "Submit your application and participate in our rigorous vetting process." },
                { step: "2", title: "Onboarding", desc: "Connect with community, attend orientation, and access member portal." },
                { step: "3", title: "Participation", desc: "Engage in forums, access deal flow, and participate in investment activities." },
                { step: "4", title: "Impact Creation", desc: "Deploy capital, create value, and measure sustainable impact." },
              ].map((item, i) => (
                <div key={i} className="flex gap-8 items-start">
                  <div className="text-5xl font-black text-amber-400 flex-shrink-0 w-20">{item.step}</div>
                  <div className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border-2 border-amber-500/20 p-6">
                    <h3 className="text-2xl font-black text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-black text-white">Join Africa's Premier Investment Community</h2>
            <p className="text-xl text-white text-opacity-90">
              Access capital, deploy investments responsibly, and create lasting economic impact.
            </p>
            <Link href="/join-impact-club?programme=IMPACT_CIRCLE">
              <Button variant="primary" size="lg" className="gap-3 bg-white text-amber-600 hover:bg-gray-100">
                Apply to ImpactCircle
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
