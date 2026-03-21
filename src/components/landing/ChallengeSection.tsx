"use client";

import {
  GraduationCap,
  Lightbulb,
  TrendingUp,
  Network,
} from "lucide-react";

export default function ChallengeSection() {
  const challenges = [
    {
      icon: GraduationCap,
      color: "blue",
      title: "No Early Financial Foundation",
      description:
        "We are raising children in a complex economy without teaching them the language of value.",
      support:
        "Financial habits, discipline, and value creation are formed too late—when correction is harder than formation.",
    },
    {
      icon: Lightbulb,
      color: "green",
      title: "Talent Is Not Becoming Enterprise",
      description:
        "Nigeria is full of talent, but talent alone does not become enterprise.",
      support:
        "Young people have ideas, but lack structured pathways, mentorship, and execution support to become builders.",
    },
    {
      icon: TrendingUp,
      color: "purple",
      title: "Capital Intelligence Is Missing",
      description:
        "Access to money is not enough when the discipline to manage and multiply it is missing.",
      support:
        "Entrepreneurs struggle not just from lack of funding, but from weak financial systems, strategy, and networks.",
    },
    {
      icon: Network,
      color: "amber",
      title: "The Path to Ownership Is Broken",
      description:
        "Too many people are taught how to earn, but not how to build, belong, and own.",
      support:
        "There are few trusted pathways guiding individuals from effort to investment participation and long-term wealth.",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      { bg: string; border: string; text: string; accent: string }
    > = {
      blue: {
        bg: "from-blue-500/10 to-blue-500/5",
        border: "border-blue-500/30",
        text: "text-blue-400",
        accent: "bg-blue-500/20",
      },
      green: {
        bg: "from-green-500/10 to-green-500/5",
        border: "border-green-500/30",
        text: "text-green-400",
        accent: "bg-green-500/20",
      },
      purple: {
        bg: "from-purple-500/10 to-purple-500/5",
        border: "border-purple-500/30",
        text: "text-purple-400",
        accent: "bg-purple-500/20",
      },
      amber: {
        bg: "from-amber-500/10 to-amber-500/5",
        border: "border-amber-500/30",
        text: "text-amber-400",
        accent: "bg-amber-500/20",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-6 max-w-4xl mx-auto">
          <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
            Four Missing Links in Africa's Economic Journey
          </h2>
          <p className="text-xl lg:text-2xl font-semibold text-gray-300">
            From financial awareness to enterprise to ownership — the pathway is still broken.
          </p>
          <div className="space-y-4 text-base text-gray-400 leading-relaxed">
            <p className="font-semibold">
              Africa has talent, ambition, and energy.
            </p>
            <p>
              What is missing is a structured system that helps people grow from learning to building to 
              ownership.
            </p>
            <p className="text-gray-500">
              These are the four gaps holding back true economic participation.
            </p>
          </div>
        </div>

        {/* Challenge Grid - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {challenges.map((challenge, i) => {
            const IconComponent = challenge.icon;
            const colors = getColorClasses(challenge.color);

            return (
              <div
                key={i}
                className={`group relative rounded-2xl bg-gradient-to-br ${colors.bg} border-2 ${colors.border} hover:border-opacity-100 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-current/10`}
              >
                {/* Icon Container */}
                <div className="mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${colors.accent}`}
                  >
                    <IconComponent
                      className={`w-7 h-7 ${colors.text}`}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-sora text-xl font-bold text-white mb-3">
                  {challenge.title}
                </h3>

                {/* Main Description */}
                <p className="text-gray-300 font-medium mb-4">
                  {challenge.description}
                </p>

                {/* Support Line */}
                <p className="text-sm text-gray-400 leading-relaxed">
                  <span className="text-gray-500 text-xs uppercase tracking-wide block mb-2">
                    Support:
                  </span>
                  {challenge.support}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Transition */}
        <div className="mt-20 p-12 rounded-3xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-2 border-primary-500/30 text-center space-y-6">
          <h3 className="text-3xl lg:text-4xl font-black text-white">
            Impact Club exists to reconnect these four missing links.
          </h3>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Building a clear pathway from early financial formation to enterprise capability 
            and ultimately to economic ownership.
          </p>
        </div>
      </div>
    </section>
  );
}
