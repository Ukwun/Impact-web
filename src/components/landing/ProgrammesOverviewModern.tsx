"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, BookOpen, Users, Network, Zap } from "lucide-react";

export default function ProgrammesOverviewModern() {
  const programmes = [
    {
      id: 1,
      name: "Impact Schools",
      description: "Empower secondary school students with essential 21st century skills",
      icon: BookOpen,
      color: "from-primary-500",
      stats: "50K+ Students",
      href: "/programmes/schools",
    },
    {
      id: 2,
      name: "Impact Uni",
      description: "University students scaling their careers with mentorship and projects",
      icon: Users,
      color: "from-secondary-500",
      stats: "15K+ Active",
      href: "/programmes/uni",
    },
    {
      id: 3,
      name: "Impact Circle",
      description: "Exclusive community for young professionals and entrepreneurs",
      icon: Network,
      color: "from-green-500",
      stats: "8K+ Members",
      href: "/programmes/circle",
    },
    {
      id: 4,
      name: "Impact Events",
      description: "Networking summits, hackathons, and leadership conferences",
      icon: Zap,
      color: "from-blue-500",
      stats: "100+ Events/Year",
      href: "/programmes/events",
    },
  ];

  return (
    <section id="programmes" className="relative py-24 bg-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl sm:text-6xl font-black text-white">
            Our Programmes
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Tailored learning journeys for every stage of your career development
          </p>
        </div>

        {/* Programmes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {programmes.map((programme, index) => {
            const Icon = programme.icon;
            return (
              <Link key={programme.id} href={programme.href}>
                <div 
                  className="group h-full relative cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${programme.color}/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`}
                  ></div>

                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-dark-700/50 to-dark-800/30 backdrop-blur-sm rounded-3xl border border-dark-600/30 group-hover:border-dark-500/60 p-10 h-full transition-all duration-500 flex flex-col transform group-hover:scale-105 group-hover:-translate-y-2">
                    {/* Icon and header */}
                    <div className="flex items-start justify-between mb-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${programme.color} to-transparent flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase bg-dark-700/50 px-3 py-1 rounded-full">
                        {programme.stats}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-3 group-hover:text-primary-400 transition-colors">
                        {programme.name}
                      </h3>
                      <p className="text-gray-400 leading-relaxed font-light mb-8">
                        {programme.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-primary-400 font-bold group-hover:gap-3 transition-all">
                      Learn More
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-12">
          <Link href="/programmes">
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white/30 hover:border-white/60 hover:bg-white/5"
            >
              View All Programmes
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
