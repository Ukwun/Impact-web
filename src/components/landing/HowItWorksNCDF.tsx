"use client";

import { BookOpen, Hammer, Users, TrendingUp } from "lucide-react";

export default function HowItWorksNCDF() {
  const steps = [
    {
      number: "1",
      title: "Learn",
      description: "Structured financial education.",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      details: [
        "Core financial concepts",
        "Money management skills",
        "Business fundamentals",
      ],
    },
    {
      number: "2",
      title: "Build",
      description: "Entrepreneurial and leadership development.",
      icon: Hammer,
      color: "from-purple-500 to-pink-500",
      details: [
        "Startup labs & incubation",
        "Leadership training",
        "Project execution",
      ],
    },
    {
      number: "3",
      title: "Connect",
      description: "Access networks and opportunities.",
      icon: Users,
      color: "from-amber-500 to-orange-500",
      details: [
        "Professional networks",
        "Mentor access",
        "Community events",
      ],
    },
    {
      number: "4",
      title: "Grow",
      description: "Participate in structured capital ecosystems.",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      details: [
        "Investment opportunities",
        "Capital access",
        "Long-term wealth creation",
      ],
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
          <h2 className="text-5xl lg:text-6xl font-black text-white">
            HOW IT WORKS
          </h2>
          <p className="text-xl text-gray-300">
            How Impact Club Works
          </p>
          <p className="text-body-md text-gray-400">
            Impact Club guides individuals through every stage of economic growth — from early financial literacy to entrepreneurship and ultimately responsible investment participation.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection lines - hidden on mobile */}
          <div className="hidden lg:grid grid-cols-4 gap-8 absolute top-20 left-0 right-0 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="absolute -right-4 top-0 bottom-0 w-8 h-1 bg-gradient-to-r from-primary-500/50 to-transparent transform -translate-y-10"></div>
                )}
              </div>
            ))}
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="group relative">
                  {/* Step Card */}
                  <div
                    className={`relative rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-dark-600 hover:border-primary-500/50 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 h-full overflow-hidden`}
                  >
                    {/* Gradient background on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                    ></div>

                    {/* Step Number Badge */}
                    <div
                      className={`relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white font-black text-lg mb-6 shadow-lg group-hover:shadow-xl transition-all`}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="relative z-10 mb-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="relative z-10 text-2xl font-black text-white mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="relative z-10 text-gray-300 font-semibold text-sm mb-6">
                      {step.description}
                    </p>

                    {/* Details */}
                    <ul className="relative z-10 space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                          <span className="text-gray-300 text-xs">{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Bottom accent */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom message */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-2 border-primary-500/30">
          <p className="text-lg text-white font-bold leading-relaxed max-w-2xl mx-auto">
            From early financial literacy to entrepreneurship and ultimately responsible investment participation.
          </p>
        </div>
      </div>
    </section>
  );
}
