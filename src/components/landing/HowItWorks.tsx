"use client";

import { CheckCircle2, BookOpen, Users, Rocket, Award } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      number: 1,
      title: "Register",
      description: "Create your account and join our community",
      icon: <Users className="w-8 h-8" />,
    },
    {
      number: 2,
      title: "Learn",
      description: "Access hundreds of courses and learning materials",
      icon: <BookOpen className="w-8 h-8" />,
    },
    {
      number: 3,
      title: "Engage",
      description: "Connect with mentors and build your network",
      icon: <Users className="w-8 h-8" />,
    },
    {
      number: 4,
      title: "Build Ventures",
      description: "Turn your ideas into real-world projects",
      icon: <Rocket className="w-8 h-8" />,
    },
    {
      number: 5,
      title: "Get Certified",
      description: "Earn recognized credentials and showcase your skills",
      icon: <Award className="w-8 h-8" />,
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-br from-dark-500 to-dark-600 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-black text-white">
            How ImpactEdu Works
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A simple, proven pathway to transform your future
          </p>
        </div>

        {/* Steps Flow - Desktop */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 transform -translate-y-1/2"></div>

            {/* Steps */}
            <div className="grid grid-cols-5 gap-4">
              {steps.map((step, idx) => (
                <div key={step.number} className="relative">
                  {/* Step card */}
                  <div className="group bg-gradient-to-br from-dark-400 to-dark-500 border-2 border-primary-500 border-opacity-50 rounded-2xl p-8 text-center hover:border-opacity-100 hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105">
                    {/* Icon circle */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg border-4 border-dark-600">
                      <span className="font-black text-lg">{step.number}</span>
                    </div>

                    {/* Content */}
                    <div className="pt-8 space-y-3">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-xl bg-primary-500 bg-opacity-20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                          {step.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow (except last) */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-1/4 -right-2 w-4 h-4 rotate-45 border-t-2 border-r-2 border-primary-500 hidden lg:block"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps Flow - Mobile */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex gap-6">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black text-lg shadow-lg border-4 border-dark-600">
                  {step.number}
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-1 h-12 bg-gradient-to-b from-primary-500 to-transparent mt-2"></div>
                )}
              </div>

              {/* Content */}
              <div className="group flex-1 bg-gradient-to-br from-dark-400 to-dark-500 border-2 border-primary-500 border-opacity-50 rounded-2xl p-6 hover:border-opacity-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-500 bg-opacity-20 flex items-center justify-center text-primary-400">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-400 ml-13">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105">
            Start Your Journey Now
          </button>
        </div>
      </div>
    </section>
  );
}
