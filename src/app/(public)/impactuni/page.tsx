"use client";

import { Lightbulb, Users, TrendingUp, Rocket, Network, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ImpactUniPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-purple-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-sm">
              <Lightbulb className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300">Venture & Wealth Development</span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight">
              ImpactUni
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              University-based venture and wealth development programme. Transform ideas into viable ventures while building financial mastery and investment readiness.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/join-impact-club?programme=IMPACT_UNI">
                <Button variant="primary" size="lg" className="gap-3">
                  Join ImpactUni
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:uni@impactclub.com?subject=ImpactUni%20Inquiry">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/5">
                  Contact Programme Lead
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is ImpactUni */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">What is ImpactUni?</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ImpactUni is a specialized programme for university students and recent graduates (builders) who are transitioning from education to economic participation. We provide startup labs, financial mastery training, and investment readiness preparation—equipping you to launch ventures and participate in capital ecosystems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Rocket, title: "Startup Labs", desc: "Hands-on incubation programme to develop, test, and launch your business ideas." },
                { icon: TrendingUp, title: "Financial Mastery", desc: "Deep dive into personal finance, business finance, and investment principles." },
                { icon: Network, title: "Investor Readiness", desc: "Prepare to pitch to investors and access capital for your ventures." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-purple-500/30 p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/20 mb-6">
                    <item.icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programme Components */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Programme Components</h2>
            
            <div className="space-y-6">
              {[
                {
                  phase: "Phase 1: Foundation (3 months)",
                  desc: "Build financial fundamentals and business acumen",
                  items: ["Personal finance mastery", "Entrepreneurship essentials", "Business planning", "Team building"]
                },
                {
                  phase: "Phase 2: Venture Development (6 months)",
                  desc: "Develop and validate your business idea",
                  items: ["Startup lab access", "Mentorship from entrepreneurs", "Market research & validation", "MVP development"]
                },
                {
                  phase: "Phase 3: Investor Readiness (3 months)",
                  desc: "Prepare for capital access and fundraising",
                  items: ["Pitch development", "Investment pitch practice", "Network with investors", "Capital access pathways"]
                },
              ].map((component, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 p-8">
                  <h3 className="text-2xl font-black text-purple-400 mb-2">{component.phase}</h3>
                  <p className="text-gray-300 mb-4">{component.desc}</p>
                  <ul className="grid grid-cols-2 gap-4">
                    {component.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-300">
                        <Rocket className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Alumni Outcomes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { stat: "250+", label: "Ventures launched by alumni" },
                { stat: "$5M+", label: "Capital raised by alumni startups" },
                { stat: "1000+", label: "Jobs created by alumni businesses" },
                { stat: "95%", label: "Alumni in active economic participation" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-purple-500/20 p-8 text-center">
                  <div className="text-5xl font-black text-purple-400 mb-3">{item.stat}</div>
                  <p className="text-gray-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Apply */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Who Should Apply?</h2>
            
            <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 p-12">
              <ul className="space-y-6">
                {[
                  "University students (all years) with entrepreneurial ambitions",
                  "Recent graduates looking to launch their own ventures",
                  "Young professionals seeking to transition into entrepreneurship",
                  "Students interested in investment and wealth creation",
                  "Entrepreneurs ready to scale their early-stage businesses",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <Users className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-black text-white">Ready to Build Your Future?</h2>
            <p className="text-xl text-white text-opacity-90">
              Join the ImpactUni community of builders transforming ideas into successful ventures.
            </p>
            <Link href="/join-impact-club?programme=IMPACT_UNI">
              <Button variant="primary" size="lg" className="gap-3 bg-white text-purple-600 hover:bg-gray-100">
                Apply to ImpactUni
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
