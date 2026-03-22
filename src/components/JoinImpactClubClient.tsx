"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function JoinImpactClubClient() {
  const searchParams = useSearchParams();
  const programme = searchParams.get("programme") || "general";
  const [step, setStep] = useState(1);

  const programmes = {
    IMPACT_EDGE: {
      name: "ImpactEdge",
      description: "Entrepreneur Acceleration",
      color: "blue",
      duration: "6 months",
    },
    IMPACT_SCHOOLS: {
      name: "ImpactSchools",
      description: "Financial Literacy for Schools",
      color: "green",
      duration: "Academic year",
    },
    IMPACT_UNI: {
      name: "ImpactUni",
      description: "University Venture Programme",
      color: "purple",
      duration: "Ongoing",
    },
    IMPACT_CIRCLE: {
      name: "ImpactCircle",
      description: "Capital Formation Ecosystem",
      color: "amber",
      duration: "Ongoing",
    },
    IMPACT_LEADERS: {
      name: "ImpactLeaders",
      description: "Leadership Development",
      color: "purple",
      duration: "3-12 months",
    },
    IMPACT_HUB: {
      name: "ImpactHub",
      description: "Knowledge & Community",
      color: "teal",
      duration: "Self-paced",
    },
  };

  const selectedProgramme = programmes[programme as keyof typeof programmes] || {
    name: "ImpactKnowledge",
    description: "Select a Programme",
    color: "blue",
    duration: "Varies",
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: "from-blue-500/10 to-cyan-500/10", border: "border-blue-500/30", text: "text-blue-400" },
      green: { bg: "from-green-500/10 to-emerald-500/10", border: "border-green-500/30", text: "text-green-400" },
      purple: { bg: "from-purple-500/10 to-indigo-500/10", border: "border-purple-500/30", text: "text-purple-400" },
      amber: { bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/30", text: "text-amber-400" },
      teal: { bg: "from-teal-500/10 to-cyan-500/10", border: "border-teal-500/30", text: "text-teal-400" },
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(selectedProgramme.color);

  return (
    <>
      {/* Application Form */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-2xl bg-gradient-to-br ${colorClasses.bg} border-2 ${colorClasses.border} p-12`}>
              {/* Programme Info */}
              {programme !== "general" && (
                <div className="mb-8 pb-8 border-b border-dark-600">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className={`text-3xl font-black text-white mb-2`}>
                        {selectedProgramme.name}
                      </h2>
                      <p className={`text-lg ${colorClasses.text} font-semibold`}>
                        {selectedProgramme.description}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {selectedProgramme.duration}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Steps */}
              <div className="space-y-8">
                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          step >= s
                            ? "bg-blue-500 text-white"
                            : "bg-dark-600 text-gray-400"
                        }`}
                      >
                        {s}
                      </div>
                      {s < 3 && (
                        <div
                          className={`h-1 w-16 ml-2 ${
                            step > s ? "bg-blue-500" : "bg-dark-600"
                          }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white">Personal Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="+234 800 000 0000"
                          className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Background */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white">Background & Experience</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          What brings you to ImpactKnowledge? *
                        </label>
                        <textarea
                          placeholder="Tell us about your goals and what you hope to achieve..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Years of Experience *
                        </label>
                        <select className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 text-white focus:outline-none focus:border-blue-500">
                          <option>Select...</option>
                          <option>0-1 years</option>
                          <option>1-3 years</option>
                          <option>3-5 years</option>
                          <option>5-10 years</option>
                          <option>10+ years</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white">Review & Confirm</h3>
                    <div className="space-y-4 bg-dark-700 rounded-lg p-6 border border-dark-600">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-white">Our team will review your application</p>
                          <p className="text-sm text-gray-400">You'll hear back within 48 hours</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-white">Onboarding call scheduled</p>
                          <p className="text-sm text-gray-400">Join us for a brief orientation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-white">Welcome to the community!</p>
                          <p className="text-sm text-gray-400">Get instant access to resources and community</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        By submitting, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-8">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="flex-1 px-6 py-3 rounded-lg border border-dark-600 text-white font-bold hover:bg-dark-700 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      className="flex-1 px-6 py-3 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      Next <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button className="flex-1 px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                      Submit Application <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Programme Selection Link */}
            {programme === "general" && (
              <div className="mt-12 text-center">
                <p className="text-gray-300 mb-4">Not sure which programme is right for you?</p>
                <Link href="/programmes">
                  <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/5">
                    Explore All Programmes
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-12 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {[
                { q: "How long does the application process take?", a: "Usually 48 hours. We review all applications and contact you within this timeframe." },
                { q: "What if I don't meet all the requirements?", a: "Don't worry! We consider diverse backgrounds and experiences. Apply anyway—we evaluate each person individually." },
                { q: "Are there fees for membership?", a: "Fees vary by programme. Some are free (like ImpactHub), while others have membership fees starting at $3K-$10K." },
                { q: "Can I switch programmes later?", a: "Yes! You can move between programmes as your needs change. Talk to our team about transitions." },
                { q: "Is there a refund policy?", a: "Yes, we offer a 14-day money-back guarantee if you're not satisfied with the programme." },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-2xl bg-dark-800 border border-dark-700 p-6 cursor-pointer hover:border-blue-500/30 transition-colors"
                >
                  <summary className="flex items-center justify-between font-bold text-white">
                    {faq.q}
                    <span className="group-open:rotate-180 transition-transform">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-400">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-12 bg-dark-800 border-t border-dark-700">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-300 mb-4">Have questions? Our team is here to help</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@impactknowledge.com" className="text-blue-400 font-bold hover:text-blue-300">
                Email: hello@impactknowledge.com
              </a>
              <span className="text-gray-600">•</span>
              <a href="tel:+234800000000" className="text-blue-400 font-bold hover:text-blue-300">
                Call: +234 (800) 000-0000
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
