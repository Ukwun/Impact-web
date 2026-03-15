"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import LogoIntro from "@/components/LogoIntro";
import { CheckCircle, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <LogoIntro />
      <HeroSection />
      <FeaturesSection />

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 border-t border-dark-700">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12 text-center">
              Trusted by Thousands
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6 bg-dark-700/50 rounded-xl border border-dark-600 hover:border-primary-500 transition-all hover:shadow-xl hover:shadow-primary-600/20">
                <div className="w-16 h-16 bg-primary-600/20 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="font-black text-xl text-white">500K+ Users</h3>
                <p className="text-gray-400">
                  Growing community of learners and professionals
                </p>
              </div>
              <div className="text-center space-y-4 p-6 bg-dark-700/50 rounded-xl border border-dark-600 hover:border-secondary-500 transition-all hover:shadow-xl hover:shadow-secondary-600/20">
                <div className="w-16 h-16 bg-secondary-600/20 rounded-xl flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="font-black text-xl text-white">1,200+ Schools</h3>
                <p className="text-gray-400">
                  Educational institutions nationwide
                </p>
              </div>
              <div className="text-center space-y-4 p-6 bg-dark-700/50 rounded-xl border border-dark-600 hover:border-primary-500 transition-all hover:shadow-xl hover:shadow-primary-600/20">
                <div className="w-16 h-16 bg-primary-600/20 rounded-xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="font-black text-xl text-white">100% Secure</h3>
                <p className="text-gray-400">
                  Enterprise-grade security & compliance
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500 opacity-10 rounded-full blur-3xl -mr-36 -mt-36"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-500 opacity-10 rounded-full blur-3xl -ml-36 -mb-36"></div>

        <Container className="relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
              Ready to Transform your Experience?
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Join thousands of impact-driven learners, educators, and professionals building the future today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="primary" size="lg" asChild>
                <Link href="/auth/register">Create Your Account Now</Link>
              </Button>
              <Button variant="light" size="lg" asChild>
                <Link href="/auth/login">Already a Member? Sign In</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
