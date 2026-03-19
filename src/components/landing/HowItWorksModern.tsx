"use client";

import { BookOpen, Users, Calendar, TrendingUp, Zap, Award } from "lucide-react";

export default function HowItWorksModern() {
  const pillars = [
    {
      number: 1,
      title: "LEARN",
      description: "Access structured learning pathways and develop in-demand skills",
      icon: BookOpen,
      color: "from-blue-500",
      details: "Curated courses, mentorship, and certifications"
    },
    {
      number: 2,
      title: "CONNECT",
      description: "Build meaningful networks with peers and industry leaders",
      icon: Users,
      color: "from-primary-500",
      details: "Community chapters, circles, and professional networks"
    },
    {
      number: 3,
      title: "PARTICIPATE",
      description: "Engage in events, programmes, and collaborative opportunities",
      icon: Calendar,
      color: "from-secondary-500",
      details: "Webinars, workshops, conferences, and local events"
    },
    {
      number: 4,
      title: "GROW",
      description: "Accelerate your personal and professional development",
      icon: TrendingUp,
      color: "from-green-500",
      details: "Mentorship, resources, and career guidance"
    },
    {
      number: 5,
      title: "LEAD",
      description: "Create impact through leadership and entrepreneurship",
      icon: Zap,
      color: "from-orange-500",
      details: "Projects, opportunities, and recognition"
    },
  ];


  return (
    <section className="relative py-24 bg-gradient-to-b from-dark-800 to-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl sm:text-6xl font-black text-white">
            Our Five Core Pillars
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            A comprehensive ecosystem built on learning, connection, participation, growth, and leadership
          </p>
        </div>

        {/* Pillars */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <div 
                  key={pillar.number} 
                  className="relative group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Pillar number circle */}
                  <div className="absolute -top-6 -left-6 z-20">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${pillar.color} to-transparent flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-125 transition-transform duration-300`}>
                      {pillar.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-gradient-to-br from-dark-700/50 to-dark-800/30 backdrop-blur-sm rounded-2xl border border-dark-600/30 group-hover:border-dark-500/60 p-6 pt-12 h-full transition-all duration-500 transform group-hover:translate-y-[-8px] group-hover:shadow-xl group-hover:shadow-primary-500/10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} to-transparent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-black text-white mb-3 group-hover:text-primary-400 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed font-light text-sm mb-3">
                      {pillar.description}
                    </p>
                    <p className="text-gray-500 text-xs font-medium">
                      {pillar.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary-500/10 border border-primary-400/30">
            <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
            <span className="text-sm font-semibold text-primary-300">Join our growing community making impact</span>
          </div>
        </div>
      </div>
    </section>
  );
}
