"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Award, Zap } from "lucide-react";

const Counter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const steps = 60;
    const stepDuration = (duration * 1000) / steps;
    const increment = end / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        return next >= end ? end : next;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{Math.floor(count).toLocaleString()}</span>;
};

export default function ImpactNumbers() {
  const metrics = [
    {
      icon: Users,
      label: "Active Learners",
      value: 50000,
      color: "from-primary-500/20 to-transparent",
      iconColor: "text-primary-400",
      gradient: "from-primary-500/10",
    },
    {
      icon: Zap,
      label: "Expert Courses",
      value: 200,
      color: "from-secondary-500/20 to-transparent",
      iconColor: "text-secondary-400",
      gradient: "from-secondary-500/10",
    },
    {
      icon: Award,
      label: "Success Rate",
      value: 95,
      suffix: "%",
      color: "from-green-500/20 to-transparent",
      iconColor: "text-green-400",
      gradient: "from-green-500/10",
    },
    {
      icon: TrendingUp,
      label: "Schools Connected",
      value: 150,
      color: "from-blue-500/20 to-transparent",
      iconColor: "text-blue-400",
      gradient: "from-blue-500/10",
    },
  ];

  return (
    <section id="impact-numbers" className="relative py-24 bg-gradient-to-b from-dark-900 to-dark-800 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-20 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl sm:text-6xl font-black text-white">
            Our Impact by Numbers
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Building Africa's largest learning and innovation ecosystem
          </p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
                ></div>

                {/* Card */}
                <div className="relative bg-gradient-to-br from-dark-700 to-dark-800 rounded-2xl border border-dark-600/50 p-8 hover:border-dark-600 transition-all duration-500 h-full flex flex-col transform group-hover:scale-105">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${metric.iconColor}`} />
                  </div>

                  {/* Counter */}
                  <div className="mb-2">
                    <p className="text-5xl font-black text-white group-hover:text-primary-400 transition-colors duration-300">
                      <Counter end={metric.value} />
                      {metric.suffix || "+"}
                    </p>
                  </div>

                  {/* Label */}
                  <p className="text-gray-400 font-medium text-sm uppercase tracking-wider">
                    {metric.label}
                  </p>

                  {/* Bottom accent */}
                  <div className="mt-6 pt-6 border-t border-dark-600/30 flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></div>
                    Growing daily
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider line */}
        <div className="mt-20 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent"></div>
          <span className="text-gray-500 text-sm font-medium">Trusted by leading organizations</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
