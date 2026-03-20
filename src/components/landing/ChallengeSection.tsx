"use client";

import { AlertCircle, TrendingDown, Users, DollarSign } from "lucide-react";

export default function ChallengeSection() {
  const challenges = [
    {
      icon: BookOpen,
      title: "Millions lack financial education",
      description: "Young people graduate without structured financial literacy",
      stat: "95%",
    },
    {
      icon: TrendingDown,
      title: "SMEs face high failure rates",
      description: "Entrepreneurs struggle without capital discipline",
      stat: "60%",
    },
    {
      icon: DollarSign,
      title: "Limited investment participation",
      description: "Few opportunities to access trusted capital networks",
      stat: "8%",
    },
    {
      icon: Users,
      title: "Capital intelligence gap",
      description: "Missing structured pathways from education to investment",
      stat: "Gap",
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-dark-800 to-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4 max-w-3xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-black text-white">
            THE CHALLENGE
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Why Financial Literacy Matters Now More Than Ever
          </p>
          <p className="text-body-md text-gray-400">
            Nigeria's economic future depends on financially informed citizens. Millions of young people lack structured financial education, while entrepreneurs struggle to access disciplined capital and investors need trusted networks.
          </p>
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((challenge, i) => (
            <div
              key={i}
              className="group relative rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-dark-600 hover:border-primary-500/50 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
            >
              {/* Yellow accent border on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              {/* Icon */}
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
                  <AlertCircle className="w-7 h-7 text-primary-400" />
                </div>
              </div>

              {/* Stat */}
              <div className="mb-4">
                <p className="text-3xl font-black text-primary-400 group-hover:text-primary-300 transition-colors">
                  {challenge.stat}
                </p>
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-white mb-2">
                {challenge.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-300 leading-relaxed">
                {challenge.description}
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Key takeaway */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-2 border-primary-500/50 text-center">
          <p className="text-lg text-white font-bold leading-relaxed max-w-2xl mx-auto">
            NCDF Impact Club was created to bridge this gap — building a structured pathway from education to economic participation.
          </p>
        </div>
      </div>
    </section>
  );
}

// Placeholder for proper icon - using AlertCircle temporarily
const BookOpen = AlertCircle;
