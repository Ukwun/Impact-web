"use client";

import { FileText, Mail, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-dark-900 via-secondary-900/30 to-dark-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary-500/20 border border-secondary-400/30 backdrop-blur-sm mb-6">
              <FileText className="w-4 h-4 text-secondary-400" />
              <span className="text-xs font-bold text-secondary-300">Legal Information</span>
            </div>

            <h1 className="text-5xl font-black text-white mb-6">Terms of Service</h1>
            <p className="text-lg text-gray-300">
              These terms govern your use of the ImpactKnowledge platform and services. By accessing our site, you agree to these terms.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Disclaimer */}
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 p-6 rounded-xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white mb-2">Important Notice</p>
                <p className="text-sm text-gray-300">
                  These terms apply to all users accessing ImpactKnowledge. Please read carefully before proceeding. By using our service, you acknowledge that you have read and agree to these terms.
                </p>
              </div>
            </div>

            {/* 1. Acceptance of Terms */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  By accessing and using ImpactKnowledge, you accept and agree to be bound by these terms and conditions. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </div>

            {/* 2. Use License */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">2. Use License</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on ImpactKnowledge for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the site</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials</li>
                  <li>Violate any laws or regulations applicable to your use</li>
                </ul>
              </div>
            </div>

            {/* 3. Disclaimer */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">3. Disclaimer</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  The materials on ImpactKnowledge are provided on an 'as is' basis without warranties of any kind. ImpactKnowledge does not warrant the accuracy, completeness, or usefulness of the materials. Further, it does not warrant that the materials will be error-free or that access to the materials will be uninterrupted.
                </p>
              </div>
            </div>

            {/* 4. Limitations of Liability */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">4. Limitations of Liability</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  In no event shall ImpactKnowledge or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ImpactKnowledge.
                </p>
              </div>
            </div>

            {/* 5. Accuracy of Materials */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">5. Accuracy of Materials</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  The materials appearing on ImpactKnowledge could include technical, typographical, or photographic errors. ImpactKnowledge does not warrant that any of the materials on this site are accurate, complete, or current. ImpactKnowledge may make changes to the materials contained on its site at any time without notice.
                </p>
              </div>
            </div>

            {/* 6. Links */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">6. External Links</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  ImpactKnowledge has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ImpactKnowledge of the site. Use of any such linked website is at the user's own risk.
                </p>
              </div>
            </div>

            {/* 7. Modifications */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">7. Modifications</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  ImpactKnowledge may revise these terms of service for this website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </div>
            </div>

            {/* 8. Governing Law */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">8. Governing Law</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </div>
            </div>

            {/* 9. Contact */}
            <div className="bg-dark-700 border-2 border-secondary-500/20 p-8 rounded-xl">
              <h2 className="text-2xl font-black text-white mb-6">Questions About These Terms?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href="mailto:legal@impactclub.com" className="text-secondary-400 hover:text-secondary-300">
                      legal@impactclub.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-1" />
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
          <Link href="/" className="text-secondary-400 hover:text-secondary-300 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
