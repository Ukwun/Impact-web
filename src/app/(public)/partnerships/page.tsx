"use client";

import { Briefcase, Globe, TrendingUp, Users, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PartnershipsPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-orange-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-orange-500/20 border border-orange-400/30 backdrop-blur-sm">
              <Globe className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-300">Strategic Partnerships</span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight">
              Partner With ImpactKnowledge
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Join our ecosystem of organizations driving financial literacy, entrepreneurship, and impact investment across Africa. Together, we're transforming how the next generation builds wealth and creates value.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="#partnership-types">
                <Button variant="primary" size="lg" className="gap-3">
                  Explore Opportunities
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:partnerships@impactclub.com?subject=Partnership%20Inquiry">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/5">
                  Get in Touch
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Opportunity */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">Why Partner With ImpactKnowledge?</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ImpactKnowledge is Africa's leading platform for financial literacy and entrepreneurship development. Our ecosystem reaches hundreds of thousands of learners, entrepreneurs, and investors. By partnering with us, your organization gains access to a highly engaged community and amplifies your impact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Users, title: "500K+ Value Propositions", desc: "Active community members across Africa" },
                { icon: TrendingUp, title: "Proven Impact", desc: "Measurable outcomes in financial literacy and entrepreneurship" },
                { icon: Globe, title: "Pan-African Reach", desc: "Operations in 15+ countries across the continent" },
                { icon: CheckCircle, title: "Quality Focus", desc: "Rigorous standards for partner selection and impact" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-orange-500/30 p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/20 mb-4">
                    <item.icon className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section id="partnership-types" className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Partnership Types</h2>
            
            <div className="space-y-8">
              {[
                {
                  type: "Content & Knowledge Partnerships",
                  desc: "Co-create educational content, research, and thought leadership",
                  benefits: ["Branded content series", "Co-hosted events & webinars", "Research collaboration", "Expert positioning"]
                },
                {
                  type: "Integration & Technology Partners",
                  desc: "Integrate your platform or services into ImpactKnowledge ecosystem",
                  benefits: ["API integration", "White-label options", "Co-branded tools", "Data insights sharing"]
                },
                {
                  type: "Capital & Investment Partners",
                  desc: "Provide funding, grants, or investment opportunities",
                  benefits: ["Investor platform access", "Deal flow", "Founder funding", "Impact guarantees"]
                },
                {
                  type: "Distribution & Reach Partners",
                  desc: "Expand our reach through your existing channels",
                  benefits: ["Channel partnerships", "Co-marketing campaigns", "Affiliate programs", "Revenue sharing"]
                },
                {
                  type: "Non-Profit & Social Impact Partners",
                  desc: "Collaborate on missions and shared impact goals",
                  benefits: ["Joint programmes", "Funded initiatives", "Cause marketing", "Community partnerships"]
                },
                {
                  type: "Corporate & B2B Partners",
                  desc: "Employee development and corporate social responsibility",
                  benefits: ["Employee programmes", "CSR initiatives", "Executive development", "Team building"]
                },
              ].map((partnership, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/20 p-8">
                  <h3 className="text-2xl font-black text-orange-400 mb-3">{partnership.type}</h3>
                  <p className="text-gray-300 mb-6">{partnership.desc}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {partnership.benefits.map((benefit, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Our Partners in Action</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  partner: "Leading Financial Institution",
                  partnership: "Capital & Content",
                  result: "50K+ students accessed investment products through co-branded platform"
                },
                {
                  partner: "EdTech Platform",
                  partnership: "Integration & Distribution",
                  result: "10M+ monthly impressions through co-marketing campaign"
                },
                {
                  partner: "NGO Network",
                  partnership: "Social Impact",
                  result: "200K beneficiaries reached through joint community programmes"
                },
                {
                  partner: "Technology Company",
                  partnership: "B2B & Corporate",
                  result: "500 employees upskilled through executive development"
                },
              ].map((case_study, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border border-orange-500/20 p-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{case_study.partner}</h3>
                      <p className="text-sm text-orange-400 font-semibold">{case_study.partnership}</p>
                    </div>
                    <p className="text-gray-300 border-t border-dark-600 pt-4">{case_study.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Partnership Process</h2>
            
            <div className="space-y-6">
              {[
                { step: "1", title: "Initial Conversation", desc: "Share your mission, capabilities, and partnership interests." },
                { step: "2", title: "Opportunity Assessment", desc: "We identify alignment and mutual value creation opportunities." },
                { step: "3", title: "Partnership Design", desc: "Co-create partnership structure, terms, and success metrics." },
                { step: "4", title: "Agreement & Launch", desc: "Execute partnership agreement and begin collaboration." },
                { step: "5", title: "Execution & Support", desc: "Ongoing coordination, reporting, and optimization." },
              ].map((item, i) => (
                <div key={i} className="flex gap-8">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-2xl font-black text-orange-400">{item.step}</span>
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
      <section className="py-24 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-black text-white">Let's Create Impact Together</h2>
            <p className="text-xl text-white text-opacity-90">
              Join a growing network of organizations transforming financial literacy and entrepreneurship across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:partnerships@impactclub.com">
                <Button variant="primary" size="lg" className="gap-3 bg-white text-orange-600 hover:bg-gray-100">
                  Start Conversation
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <Link href="/#partnerships">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                  View Guidelines
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
