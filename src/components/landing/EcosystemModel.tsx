"use client";

import { ArrowRight, Star } from "lucide-react";

export default function EcosystemModel() {
  const stages = [
    {
      name: "ImpactSchools",
      tagline: "Students",
      description: "Financial literacy and enterprise education for primary and secondary students",
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-blue-500/50",
      icon: "🎓",
    },
    {
      name: "ImpactUni",
      tagline: "Builders",
      description: "University-based venture and wealth development programme",
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-500/50",
      icon: "🚀",
    },
    {
      name: "ImpactCircle",
      tagline: "Investors",
      description: "A curated community for entrepreneurs and investors",
      color: "from-amber-500 to-orange-500",
      borderColor: "border-amber-500/50",
      icon: "💼",
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4 max-w-3xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-black text-white">
            OUR SOLUTION
          </h2>
          <h3 className="text-2xl text-primary-400 font-bold">
            An Ecosystem Model
          </h3>
          <p className="text-lg text-gray-300 leading-relaxed">
            A Lifetime Progression Model
          </p>
          <p className="text-body-md text-gray-400">
            Impact Club guides individuals through every stage of economic growth — from early financial literacy to entrepreneurship and ultimately responsible investment participation.
          </p>
        </div>

        {/* Lifecycle Progression */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stages.map((stage, i) => (
            <div key={i} className="relative group">
              {/* Card */}
              <div
                className={`relative rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 ${stage.borderColor} p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 overflow-hidden`}
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stage.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                ></div>

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className="text-5xl">{stage.icon}</div>

                  {/* Name */}
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      {stage.name}
                    </h3>
                    <p className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${stage.color}`}>
                      {stage.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {stage.description}
                  </p>

                  {/* learn more link*/}
                  <div className="pt-4 flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors cursor-pointer group/link">
                    <span className="font-semibold text-sm">Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Arrow to next stage */}
              {i < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-8 top-1/2 -translate-y-1/2 lg:-right-12 z-20">
                  <ArrowRight className="w-8 h-8 text-primary-500/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key message */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-amber-500/20 border-2 border-primary-500/30 text-center">
          <p className="text-lg text-white font-bold leading-relaxed">
            <span className="text-primary-400">From Early Financial Literacy</span> to{" "}
            <span className="text-secondary-400">Entrepreneurship</span> to{" "}
            <span className="text-yellow-400">Investment Participation</span>
          </p>
        </div>
      </div>
    </section>
  );
}
