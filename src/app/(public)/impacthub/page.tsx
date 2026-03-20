"use client";

import { Lightbulb, BookOpen, Users, Zap, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ImpactHubPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-teal-900/30 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-500/20 border border-teal-400/30 backdrop-blur-sm">
              <Globe className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-300">Knowledge & Community Platform</span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight">
              ImpactHub
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              A vibrant digital ecosystem offering knowledge resources, community engagement, and curated learning content. Connect with impact practitioners, access research, and stay informed on emerging trends.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/join-impact-club?programme=IMPACT_HUB">
                <Button variant="primary" size="lg" className="gap-3">
                  Join ImpactHub
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="mailto:hub@impactclub.com?subject=ImpactHub%20Inquiry">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/5">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is ImpactHub */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">What is ImpactHub?</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ImpactHub is our digital knowledge community where educators, entrepreneurs, investors, and impact practitioners connect and collaborate. Members access curated research, participate in webinars, engage with thought leadership, and build professional relationships—all in one accessible platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BookOpen, title: "Knowledge Library", desc: "Research papers, case studies, tools, and frameworks on impact investing and education." },
                { icon: Users, title: "Community Forums", desc: "Engage with peers, share experiences, and collaborate on impact challenges." },
                { icon: Zap, title: "Live Events", desc: "Webinars, workshops, and virtual meetups featuring sector leaders and experts." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-teal-500/30 p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal-500/20 mb-6">
                    <item.icon className="w-7 h-7 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hub Content & Resources */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Hub Content & Resources</h2>
            
            <div className="space-y-8">
              {[
                {
                  category: "Research & Insights",
                  resources: ["Market research reports", "Impact measurement frameworks", "Sector analysis & trends", "Policy briefs"]
                },
                {
                  category: "Learning Modules",
                  resources: ["Self-paced courses", "Webinar recordings", "Expert interviews", "Toolkit libraries"]
                },
                {
                  category: "Community Tools",
                  resources: ["Discussion forums", "Peer mentoring connections", "Collaboration spaces", "Job board"]
                },
                {
                  category: "Events & Networking",
                  resources: ["Monthly webinars", "Quarterly summits", "Regional meetups", "Expert AMAs"]
                },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-2 border-teal-500/20 p-8">
                  <h3 className="text-2xl font-black text-teal-400 mb-6">{item.category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item.resources.map((resource, j) => (
                      <div key={j} className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                        <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0" />
                        <span className="text-gray-300">{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Membership Tiers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  tier: "Community Member",
                  price: "Free",
                  benefits: ["Access to general forums", "Monthly webinars", "Basic resource library", "Community job board"]
                },
                {
                  tier: "Active Contributor",
                  price: "$10/month",
                  benefits: ["All Community benefits", "Premium content library", "Exclusive networking events", "Priority support", "Advanced search & filters"]
                },
                {
                  tier: "Strategic Partner",
                  price: "Custom",
                  benefits: ["Dedicated community channel", "Sponsored events & webinars", "Featured content placement", "Co-branded initiatives", "Enterprise reporting"]
                },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-2 border-teal-500/30 p-8">
                  <h3 className="text-xl font-black text-teal-400 mb-2">{item.tier}</h3>
                  <div className="text-3xl font-black text-white mb-6">{item.price}</div>
                  <ul className="space-y-4">
                    {item.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />
                        <span className="text-sm text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-8 py-3 px-4 rounded-lg bg-teal-500/20 text-teal-300 font-bold hover:bg-teal-500/30 transition-colors">
                    {i === 0 ? "Join Free" : "Get Started"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Featured This Month</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Impact Investing Trends 2024",
                  type: "Research Report",
                  desc: "Comprehensive analysis of capital flows, sector focus, and emerging opportunities in African impact investing."
                },
                {
                  title: "EdTech Masterclass Series",
                  type: "Webinar Series",
                  desc: "Expert-led sessions on scaling education technology across emerging markets with impact measurement."
                },
                {
                  title: "Founder's Toolkit",
                  type: "Resource Library",
                  desc: "Step-by-step guides, templates, and checklists for building and scaling impact-driven enterprises."
                },
                {
                  title: "Board Governance Best Practices",
                  type: "Learning Module",
                  desc: "Master the fundamentals of nonprofit and social enterprise board oversight and strategy."
                },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-teal-500/20 p-8 hover:border-teal-500/50 transition-colors cursor-pointer">
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-bold mb-4">
                    {item.type}
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300 mb-4">{item.desc}</p>
                  <a href="#" className="inline-flex items-center gap-2 text-teal-400 font-bold hover:gap-3 transition-all">
                    Explore <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Community Impact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { stat: "10K+", label: "Active community members" },
                { stat: "500+", label: "Resources & tools available" },
                { stat: "200+", label: "Events hosted annually" },
                { stat: "40+", label: "Countries represented" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-dark-700 border-2 border-teal-500/20 p-8 text-center">
                  <div className="text-5xl font-black text-teal-400 mb-3">{item.stat}</div>
                  <p className="text-gray-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Engage */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12">Ways to Engage</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: BookOpen, title: "Learn", desc: "Access curated content and self-paced courses on impact investing and education." },
                { icon: Users, title: "Connect", desc: "Build relationships with peers, mentors, and leading impact practitioners." },
                { icon: Lightbulb, title: "Share", desc: "Contribute your expertise, lead discussions, and drive thought leadership." },
                { icon: Zap, title: "Collaborate", desc: "Partner on initiatives, co-develop resources, and amplify impact." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-2 border-teal-500/20 p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal-500/20 mb-6">
                    <item.icon className="w-7 h-7 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-teal-500 to-cyan-500">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-black text-white">Join Africa's Premier Impact Community</h2>
            <p className="text-xl text-white text-opacity-90">
              Connect, learn, and collaborate with impact leaders shaping Africa's future.
            </p>
            <Link href="/join-impact-club?programme=IMPACT_HUB">
              <Button variant="primary" size="lg" className="gap-3 bg-white text-teal-600 hover:bg-gray-100">
                Join ImpactHub Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
