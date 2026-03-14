"use client";

import { CheckCircle, BookOpen, Users, Code, Award, Briefcase } from "lucide-react";

export default function HowItWorksModern() {
  const steps = [
    {
      number: 1,
      title: "Register",
      description: "Create your account and tell us about your goals",
      icon: CheckCircle,
      color: "from-blue-500",
    },
    {
      number: 2,
      title: "Learn",
      description: "Choose from 200+ courses taught by industry experts",
      icon: BookOpen,
      color: "from-primary-500",
    },
    {
      number: 3,
      title: "Engage",
      description: "Connect with mentors, join communities, and network",
      icon: Users,
      color: "from-secondary-500",
    },
    {
      number: 4,
      title: "Build",
      description: "Work on real projects and launch your own ventures",
      icon: Code,
      color: "from-green-500",
    },
    {
      number: 5,
      title: "Grow",
      description: "Access career opportunities and scale your impact",
      icon: Briefcase,
      color: "from-purple-500",
    },
    {
      number: 6,
      title: "Get Certified",
      description: "Earn recognized credentials to boost your career",
      icon: Award,
      color: "from-orange-500",
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
            How the Platform Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            A complete journey from discovery to career success
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLastRow = index >= 3;

              return (
                <div 
                  key={step.number} 
                  className="relative group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Step number circle */}
                  <div className="absolute -top-6 -left-6 z-20">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} to-transparent flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-125 transition-transform duration-300`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-gradient-to-br from-dark-700/50 to-dark-800/30 backdrop-blur-sm rounded-2xl border border-dark-600/30 group-hover:border-dark-500/60 p-8 pt-12 h-full transition-all duration-500 transform group-hover:translate-y-[-8px] group-hover:shadow-xl group-hover:shadow-primary-500/10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} to-transparent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-black text-white mb-3 group-hover:text-primary-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector (hidden on mobile) */}
                  {index < steps.length - 1 && index % 3 !== 2 && (
                    <div className="hidden lg:block absolute -right-6 top-20 text-primary-500/30 group-hover:text-primary-500/50 transition-colors duration-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary-500/10 border border-primary-400/30">
            <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
            <span className="text-sm font-semibold text-primary-300">Start your journey today</span>
          </div>
        </div>
      </div>
    </section>
  );
}
