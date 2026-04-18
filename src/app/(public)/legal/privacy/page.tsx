"use client";

import { Shield, Mail, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-dark-900 via-primary-900/30 to-dark-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-500/20 border border-primary-400/30 backdrop-blur-sm mb-6">
              <Shield className="w-4 h-4 text-primary-400" />
              <span className="text-xs font-bold text-primary-300">Your Privacy Matters</span>
            </div>

            <h1 className="text-5xl font-black text-white mb-6">Privacy Policy</h1>
            <p className="text-lg text-gray-300">
              ImpactKnowledge is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Last Updated */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: January 2026</span>
            </div>

            {/* 1. Information We Collect */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Account registration information (name, email, phone)</li>
                  <li>Profile data and preferences</li>
                  <li>Payment information (processed securely by third parties)</li>
                  <li>Communication and correspondence</li>
                  <li>Feedback and survey responses</li>
                </ul>
              </div>
            </div>

            {/* 2. How We Use Your Information */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Personalize your experience</li>
                  <li>Analyze usage patterns to improve our platform</li>
                </ul>
              </div>
            </div>

            {/* 3. Data Security */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">3. Data Security</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your account information confidential.
                </p>
              </div>
            </div>

            {/* 4. Cookies & Tracking */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">4. Cookies & Tracking</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  We use cookies to enhance your experience on our platform. These help us remember your preferences, understand usage patterns, and provide personalized content. You can manage cookie preferences in your browser settings.
                </p>
              </div>
            </div>

            {/* 5. Third-Party Services */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">5. Third-Party Services</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business (e.g., payment processors, hosting providers, analytics services). These partners are contractually obligated to maintain the confidentiality of your information.
                </p>
              </div>
            </div>

            {/* 6. Your Rights */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </div>
            </div>

            {/* 7. Contact Us */}
            <div className="bg-dark-700 border-2 border-primary-500/20 p-8 rounded-xl">
              <h2 className="text-2xl font-black text-white mb-6">7. Contact Us</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href="mailto:privacy@impactclub.com" className="text-primary-400 hover:text-primary-300">
                      privacy@impactclub.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
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
          <Link href="/" className="text-primary-400 hover:text-primary-300 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
