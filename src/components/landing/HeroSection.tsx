"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, TrendingUp, Users, Award, Loader, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Metrics {
  totalLearners: number;
  totalCourses: number;
  engagementRate: number;
  newMembersThisMonth: number;
}

export default function HeroSection() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/public/metrics");
        if (!response.ok) throw new Error("Failed to fetch metrics");
        const data = await response.json();
        setMetrics(data.data);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        // Fallback to default values if fetch fails
        setMetrics({
          totalLearners: 50000,
          totalCourses: 200,
          engagementRate: 95,
          newMembersThisMonth: 2500,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

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
              <span className="text-xs font-bold text-primary-300">Powered by NCDF & London School of Social Enterprise</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="font-sora text-6xl lg:text-7xl font-bold leading-tight text-white">
                From Knowledge to Opportunity
              </h1>
              <div className="space-y-4 text-lg text-gray-400 leading-relaxed max-w-2xl">
                <p>
                  A structured platform for learning, growth, and real-world progress.
                </p>
                <p className="text-gray-500">
                  For those ready to learn, build, and grow.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/register">
                <Button variant="primary" size="lg" className="gap-3 group w-full sm:w-auto shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/partnerships">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white/30 hover:bg-white/5 hover:border-white/60 w-full sm:w-auto"
                >
                  Explore the Ecosystem
                </Button>
              </Link>
            </div>

            {/* Trust Metrics - Modern Grid */}
            <div className="grid grid-cols-3 gap-8 pt-16 border-t border-dark-600">
              {loading ? (
                <div className="col-span-3 flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 text-primary-500 animate-spin mr-2" />
                  <span className="text-gray-400">Loading metrics...</span>
                </div>
              ) : error ? (
                <div className="col-span-3 flex items-center gap-2 text-danger-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              ) : metrics ? (
                <>
                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary-400" />
                      <p className="text-3xl font-black text-white group-hover:text-primary-400 transition-colors">
                        {metrics.totalLearners.toLocaleString()}+
                      </p>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Learners</p>
                  </div>
                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-secondary-400" />
                      <p className="text-3xl font-black text-white group-hover:text-secondary-400 transition-colors">
                        {metrics.totalCourses}+
                      </p>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Courses</p>
                  </div>
                  <div className="space-y-2 group">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary-300" />
                      <p className="text-3xl font-black text-white group-hover:text-primary-300 transition-colors">
                        {metrics.engagementRate}%
                      </p>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Engagement</p>
                  </div>
                </>
              ) : null}
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
                    { icon: "🚀", title: "Real-World Projects", color: "from-green-500/20" },
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
                    {metrics ? (
                      <span className="text-xs text-gray-400 ml-1 flex items-center">
                        +{metrics.newMembersThisMonth.toLocaleString()} new members this month
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 ml-1 flex items-center">Loading...</span>
                    )}
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
