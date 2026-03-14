"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white bg-opacity-20 border border-white border-opacity-30 w-fit">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">
                  Start Your Impact Journey
                </span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                Your Future Starts Here
              </h2>

              <p className="text-xl text-white text-opacity-90 leading-relaxed max-w-lg">
                Join 50,000+ students, entrepreneurs, and leaders transforming Africa one success story at a time. Your journey to impact begins today.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white border-opacity-30">
              <div>
                <p className="text-3xl font-black text-white">100%</p>
                <p className="text-sm text-white text-opacity-80">Access</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">No Risk</p>
                <p className="text-sm text-white text-opacity-80">Money-back</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">100%</p>
                <p className="text-sm text-white text-opacity-80">For Free</p>
              </div>
            </div>
          </div>

          {/* Right: CTA Buttons */}
          <div className="space-y-4">
            <Link href="/signup">
              <button className="w-full p-6 rounded-2xl bg-white text-primary-600 font-black text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group">
                Create Account Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>

            <Link href="/login">
              <div className="relative p-6 rounded-2xl bg-white bg-opacity-10 border-2 border-white border-opacity-30 hover:border-opacity-100 transition-all duration-300">
                <button className="w-full text-white font-black text-lg flex items-center justify-center gap-3 group">
                  Already have an account? Login
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </Link>

            {/* Trust badges */}
            <div className="space-y-3 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center gap-3 text-white text-sm">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                  <span className="text-xs font-black">✓</span>
                </div>
                <span>Secure & Trusted Platform</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                  <span className="text-xs font-black">✓</span>
                </div>
                <span>Industry-Recognized Certificates</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                  <span className="text-xs font-black">✓</span>
                </div>
                <span>24/7 Dedicated Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
