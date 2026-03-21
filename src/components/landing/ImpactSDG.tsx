"use client";

import { Target } from "lucide-react";

export default function ImpactSDG() {
  const sdgs = [
    {
      number: "4",
      title: "Quality Education",
      description: "Providing structured financial and entrepreneurship education",
      color: "from-red-500 to-rose-500",
      icon: "📚",
    },
    {
      number: "5",
      title: "Gender Equality",
      description: "Empowering women in financial literacy and entrepreneurship",
      color: "from-orange-500 to-yellow-500",
      icon: "⚖️",
    },
    {
      number: "8",
      title: "Decent Work & Economic Growth",
      description: "Creating pathways to employment and entrepreneurial success",
      color: "from-green-500 to-emerald-500",
      icon: "💼",
    },
    {
      number: "10",
      title: "Reduced Inequality",
      description: "Building inclusive economic participation and capital access",
      color: "from-purple-500 to-pink-500",
      icon: "🤲",
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4 max-w-3xl mx-auto">
          <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
            IMPACT & SDGs
          </h2>
          <p className="text-lg text-gray-400">
            Driving Sustainable Development
          </p>
          <p className="text-base text-gray-500">
            NCDF Impact Club contributes to the UN Sustainable Development Goals by building financially empowered communities across Nigeria.
          </p>
        </div>

        {/* SDG Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sdgs.map((sdg, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-dark-600 hover:border-primary-500/50 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 overflow-hidden`}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${sdg.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
              ></div>

              {/* SDG Number */}
              <div className={`relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${sdg.color} text-white font-black text-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all`}>
                {sdg.number}
              </div>

              {/* Icon */}
              <div className="relative z-10 text-5xl mb-4">{sdg.icon}</div>

              {/* Title */}
              <h3 className="relative z-10 font-sora text-xl font-bold text-white mb-2">
                SDG {sdg.number}
              </h3>
              <p className="relative z-10 text-primary-400 font-semibold text-base mb-3">
                {sdg.title}
              </p>

              {/* Description */}
              <p className="relative z-10 text-gray-400 text-sm leading-relaxed">
                {sdg.description}
              </p>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${sdg.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
              ></div>
            </div>
          ))}
        </div>

        {/* Key message */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-2 border-primary-500/30">
          <p className="text-lg text-white font-bold leading-relaxed max-w-2xl mx-auto">
            We are building financially empowered communities across Nigeria, creating lasting impact aligned with the SDGs.
          </p>
        </div>
      </div>
    </section>
  );
}
