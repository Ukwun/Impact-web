"use client";

import { useEffect, useState } from "react";

interface CounterProps {
  end: number;
  label: string;
  suffix?: string;
}

function AnimatedCounter({ end, label, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${label}`);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [label]);

  useEffect(() => {
    if (!isVisible) return;

    let current = 0;
    const increment = end / 30;
    const interval = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, end]);

  return (
    <div id={`counter-${label}`} className="text-center space-y-3">
      <div className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
        {count.toLocaleString()}
        {suffix}
      </div>
      <p className="text-lg text-gray-300">{label}</p>
    </div>
  );
}

export default function ImpactNumbers() {
  return (
    <section className="relative py-24 lg:py-32 bg-dark-800 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full -mr-48 -mt-48 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full -ml-48 -mb-48 opacity-50"></div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-black text-text-500">
            Our Impact By The Numbers
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Building Africa's most vibrant learning ecosystem, one impact at a time
          </p>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 hover:border-primary-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <AnimatedCounter end={50000} label="Students Impacted" suffix="+" />
          </div>

          <div className="group p-8 rounded-2xl bg-gradient-to-br from-secondary-50 to-secondary-100 border-2 border-secondary-200 hover:border-secondary-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <AnimatedCounter end={1250} label="Schools Connected" suffix="+" />
          </div>

          <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <AnimatedCounter end={45} label="Top Universities Active" suffix="+" />
          </div>

          <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <AnimatedCounter end={3250} label="Entrepreneurs Supported" suffix="+" />
          </div>
        </div>

        {/* Additional metrics */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-6 p-8 rounded-2xl bg-gradient-to-r from-dark-500 to-dark-600">
          <div className="text-center space-y-2">
            <p className="text-4xl font-black text-primary-400">95%</p>
            <p className="text-gray-300">Completion Rate</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-4xl font-black text-secondary-400">8.5/10</p>
            <p className="text-gray-300">Average Rating</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-4xl font-black text-green-400">24/7</p>
            <p className="text-gray-300">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  );
}
