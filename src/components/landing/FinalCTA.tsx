"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
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
              <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
                Start Your Journey
              </h2>

              <p className="text-xl lg:text-2xl font-semibold text-white text-opacity-95">
                From Learning to Ownership Begins Here
              </p>

              <p className="text-lg text-white text-opacity-85 leading-relaxed max-w-lg">
                Join thousands building the knowledge, discipline, and confidence to participate meaningfully in Africa's future economy.
              </p>
            </div>

            {/* Free & Risk-Free Badge */}
            <div className="space-y-3 pt-4 border-t border-white border-opacity-30">
              <p className="text-lg font-bold text-white">
                100% Free to Start. No Risk. Full Access.
              </p>
            </div>
          </div>

          {/* Right: CTA Buttons */}
          <div className="space-y-4">
            <Link href="/auth/register" className="block">
              <button className="w-full p-6 rounded-2xl bg-white text-primary-600 font-black text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer">
                Create Account
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>

            <Link href="/auth/login" className="block relative p-6 rounded-2xl bg-white bg-opacity-10 border-2 border-white border-opacity-30 hover:border-opacity-100 transition-all duration-300">
              <button className="w-full text-white font-black text-lg flex items-center justify-center gap-3 group cursor-pointer bg-transparent border-0 p-0">
                Already have an account? Login
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>

            {/* Trust badges */}
            <div className="space-y-3 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center gap-3 text-white text-sm">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                  <span className="text-xs font-black">✓</span>
                </div>
                <span>Trusted platform</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                  <span className="text-xs font-black">✓</span>
                </div>
                <span>Recognized pathways</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm">
                <div className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                  <span className="text-xs font-black">✓</span>
                </div>
                <span>Ongoing support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
