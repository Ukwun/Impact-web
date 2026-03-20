"use client";

import { BookOpen, Hammer, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HowItWorksModern() {
  const steps = [
    {
      number: 1,
      title: "Learn",
      tagline: "Master the language of value",
      description: "Financial literacy • Money habits • Business fundamentals",
      icon: BookOpen,
      color: "from-blue-500",
    },
    {
      number: 2,
      title: "Build",
      tagline: "Turn ideas into capability",
      description: "Startup labs • Leadership • Project execution",
      icon: Hammer,
      color: "from-green-500",
    },
    {
      number: 3,
      title: "Connect",
      tagline: "Enter the right rooms",
      description: "Mentorship • Networks • Community access",
      icon: Users,
      color: "from-primary-500",
    },
    {
      number: 4,
      title: "Grow",
      tagline: "Move toward ownership",
      description: "Investment pathways • Capital access • Wealth growth",
      icon: TrendingUp,
      color: "from-amber-500",
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-dark-800 to-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20 space-y-6 max-w-3xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-black text-white">
            How It Works
          </h2>
          <p className="text-2xl lg:text-3xl font-bold text-gray-200">
            Learn. Build. Connect. Grow.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed">
            One ecosystem designed to move you from potential to participation.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative mb-20">
          {/* Connection line - visible on lg and above */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div 
                  key={step.number} 
                  className="relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Step number circle */}
                  <div className="absolute -top-6 -left-6 z-20">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} to-transparent flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-gradient-to-br from-dark-700/50 to-dark-800/30 backdrop-blur-sm rounded-2xl border-2 border-dark-600/50 group-hover:border-dark-500 p-8 pt-16 h-full transition-all duration-500 transform group-hover:translate-y-[-8px] group-hover:shadow-xl group-hover:shadow-primary-500/10">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} to-transparent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-3xl font-black text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-lg font-bold text-gray-200 mb-4">
                      {step.tagline}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Journey Flow */}
        <div className="text-center py-12 border-y border-dark-700 mb-12">
          <p className="text-lg font-bold text-white mb-3">
            Learn → Build → Connect → Grow
          </p>
          <p className="text-gray-300">
            From awareness to ownership.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-200">
              Start where you are. Grow through the ecosystem.
            </p>
          </div>
          <Link href="/programmes" className="inline-block">
            <button className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 group">
              Explore the Ecosystem
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
