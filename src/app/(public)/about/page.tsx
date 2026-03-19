import { Target, Heart, Lightbulb, Users, Zap, Award } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-24 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-black text-white">
          About ImpactClub
        </h1>
        <p className="text-xl text-gray-300">
          A digital community and growth platform for learning, leadership, and opportunity across Africa
        </p>
      </div>

      {/* Our Story */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/10 border-2 border-primary-400/30 p-12">
        <h2 className="text-3xl font-black text-white mb-4">Our Story</h2>
        <p className="text-lg text-gray-200 leading-relaxed mb-4">
          ImpactClub is the digital platform of the <span className="font-bold text-primary-400">NCDF Impact Club ecosystem</span>, 
          reimagined for the modern age. What started as a vision to democratize opportunity has grown into a thriving movement 
          connecting thousands of learners, leaders, mentors, and changemakers across Africa.
        </p>
        <p className="text-lg text-gray-200 leading-relaxed">
          We believe that everyone deserves access to quality learning, meaningful networks, and real opportunities to create impact. 
          ImpactClub exists to bridge that gap—providing structured pathways for growth, professional communities for connection, 
          and platforms for leadership at every stage of the journey.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Target,
            title: "Our Mission",
            description:
              "Equip members with knowledge, networks, opportunities, and pathways for leadership, entrepreneurship, and lasting impact.",
          },
          {
            icon: Heart,
            title: "Our Values",
            description:
              "Equality, integrity, excellence, community, and impact. We serve members across all backgrounds and stages of life.",
          },
          {
            icon: Lightbulb,
            title: "Our Vision",
            description:
              "A thriving ecosystem where talent is nurtured, networks strengthen, and Africa's transformative potential is fully realized.",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white">
                {item.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Five Core Pillars */}
      <div className="rounded-2xl bg-dark-800/50 border border-gray-700 p-12">
        <h2 className="text-3xl font-black text-white mb-8">Our Five Core Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { icon: Lightbulb, title: "LEARN", desc: "Structured pathways & skill development" },
            { icon: Users, title: "CONNECT", desc: "Community & professional networks" },
            { icon: Award, title: "PARTICIPATE", desc: "Events & programmes" },
            { icon: Zap, title: "GROW", desc: "Mentorship & career development" },
            { icon: Target, title: "LEAD", desc: "Projects & recognition" },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="text-center space-y-3 p-4 rounded-xl hover:bg-dark-700/30 transition">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-black text-white text-lg">{pillar.title}</h4>
                <p className="text-gray-400 text-sm">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Membership Tiers */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 p-12 text-white">
        <h2 className="text-3xl font-black mb-6">Membership for Everyone</h2>
        <p className="text-lg text-primary-100 mb-8">
          We serve members across six distinct tiers, each with tailored benefits and pathways:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            "Student Member",
            "Campus Member", 
            "Young Professional",
            "Mentor / Faculty",
            "Chapter Lead",
            "Institutional Partner",
          ].map((tier, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center font-semibold text-sm">
              {tier}
            </div>
          ))}
        </div>
        <p className="text-primary-100 mt-8">
          <Link href="/membership" className="underline hover:text-white transition">
            Explore membership tiers →
          </Link>
        </p>
      </div>

      {/* By The Numbers */}
      <div className="rounded-2xl bg-dark-800/50 border border-gray-700 p-12">
        <h2 className="text-3xl font-black text-white mb-8">Our Growing Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { stat: "50K+", label: "Active Members" },
            { stat: "6", label: "Membership Tiers" },
            { stat: "150+", label: "Partner Schools" },
            { stat: "5K+", label: "Mentors" },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <p className="text-4xl font-black text-primary-400 mb-2">{item.stat}</p>
              <p className="text-gray-300 font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NCDF Connection */}
      <div className="rounded-2xl bg-gradient-to-br from-dark-700/50 to-dark-800/30 border-2 border-secondary-400/30 p-12">
        <h2 className="text-3xl font-black text-white mb-6">Proudly Part of NCDF</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          ImpactClub is powered by the <span className="font-bold text-secondary-400">National Center for Development and Entrepreneurship (NCDF)</span>, 
          a leading institution driving economic and social development across Africa.
        </p>
        <p className="text-gray-300 leading-relaxed">
          This partnership ensures our programmes are grounded in real-world relevance, industry alignment, and proven impact. Together, 
          we're creating pathways for sustainable development and economic participation across the continent.
        </p>
      </div>

      {/* Get Started */}
      <div className="text-center space-y-6 py-12">
        <h2 className="text-4xl font-black text-white">Ready to Join?</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Choose a membership tier and start your journey toward learning, leadership, and lasting impact.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/membership" className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold hover:shadow-lg transition-all gap-2">
            Explore Membership →
          </Link>
          <Link href="/auth/register" className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-primary-400 text-primary-400 font-bold hover:bg-primary-400/10 transition-all">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
