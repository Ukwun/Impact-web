"use client";

import { BookOpen, Users, Award, Zap, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ImpactSchoolsPage() {
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
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300">Financial Literacy for Students</span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight">
              ImpactSchools
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Transforming how primary and secondary students understand money, entrepreneurship, and value creation. A comprehensive financial literacy programme designed for the next generation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/join-impact-club?programme=IMPACT_SCHOOL">
                <Button variant="primary" size="lg" className="gap-3">
                  Enroll a School
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:schools@impactclub.com?subject=ImpactSchools%20Inquiry">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/5">
                  Contact Education Team
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is ImpactSchools */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">What is ImpactSchools?</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ImpactSchools is a structured financial literacy and enterprise education programme for primary and secondary students. We equip young people with practical money management skills, entrepreneurial mindset, and the foundation for lifelong economic participation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BookOpen, title: "Structured Curriculum", desc: "Comprehensive, age-appropriate modules covering financial concepts from elementary to advanced levels." },
                { icon: Users, title: "Leadership Development", desc: "Build confidence, critical thinking, and decision-making skills through interactive learning." },
                { icon: Award, title: "National Certification", desc: "Graduates receive recognized certificates demonstrating financial literacy competency." },
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

      {/* Curriculum Structure */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Programme Structure</h2>
            
            <div className="space-y-6">
              {[
                { phase: "Primary (Grades 1-6)", topics: ["Money basics", "Saving & spending", "Needs vs wants", "Simple entrepreneurship"] },
                { phase: "Junior Secondary (Grades 7-9)", topics: ["Banking systems", "Investment basics", "Business fundamentals", "Financial planning"] },
                { phase: "Senior Secondary (Grades 10-12)", topics: ["Capital markets", "Entrepreneurship planning", "Wealth creation", "Economic participation"] },
              ].map((level, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 p-8">
                  <h3 className="text-2xl font-black text-blue-400 mb-4">{level.phase}</h3>
                  <ul className="grid grid-cols-2 gap-4">
                    {level.topics.map((topic, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-300">
                        <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Benefits */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Student Impact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { stat: "95%", label: "Graduate with Financial Literacy Certificate" },
                { stat: "85%", label: "Demonstrate improved financial decision-making" },
                { stat: "70%", label: "Express interest in entrepreneurship" },
                { stat: "90%", label: "Report increased economic confidence" },
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

      {/* Who Should Participate */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Who Should Participate?</h2>
            
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 p-12">
              <ul className="space-y-6">
                {[
                  "Primary and secondary schools seeking to enhance financial literacy",
                  "Educators looking for comprehensive financial education curriculum",
                  "Schools committed to 21st-century skills development",
                  "Institutions aligned with SDG 4 (Quality Education)",
                  "Educators seeking professional development in financial education",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <Globe className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-300">{item}</span>
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
            <h2 className="text-5xl font-black text-white">Ready to Transform Financial Education?</h2>
            <p className="text-xl text-white text-opacity-90">
              Join thousands of schools empowering students with financial literacy and entrepreneurial skills.
            </p>
            <Link href="/join-impact-club?programme=IMPACT_SCHOOL">
              <Button variant="primary" size="lg" className="gap-3 bg-white text-blue-600 hover:bg-gray-100">
                Enroll Your School Today
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
