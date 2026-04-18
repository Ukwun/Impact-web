"use client";

import { Heart, Users, Scale, Zap, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function CodeOfConductPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-dark-900 via-teal-900/30 to-dark-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-500/20 border border-teal-400/30 backdrop-blur-sm mb-6">
              <Heart className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-300">Community Values</span>
            </div>

            <h1 className="text-5xl font-black text-white mb-6">Code of Conduct</h1>
            <p className="text-lg text-gray-300">
              Our vision for ImpactKnowledge is an inclusive, respectful community where all members can thrive and contribute to meaningful impact.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Our Commitment */}
            <div className="bg-teal-500/10 border-2 border-teal-500/30 p-8 rounded-xl">
              <h2 className="text-2xl font-black text-white mb-4">Our Commitment to Community</h2>
              <p className="text-gray-300 leading-relaxed">
                ImpactKnowledge is committed to providing a welcoming and inspiring community for all. We expect all members to uphold the values of respect, integrity, and inclusivity in all interactions.
              </p>
            </div>

            {/* Core Values */}
            <div>
              <h2 className="text-3xl font-black text-white mb-8">Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Heart,
                    title: "Respect & Inclusion",
                    desc: "We respect diverse perspectives, experiences, and backgrounds. Discrimination, harassment, or exclusion of any kind is unacceptable."
                  },
                  {
                    icon: Scale,
                    title: "Integrity",
                    desc: "We conduct ourselves honestly and transparently. Fraudulent behavior, plagiarism, or misrepresentation violates our community standards."
                  },
                  {
                    icon: Zap,
                    title: "Collaboration",
                    desc: "We support and uplift one another. Constructive dialogue, constructive feedback, and mutual learning are encouraged."
                  },
                  {
                    icon: Users,
                    title: "Accountability",
                    desc: "We take responsibility for our actions and their impact on others. We address conflicts constructively and respectfully."
                  }
                ].map((value, i) => (
                  <div key={i} className="bg-dark-700 border-2 border-teal-500/20 p-6 rounded-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-teal-500/20 mb-4">
                      <value.icon className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">{value.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{value.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Behavior */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Expected Behavior</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Members of the ImpactKnowledge community are expected to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Treat all community members with respect and dignity</li>
                  <li>Be open to constructive feedback and different viewpoints</li>
                  <li>Use inclusive language and avoid stereotypes</li>
                  <li>Give credit to others for their ideas and work</li>
                  <li>Report inappropriate behavior or violations</li>
                  <li>Focus on learning, growth, and positive impact</li>
                  <li>Follow all applicable laws and regulations</li>
                </ul>
              </div>
            </div>

            {/* Unacceptable Behavior */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Unacceptable Behavior</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  The following behaviors are not tolerated:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Harassment, bullying, or intimidation</li>
                  <li>Discrimination based on identity, background, or beliefs</li>
                  <li>Hate speech, offensive language, or inflammatory comments</li>
                  <li>Sexual or romantic harassment</li>
                  <li>Spam, scams, or fraudulent activity</li>
                  <li>Plagiarism or intellectual property violations</li>
                  <li>Trolling, bad-faith arguments, or disruption</li>
                  <li>Doxxing or sharing private information without consent</li>
                </ul>
              </div>
            </div>

            {/* Reporting Violations */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Reporting Violations</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  If you witness or experience behavior that violates this code of conduct, please report it to our community team. We take all reports seriously and will investigate promptly and confidentially.
                </p>
                <p>
                  Retaliation against anyone who reports a violation is strictly prohibited.
                </p>
              </div>
            </div>

            {/* Enforcement */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Enforcement</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Violations of this code of conduct may result in:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Warning and opportunity to correct behavior</li>
                  <li>Temporary or permanent suspension from community participation</li>
                  <li>Removal of content</li>
                  <li>Account termination in severe cases</li>
                  <li>Referral to appropriate authorities if laws are violated</li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-dark-700 border-2 border-teal-500/20 p-8 rounded-xl">
              <h2 className="text-2xl font-black text-white mb-6">Report a Violation</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href="mailto:conduct@impactclub.com" className="text-teal-400 hover:text-teal-300">
                      conduct@impactclub.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Address</p>
                    <p className="text-gray-300">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-dark-900 border-t border-dark-700">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="text-teal-400 hover:text-teal-300 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
