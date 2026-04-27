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
              A university and early-career execution programme that moves learners from knowledge to execution, employability, venture building, and capital awareness.
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
                ImpactUni is built for university students, recent graduates, and early-career builders who need more than inspiration. Learners build career capital, validate ventures or innovation projects, create execution plans and financial models, and learn how to present credibly to employers, partners, institutions, and investors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Rocket, title: "Founder Studio", desc: "Turn a problem, idea, or civic opportunity into a validated venture or execution-ready project." },
                { icon: TrendingUp, title: "Career and Financial Capital", desc: "Build mature personal finance habits, professional positioning, and execution discipline." },
                { icon: Network, title: "Capital Readiness", desc: "Understand grants, debt, equity, bootstrapping, and how to present opportunity credibly." },
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
            <h2 className="text-4xl font-black text-white mb-12">Term Structure</h2>
            
            <div className="space-y-6">
              {[
                {
                  phase: "Term 1: Personal and Professional Capital",
                  desc: "Strengthen financial maturity, productivity, and professional positioning.",
                  items: ["Budgeting and debt awareness", "Income planning", "Digital professionalism", "Career positioning"]
                },
                {
                  phase: "Term 2: Venture and Project Execution",
                  desc: "Validate a problem and build a practical execution roadmap.",
                  items: ["Problem validation", "Product or service design", "Market research", "Partnerships and operations"]
                },
                {
                  phase: "Term 3: Capital and Institutional Readiness",
                  desc: "Build financial models, investor materials, and formal presentation confidence.",
                  items: ["Financial modelling", "Fundraising basics", "Grants, debt, equity", "Formal presentations"]
                },
                {
                  phase: "Term 4: Applied Studio",
                  desc: "Apply learning inside live projects, challenge labs, and showcase moments.",
                  items: ["Startup studio", "Consulting challenge", "Civic innovation lab", "Capstone showcase"]
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

              <div className="rounded-2xl border border-purple-500/30 bg-dark-800 p-6">
                <h3 className="text-xl font-black text-white">Live Delivery Format</h3>
                <p className="text-gray-300 mt-3">
                  One 90-minute masterclass runs every week, with one studio or clinic every two weeks, monthly mentor office hours, and quarterly showcase or challenge events.
                </p>
              </div>
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
