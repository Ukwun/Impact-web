"use client";

export default function ChallengeSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 max-w-3xl mx-auto">
          <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-white">
            The Challenge
          </h2>
          <div className="text-lg text-gray-300 space-y-3 leading-relaxed">
            <p className="text-xl font-semibold">
              Knowledge gaps limit opportunity
            </p>
            <p>
              Many people are expected to make important decisions about money, work, and leadership without practical guidance. This gap affects confidence, direction, and long-term outcomes.
            </p>
          </div>
        </div>

        {/* Closing message */}
        <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-2 border-primary-500/30">
          <p className="text-lg text-white font-semibold leading-relaxed">
            ImpactKnowledge exists to make learning more relevant, structured, and actionable.
          </p>
        </div>
      </div>
    </section>
  );
}
