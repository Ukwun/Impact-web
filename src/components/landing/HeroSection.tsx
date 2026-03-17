"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, TrendingUp, Users, Award } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[600px]">
          {/* Left: Premium Content */}
          <div className="space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-400/30 backdrop-blur-sm hover:border-primary-400/50 transition-colors w-fit group cursor-pointer">
              <Sparkles className="w-4 h-4 text-primary-400 group-hover:animate-spin" />
              <span className="text-xs font-bold text-primary-300">Africa's Leading Learning Platform</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight">
                Empowering Nigeria's
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300 animate-gradient">
                  Next Generation
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light max-w-2xl">
                Master in-demand skills, connect with industry mentors, and launch your career with Africa's most comprehensive learning and innovation ecosystem.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/register">
                <Button variant="primary" size="lg" className="gap-3 group w-full sm:w-auto shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all">
                  Join Impact Club
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/programmes">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white/30 hover:bg-white/5 hover:border-white/60 w-full sm:w-auto"
                >
                  Explore Programmes
                </Button>
              </Link>
            </div>

            {/* Trust Metrics - Modern Grid */}
            <div className="grid grid-cols-3 gap-8 pt-16 border-t border-dark-600">
              <div className="space-y-2 group">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  <p className="text-3xl font-black text-white group-hover:text-primary-400 transition-colors">50K+</p>
                </div>
                <p className="text-sm text-gray-400 font-medium">Active Learners</p>
              </div>
              <div className="space-y-2 group">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary-400" />
                  <p className="text-3xl font-black text-white group-hover:text-secondary-400 transition-colors">200+</p>
                </div>
                <p className="text-sm text-gray-400 font-medium">Expert Courses</p>
              </div>
              <div className="space-y-2 group">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-300" />
                  <p className="text-3xl font-black text-white group-hover:text-primary-300 transition-colors">95%</p>
                </div>
                <p className="text-sm text-gray-400 font-medium">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Right: Visual Feature Card */}
          <div className="relative hidden lg:flex items-center justify-center h-full">
            <div className="relative w-full h-full max-w-lg">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl blur-2xl"></div>

              {/* Main card */}
              <div className="relative bg-gradient-to-br from-dark-700 to-dark-800 rounded-3xl backdrop-blur-sm border border-dark-600/50 p-8 shadow-2xl transform hover:scale-105 hover:border-primary-400/30 transition-all duration-500 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="space-y-4 mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-400/30 w-fit">
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
                    <span className="text-xs font-bold text-primary-300">Learning Active</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">Your Learning Dashboard</h3>
                </div>

                {/* Feature boxes */}
                <div className="space-y-4 flex-1">
                  {[
                    { icon: "📚", title: "Structured Learning Paths", color: "from-primary-500/20" },
                    { icon: "👨‍🏫", title: "Expert Mentorship", color: "from-secondary-500/20" },
                    { icon: "🚀", title: "Real-world Projects", color: "from-green-500/20" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-r ${item.color} to-transparent border border-dark-600/50 rounded-2xl p-4 hover:border-primary-400/30 transition-colors group cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-125 transition-transform">{item.icon}</span>
                        <div>
                          <p className="font-bold text-white group-hover:text-primary-400 transition-colors">{item.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-8 pt-6 border-t border-dark-600">
                  <p className="text-sm text-gray-400 mb-3">Start learning today</p>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500/30 border border-primary-400/50"></div>
                    <div className="w-8 h-8 rounded-full bg-secondary-500/30 border border-secondary-400/50 -ml-2"></div>
                    <div className="w-8 h-8 rounded-full bg-green-500/30 border border-green-400/50 -ml-2"></div>
                    <span className="text-xs text-gray-400 ml-1 flex items-center">+2.5K this month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
