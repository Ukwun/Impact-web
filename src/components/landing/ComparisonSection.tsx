"use client";

import { ArrowRight, LayersIcon as Layers, Zap, Users, Target } from "lucide-react";

export default function ComparisonSection() {
  const differentiators = [
    {
      title: "Structured around stages of growth",
      description:
        "We recognize that people are at different points — learning, building, or scaling — and provide relevant pathways for each.",
      icon: Layers,
    },
    {
      title: "Connects learning with application",
      description:
        "Knowledge is built to be practical. Each pathway includes opportunities to apply what you learn in real contexts.",
      icon: Zap,
    },
    {
      title: "Combines knowledge with community",
      description:
        "You grow faster with others. We build focused communities where learning is shared and progress is collective.",
      icon: Users,
    },
    {
      title: "Built for long-term relevance",
      description:
        "Content and pathways evolve with your needs. ImpactKnowledge stays relevant as you progress and opportunities change.",
      icon: Target,
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
            Why ImpactKnowledge
          </span>
          <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
            Designed for real progress, not just information
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            We focus on practical learning, community support, and pathways that lead somewhere meaningful.
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
              Choose Your Starting Point
            </h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Your learning journey begins where you are. We have a pathway for every stage of growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button className="px-8 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-3 rounded-lg border-2 border-primary-500/50 hover:border-primary-500 text-primary-400 hover:text-primary-300 font-bold transition-colors">
                Explore Pathways
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
