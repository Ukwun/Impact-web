"use client";

import { ArrowRight, BookOpen, Route, Zap, Network } from "lucide-react";

export default function ComparisonSection() {
  const differentiators = [
    {
      title: "Early Formation, Not Late Correction",
      description:
        "We start from the foundation years, helping young people build financial habits, leadership confidence, and value-creation mindsets before poor economic behaviours take root.",
      icon: BookOpen,
    },
    {
      title: "One Connected Pathway",
      description:
        "Most platforms stop at one stage. Impact Club creates a clear journey from learning to building to investing, allowing members to grow within one continuous ecosystem.",
      icon: Route,
    },
    {
      title: "Real Participation, Not Theory Alone",
      description:
        "We go beyond knowledge. Impact Club helps members develop practical enterprise capability, financial discipline, and investment readiness so they can participate meaningfully in the economy.",
      icon: Zap,
    },
    {
      title: "Community, Structure, and Opportunity",
      description:
        "We combine curriculum, mentorship, networks, and access pathways in one platform—giving members not just information, but a real environment for growth and progression.",
      icon: Network,
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-dark-800 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-6 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-300 font-semibold text-sm">
            Why ImpactClub Is Different
          </span>
          <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
            More Than a Club. A Complete Economic Growth Ecosystem.
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            ImpactClub combines financial literacy, entrepreneurship, and investment participation 
            into one connected journey. Through ImpactSchool, ImpactUni, and ImpactCircle, we help 
            individuals move from early awareness to enterprise capability and long-term wealth creation.
          </p>
        </div>

        {/* Key Differentiators - 4 Icon Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {differentiators.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div
                key={i}
                className="rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-primary-500/20 p-8 hover:border-primary-500/50 transition-colors hover:shadow-lg hover:shadow-primary-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-500/20 border border-primary-500/40">
                      <IconComponent className="w-6 h-6 text-primary-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-sora text-lg font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-base leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Block */}
        <div className="mt-20 p-12 rounded-3xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-2 border-primary-500/30 hover:border-primary-500/50 transition-colors">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="font-sora text-3xl lg:text-4xl font-bold text-white">
              Start the Journey from Learning to Ownership
            </h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Discover how ImpactSchool, ImpactUni, and ImpactCircle work together to build 
              financially intelligent leaders, entrepreneurs, and future investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button className="px-8 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                Explore Our Ecosystem
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-3 rounded-lg border-2 border-primary-500/50 hover:border-primary-500 text-primary-400 hover:text-primary-300 font-bold transition-colors">
                Join the Movement
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
