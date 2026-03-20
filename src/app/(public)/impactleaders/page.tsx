"use client";

import { Crown, Users, Award, BookOpen, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ImpactLeadersPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-purple-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300">Leadership Development Program</span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight">
              ImpactLeaders
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              An intensive leadership and governance programme for emerging executives and board-ready professionals. Master strategic leadership, board governance, and organizational impact.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/join-impact-club?programme=IMPACT_LEADERS">
                <Button variant="primary" size="lg" className="gap-3">
                  Apply Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:leaders@impactclub.com?subject=ImpactLeaders%20Inquiry">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/5">
                  Contact Program
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">Program Overview</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ImpactLeaders is designed for high-performing professionals aspiring to lead organizations and contribute meaningfully to board governance. Through intensive training, mentorship, and real-world application, participants develop the competencies needed for executive and board roles in impact-driven organizations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Target, title: "Executive Leadership", desc: "Strategic thinking, organizational design, and stakeholder management." },
                { icon: Users, title: "Board Governance", desc: "Board dynamics, fiduciary responsibilities, and organizational oversight." },
                { icon: BookOpen, title: "Continuous Development", desc: "Emerging trends, sector deep-dives, and peer learning cohorts." },
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

      {/* Program Tracks */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Program Tracks</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  track: "Executive Track",
                  duration: "12 months",
                  focus: "For mid-level professionals transitioning to executive roles",
                  modules: ["Strategic Leadership", "Organizational Psychology", "Financial Management", "Stakeholder Engagement"]
                },
                {
                  track: "Board Track",
                  duration: "9 months",
                  focus: "For executives preparing for board appointments",
                  modules: ["Board Governance Fundamentals", "Fiduciary Responsibilities", "Board Committee Work", "Risk & Compliance"]
                },
                {
                  track: "Sector Specialist",
                  duration: "6 months",
                  focus: "Deep expertise in education, healthcare, or social impact sectors",
                  modules: ["Sector Economics", "Impact Measurement", "Stakeholder Ecosystems", "Scaling Impact"]
                },
                {
                  track: "Emerging Leaders",
                  duration: "3 months",
                  focus: "For high-potential professionals new to formal leadership",
                  modules: ["Leadership Fundamentals", "Team Dynamics", "Communication", "Decision Making"]
                },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-2 border-purple-500/30 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-black text-purple-400">{item.track}</h3>
                    <span className="text-sm font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">{item.duration}</span>
                  </div>
                  <p className="text-gray-300 mb-6">{item.focus}</p>
                  <ul className="space-y-2">
                    {item.modules.map((mod, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        {mod}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Competencies */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Core Competencies Developed</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Strategic Thinking & Vision Setting",
                "Organizational Leadership",
                "Board-Level Communication",
                "Financial Acumen",
                "Stakeholder Management",
                "Change Leadership",
                "Risk Governance",
                "Impact Measurement & Reporting",
                "Ethical Leadership",
                "Cross-Cultural Leadership",
                "Crisis Management",
                "Succession Planning",
              ].map((comp, i) => (
                <div key={i} className="flex items-center gap-4 p-6 rounded-xl bg-dark-700 border border-purple-500/20">
                  <Award className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  <span className="text-gray-300">{comp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Methodology */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Learning Methodology</h2>
            
            <div className="space-y-6">
              {[
                { method: "Cohort-Based Learning", desc: "Learn with 20-30 high-performing peers, building lasting professional networks." },
                { method: "Executive Mentorship", desc: "1-on-1 guidance from current CEOs, board chairs, and organizational leaders." },
                { method: "Case Study Analysis", desc: "Real-world organizational challenges and strategic solutions from Africa-based enterprises." },
                { method: "Leadership Labs", desc: "Hands-on simulations of board meetings, crisis scenarios, and strategic decisions." },
                { method: "Guest Faculty", desc: "Learn from renowned organizational leaders, governance experts, and thought leaders." },
                { method: "Applied Projects", desc: "Lead actual strategic initiatives contributing to organizational transformation." },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-2xl font-black text-purple-400">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-black text-white mb-2">{item.method}</h3>
                    <p className="text-gray-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Tracking Your Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { stat: "95%", label: "Program completion rate" },
                { stat: "85%", label: "Promoted to senior roles within 12 months" },
                { stat: "70%", label: "Appointed to board positions" },
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

      {/* Admission Requirements */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Admission Requirements</h2>
            
            <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-2 border-purple-500/30 p-12">
              <ul className="space-y-6">
                {[
                  "Minimum 5+ years of professional experience (3+ for Emerging Leaders track)",
                  "Current or aspirational leadership role",
                  "Bachelor's degree or equivalent professional qualification",
                  "Commitment to 3+ months/12 months program depending on track",
                  "Alignment with impact-driven organizational values",
                  "Strong reference from current or former supervisor",
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <Users className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-500 to-indigo-500">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-black text-white">Shape the Future of Impact Leadership</h2>
            <p className="text-xl text-white text-opacity-90">
              Join a cohort of Africa's next generation of executive and board leaders.
            </p>
            <Link href="/join-impact-club?programme=IMPACT_LEADERS">
              <Button variant="primary" size="lg" className="gap-3 bg-white text-purple-600 hover:bg-gray-100">
                Apply to ImpactLeaders
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
