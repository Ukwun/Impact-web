"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BecomePartner() {
  return (
    <section className="relative py-24 lg:py-32 bg-dark-800 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Title */}
          <div className="space-y-4">
            <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
              Become a Partner
            </h2>
            <p className="text-2xl font-semibold text-gray-300">
              Support knowledge. Enable opportunity.
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            We partner with organisations that value practical learning, leadership development, and long-term impact.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a href="mailto:partnerships@impactclub.com?subject=Partnership%20Inquiry%20-%20ImpactKnowledge">
              <Button 
                variant="primary" 
                size="lg" 
                className="gap-3 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
              >
                Partner With Us
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href="mailto:partnerships@impactclub.com?subject=Contact%20Our%20Team%20-%20ImpactKnowledge">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-white border-white/30 hover:bg-white/5"
              >
                Contact Our Team
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
