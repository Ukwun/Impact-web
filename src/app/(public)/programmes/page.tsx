"use client";

import { Users, TrendingUp, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ProgrammesPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-blue-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            <h1 className="text-6xl font-black text-white leading-tight">
              Our Programmes
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Comprehensive programmes designed to drive impact across education, enterprise development, and capital formation. Choose the programme that matches your goals and join thousands of impact leaders.
            </p>
          </div>
        </div>
      </section>

      {/* All Programmes */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* ImpactEdge */}
              <Link href="/impactedge">
                <div className="group h-full rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 p-8 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-6 group-hover:bg-blue-500/30 transition-colors">
                    <TrendingUp className="w-9 h-9 text-blue-400" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-white mb-3">ImpactEdge</h2>
                  <p className="text-gray-300 mb-6">
                    Entrepreneur acceleration for emerging founders and executive teams. 6-month intensive with mentorship, network access, and launch support.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      Cohort-based training
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      Personalized mentorship
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      Network & investor access
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>

              {/* ImpactCircle */}
              <Link href="/impactcircle">
                <div className="group h-full rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 p-8 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 mb-6 group-hover:bg-amber-500/30 transition-colors">
                    <TrendingUp className="w-9 h-9 text-amber-400" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-white mb-3">ImpactCircle</h2>
                  <p className="text-gray-300 mb-6">
                    Capital formation ecosystem for entrepreneurs and investors. Access curated deal flow, investment forums, and capital intelligence.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      Deal flow access
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      Investment education
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      Capital intelligence
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-amber-400 font-bold group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>

              {/* ImpactLeaders */}
              <Link href="/impactleaders">
                <div className="group h-full rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-2 border-purple-500/30 p-8 hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 mb-6 group-hover:bg-purple-500/30 transition-colors">
                    <Users className="w-9 h-9 text-purple-400" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-white mb-3">ImpactLeaders</h2>
                  <p className="text-gray-300 mb-6">
                    Leadership and governance development for emerging executives. Prepare for board roles and strategic leadership positions.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      Executive training
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      Board governance
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      Strategic mentorship
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-purple-400 font-bold group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>

              {/* ImpactHub */}
              <Link href="/impacthub">
                <div className="group h-full rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-2 border-teal-500/30 p-8 hover:border-teal-400/60 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 cursor-pointer">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/20 mb-6 group-hover:bg-teal-500/30 transition-colors">
                    <Lightbulb className="w-9 h-9 text-teal-400" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-white mb-3">ImpactHub</h2>
                  <p className="text-gray-300 mb-6">
                    Knowledge platform and community hub. Access resources, connect with peers, and stay informed on impact trends.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                      Knowledge library
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                      Community forums
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                      Live events
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-teal-400 font-bold group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programme Comparison */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Choose Your Path</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-blue-500/30">
                    <th className="px-6 py-4 text-white font-black">Programme</th>
                    <th className="px-6 py-4 text-white font-black">Duration</th>
                    <th className="px-6 py-4 text-white font-black">Focus</th>
                    <th className="px-6 py-4 text-white font-black">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "ImpactEdge",
                      duration: "6 months",
                      focus: "Entrepreneur acceleration",
                      best: "Founders & early-stage teams"
                    },
                    {
                      name: "ImpactCircle",
                      duration: "Ongoing",
                      focus: "Capital formation",
                      best: "Entrepreneurs & investors"
                    },
                    {
                      name: "ImpactLeaders",
                      duration: "3-12 months",
                      focus: "Leadership development",
                      best: "Emerging executives & board candidates"
                    },
                    {
                      name: "ImpactHub",
                      duration: "Self-paced",
                      focus: "Knowledge & community",
                      best: "All impact practitioners"
                    },
                  ].map((prog, i) => (
                    <tr key={i} className="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors">
                      <td className="px-6 py-4 text-white font-bold">{prog.name}</td>
                      <td className="px-6 py-4 text-gray-300">{prog.duration}</td>
                      <td className="px-6 py-4 text-gray-300">{prog.focus}</td>
                      <td className="px-6 py-4 text-gray-300">{prog.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Why Impact Club */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Why Impact Club?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Africa-Focused", desc: "All programmes grounded in African context and opportunities." },
                { title: "Proven Track Record", desc: "Thousands of successful entrepreneurs and leaders developed." },
                { title: "Expert Mentorship", desc: "Learn from CEOs, investors, and sector leaders." },
                { title: "Community First", desc: "Join a network of like-minded impact practitioners." },
                { title: "Flexible Learning", desc: "Choose pace and intensity that matches your schedule." },
                { title: "Lifetime Access", desc: "Remain part of Impact Club alumni community forever." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/20 p-8">
                  <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Your Next Steps</h2>
            
            <div className="space-y-6">
              {[
                { step: "1", title: "Explore", desc: "Visit each programme page to understand focus and requirements." },
                { step: "2", title: "Assess", desc: "Determine which programme aligns with your current goals." },
                { step: "3", title: "Apply", desc: "Submit your application through the programme portal." },
                { step: "4", title: "Connect", desc: "Chat with our team to answer questions and guide your journey." },
              ].map((item, i) => (
                <div key={i} className="flex gap-8">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                    <span className="text-2xl font-black text-blue-400">{item.step}</span>
                  </div>
                  <div className="flex-1 pt-3">
                    <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-500 to-indigo-500">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-black text-white">Ready to Create Impact?</h2>
            <p className="text-xl text-white text-opacity-90">
              Choose your programme and join today to transform your career or business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join-impact-club">
                <Button variant="primary" size="lg" className="gap-3 bg-white text-blue-600 hover:bg-gray-100">
                  Apply to a Programme
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:info@impactclub.com">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                  Talk to Our Team
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
