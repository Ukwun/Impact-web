"use client";

import { Zap, TrendingUp, Users, CheckCircle, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ImpactEdgePage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-blue-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300">Entrepreneur Acceleration Programme</span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight">
              ImpactEdge
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              A 6-month intensive acceleration programme for emerging entrepreneurs and founding teams. Get mentorship, network access, and launch support to scale your impact venture.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/join-impact-club?programme=IMPACT_EDGE">
                <Button variant="primary" size="lg" className="gap-3">
                  Apply Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:edge@impactclub.com?subject=ImpactEdge%20Inquiry">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/5">
                  Get More Info
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Programme Overview */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">What is ImpactEdge?</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ImpactEdge is an intensive, cohort-based acceleration programme designed for emerging entrepreneurs and founding teams with early-stage ventures. Through 6 months of structured training, expert mentorship, and investor networking, founders develop the skills and connections needed to launch successfully and scale their impact business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Intensive Training", desc: "Hands-on curriculum covering product-market fit, fundraising, operations." },
                { icon: Users, title: "Expert Mentorship", desc: "1-on-1 guidance from successful founders, VCs, and seasoned operators." },
                { icon: TrendingUp, title: "Investor Access", desc: "Pitch to investors, secure partnerships, and access capital opportunities." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-blue-500/30 p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/20 mb-6">
                    <item.icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cohort Options */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Programme Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: "Accelerator (6 months)",
                  focus: "Early-stage ventures with clear problem-solution fit",
                  features: ["Weekly cohort sessions", "Personalized mentorship", "Investor demo day", "Network events", "Up to $50K grant opportunity"],
                  investment: "$5,000 total"
                },
                {
                  name: "Founder's Fast Track (3 months)",
                  focus: "Experienced founders pivoting or scaling",
                  features: ["Bi-weekly deep dives", "1-on-1 VCs mentoring", "Pitch coaching", "Capital access", "Investor rollodex"],
                  investment: "$3,000 total"
                },
              ].map((option, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 p-8">
                  <h3 className="text-2xl font-black text-blue-400 mb-2">{option.name}</h3>
                  <p className="text-gray-300 mb-6">{option.focus}</p>
                  <ul className="space-y-3 mb-6">
                    {option.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-lg font-bold text-blue-300">{option.investment}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Curriculum Highlights</h2>
            
            <div className="space-y-6">
              {[
                { title: "Product Development", topics: ["Product-market fit", "MVP building", "User research", "Iteration cycles"] },
                { title: "Business Model", topics: ["Revenue models", "Unit economics", "Pricing strategy", "Sustainability planning"] },
                { title: "Funding & Capital", topics: ["Pitch crafting", "Investor relations", "Term sheets", "Alternative funding"] },
                { title: "Go-to-Market", topics: ["Customer acquisition", "Distribution strategy", "Marketing fundamentals", "Sales execution"] },
                { title: "Leadership & Team", topics: ["Hiring & culture", "Team dynamics", "Leadership skills", "Founder wellness"] },
                { title: "Impact Measurement", topics: ["Impact metrics", "SDG alignment", "Reporting frameworks", "Stakeholder management"] },
              ].map((module, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border border-blue-500/20 p-8">
                  <h3 className="text-xl font-black text-white mb-4">{module.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {module.topics.map((topic, j) => (
                      <div key={j} className="bg-dark-600/50 rounded-lg px-3 py-2 text-sm text-gray-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Programme Outcomes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { stat: "90%", label: "Of alumni raise follow-on funding" },
                { stat: "₦2.5B+", label: "Capital raised by portfolio companies" },
                { stat: "500+", label: "Jobs created by alumni companies" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-blue-500/20 p-8 text-center">
                  <div className="text-5xl font-black text-blue-400 mb-3">{item.stat}</div>
                  <p className="text-gray-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admission Requirements */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Admission Requirements</h2>
            
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 p-12">
              <ul className="space-y-6">
                {[
                  "Early-stage venture with clear problem and solution",
                  "Founding team with complementary skills",
                  "Commitment to 6 months (or 3 months for Fast Track)",
                  "Passion for creating social and/or environmental impact",
                  "Willingness to share equity for mentorship & capital",
                  "Active participation in cohort activities",
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <Award className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-500 to-cyan-500">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-black text-white">Ready to Launch Your Impact Venture?</h2>
            <p className="text-xl text-white text-opacity-90">
              Join a cohort of Africa's boldest entrepreneurs and get the support you need to scale.
            </p>
            <Link href="/join-impact-club?programme=IMPACT_EDGE">
              <Button variant="primary" size="lg" className="gap-3 bg-white text-blue-600 hover:bg-gray-100">
                Apply to ImpactEdge
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
