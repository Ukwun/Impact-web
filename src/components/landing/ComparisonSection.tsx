"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export default function ComparisonSection() {
  const comparisons = [
    {
      criteria: "Approach",
      traditional: "Short workshops",
      impactclub: "Integrated structure",
    },
    {
      criteria: "Focus",
      traditional: "Theory-focused",
      impactclub: "Practical ecosystem",
    },
    {
      criteria: "Capital Pathway",
      traditional: "No capital pathway",
      impactclub: "Investment readiness",
    },
    {
      criteria: "Learning Model",
      traditional: "Fragmented learning",
      impactclub: "Integrated structure",
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
        <div className="text-center mb-20 space-y-4 max-w-3xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-black text-white">
            WHY IMPACT CLUB IS DIFFERENT
          </h2>
          <p className="text-xl text-gray-300">
            More Than Education — A Capital Formation Ecosystem
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary-500/30">
                <th className="px-6 py-4 text-left text-white font-black">
                  Criteria
                </th>
                <th className="px-6 py-4 text-center text-gray-300 font-bold">
                  Traditional Programmes
                </th>
                <th className="px-6 py-4 text-center text-primary-400 font-bold">
                  Impact Club
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-dark-600 hover:bg-dark-700/50 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-bold">{item.criteria}</td>
                  <td className="px-6 py-4 text-center text-gray-300">
                    <div className="inline-flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span>{item.traditional}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-primary-300">
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="font-semibold">{item.impactclub}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              title: "Lifetime Value",
              description: "Not just a course, but a lifetime economic partnership from school to investment.",
              icon: "🎯",
            },
            {
              title: "Capital Access",
              description: "Structured pathways to investment opportunities and capital formation.",
              icon: "💰",
            },
            {
              title: "Community",
              description: "Built-in networks, mentorship, and ecosystem of peers at every stage.",
              icon: "🤝",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-primary-500/20 p-8 hover:border-primary-500/50 transition-colors"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-black text-white mb-3">{item.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-2 border-primary-500/30">
          <p className="text-lg text-white font-bold mb-4">
            Three Pathways. One Ecosystem.
          </p>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Impact Club is designed to create lasting economic impact through structured, integrated pathways for education, entrepreneurship, and responsible investment.
          </p>
        </div>
      </div>
    </section>
  );
}
