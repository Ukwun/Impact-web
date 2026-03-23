"use client";

import { ArrowRight, BookOpen, Lightbulb, Users } from "lucide-react";
import Link from "next/link";

export default function ProgrammesNCDF() {
  const programmes = [
    {
      id: 1,
      name: "ImpactSchool",
      shortDesc: "For students aged 9–18. A foundation in financial literacy, leadership, and independent thinking.",
      features: [
        "Ages 9–18",
        "Financial literacy foundation",
        "Leadership development",
      ],
      href: "/impactschools",
      ctaText: "Learn More",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-blue-500/30",
    },
    {
      id: 2,
      name: "ImpactUni",
      shortDesc: "For emerging builders. Practical knowledge for enterprise, innovation, and future readiness.",
      features: [
        "Emerging builders",
        "Enterprise skills",
        "Innovation training",
      ],
      href: "/impactuni",
      ctaText: "Explore Pathway",
      icon: Lightbulb,
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-500/30",
    },
    {
      id: 3,
      name: "ImpactCircle",
      shortDesc: "For professionals and investors. A curated network for collaboration, insight, and long-term growth.",
      features: [
        "Professionals & Investors",
        "Curated network",
        "Long-term growth",
      ],
      href: "/impactcircle",
      ctaText: "Join Community",
      icon: Users,
      color: "from-amber-500 to-orange-500",
      borderColor: "border-amber-500/30",
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-dark-800 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4 max-w-3xl mx-auto">
          <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
            Our Ecosystem
          </h2>
          <p className="text-lg text-gray-400">
            Three pathways. One continuous journey.
          </p>
          <p className="text-base text-gray-500">
            ImpactKnowledge supports different stages of growth — from early learning to enterprise and broader opportunity.
          </p>
        </div>

        {/* Programmes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {programmes.map((programme) => {
            const Icon = programme.icon;
            return (
              <div
                key={programme.id}
                className={`group relative rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 ${programme.borderColor} p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 hover:border-primary-500/80 overflow-hidden h-full flex flex-col`}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${programme.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                ></div>

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${programme.color} text-white shadow-lg group-hover:shadow-xl group-hover:shadow-${programme.color.split('-')[1]}-500/50 transition-all`}>
                    <Icon className="w-8 h-8" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="relative z-10 font-sora text-2xl font-bold text-white mb-3">
                  {programme.name}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-gray-300 mb-6 leading-relaxed text-base flex-1">
                  {programme.shortDesc}
                </p>

                {/* Features */}
                <ul className="relative z-10 space-y-2 mb-8">
                  {programme.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={programme.href} className="relative z-10 w-full">
                  <button
                    className={`w-full px-6 py-3 rounded-xl bg-gradient-to-r ${programme.color} text-white font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group/btn`}
                  >
                    {programme.ctaText}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>

                {/* Bottom accent line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${programme.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Progression Line */}
        <div className="text-center">
          <p className="text-lg lg:text-xl text-gray-400 font-semibold">
            <span className="text-blue-400">ImpactSchool</span>
            <span className="mx-4 text-primary-400">→</span>
            <span className="text-purple-400">ImpactUni</span>
            <span className="mx-4 text-primary-400">→</span>
            <span className="text-amber-400">ImpactCircle</span>
          </p>
        </div>
      </div>
    </section>
  );
}
