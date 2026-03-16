import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap, Users, TrendingUp } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center bg-gradient-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400 opacity-15 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse-soft"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-400 opacity-10 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse-soft" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-primary-500 opacity-5 rounded-full blur-3xl"></div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          {/* Badge */}
          <div className="inline-block mb-8">
            <span className="px-5 py-2 bg-primary-500 bg-opacity-20 text-primary-100 text-sm font-bold rounded-full border border-primary-400 border-opacity-40 backdrop-blur-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Welcome to ImpactApp
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.1] mb-6">
            Learning.<br />
            <span className="bg-gradient-to-r from-primary-300 to-secondary-400 bg-clip-text text-transparent">
              Building.
            </span>
            <br />
            <span className="text-secondary-400">Leading.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 font-light leading-relaxed">
            The unified digital platform transforming financial literacy, entrepreneurship development, and community participation across Nigeria.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button variant="primary" size="lg" asChild>
              <Link href="/auth/register" className="flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features" className="flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10">
                Explore Platform
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12 border-t border-white/10">
            <div className="text-center sm:text-left space-y-1">
              <p className="text-4xl font-black text-secondary-400 flex items-baseline gap-2 justify-center sm:justify-start">
                500K+ <span className="text-lg text-gray-300">by 2026</span>
              </p>
              <p className="text-gray-400 font-medium">Users Onboarded</p>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <p className="text-4xl font-black text-primary-300 flex items-baseline gap-2 justify-center sm:justify-start">
                1,200+ <span className="text-lg text-gray-300">Connected</span>
              </p>
              <p className="text-gray-400 font-medium">Schools Nationwide</p>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <p className="text-4xl font-black text-secondary-400 flex items-baseline gap-2 justify-center sm:justify-start">
                100+ <span className="text-lg text-gray-300">Active</span>
              </p>
              <p className="text-gray-400 font-medium">Universities Engaged</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
