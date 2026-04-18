"use client";

import { CheckCircle, Shield, FileCheck, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-dark-900 via-cyan-900/30 to-dark-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-sm mb-6">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">Standards & Regulations</span>
            </div>

            <h1 className="text-5xl font-black text-white mb-6">Compliance</h1>
            <p className="text-lg text-gray-300">
              ImpactKnowledge adheres to international standards and regulatory requirements to ensure a secure, transparent, and trustworthy platform for all users.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Compliance Overview */}
            <div>
              <h2 className="text-3xl font-black text-white mb-8">Compliance Standards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Data Protection",
                    points: [
                      "GDPR Compliance (EU)",
                      "CCPA Standards (California)",
                      "Nigeria DPA Guidelines",
                      "Data Encryption & Security"
                    ]
                  },
                  {
                    title: "Financial Compliance",
                    points: [
                      "PCI-DSS Level 1",
                      "Payment Processing Standards",
                      "Transaction Monitoring",
                      "Audit Trails"
                    ]
                  },
                  {
                    title: "Security Standards",
                    points: [
                      "ISO/IEC 27001 Alignment",
                      "Regular Security Audits",
                      "Penetration Testing",
                      "Vulnerability Management"
                    ]
                  },
                  {
                    title: "Anti-Fraud Measures",
                    points: [
                      "AML/KYC Procedures",
                      "Identity Verification",
                      "Transaction Monitoring",
                      "Fraud Detection Systems"
                    ]
                  }
                ].map((standard, i) => (
                  <div key={i} className="bg-dark-700 border-2 border-cyan-500/20 p-6 rounded-xl">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-black text-white">{standard.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {standard.points.map((point, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory Framework */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Regulatory Framework</h2>
              <div className="space-y-6">
                <div className="bg-dark-700 border-l-4 border-cyan-500 p-6 rounded-lg">
                  <h3 className="text-xl font-black text-white mb-2">Nigeria Data Protection Regulation (NDPR)</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    ImpactKnowledge operates in compliance with Nigeria's Data Protection Regulation. We respect individual rights to personal data, implement robust security measures, and handle data breaches transparently.
                  </p>
                </div>

                <div className="bg-dark-700 border-l-4 border-cyan-500 p-6 rounded-lg">
                  <h3 className="text-xl font-black text-white mb-2">General Data Protection Regulation (GDPR)</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    For users in the EU, we comply with GDPR requirements including consent management, data subject rights, and lawful processing bases.
                  </p>
                </div>

                <div className="bg-dark-700 border-l-4 border-cyan-500 p-6 rounded-lg">
                  <h3 className="text-xl font-black text-white mb-2">Payment Card Industry Data Security Standard (PCI-DSS)</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    All payment processing complies with PCI-DSS requirements. We work with certified payment processors and maintain secure infrastructure.
                  </p>
                </div>

                <div className="bg-dark-700 border-l-4 border-cyan-500 p-6 rounded-lg">
                  <h3 className="text-xl font-black text-white mb-2">Anti-Money Laundering (AML) & Know Your Customer (KYC)</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    We implement robust AML/KYC procedures to prevent financial crimes, including customer due diligence and transaction monitoring.
                  </p>
                </div>
              </div>
            </div>

            {/* Certifications & Audits */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Certifications & Audits</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  ImpactKnowledge undergoes regular third-party audits and maintains certifications for security and data protection:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Annual Security Audits by Independent Firms</li>
                  <li>Regular Penetration Testing & Vulnerability Assessments</li>
                  <li>PCI-DSS Compliance Validation</li>
                  <li>Data Protection Impact Assessments (DPIA)</li>
                  <li>Incident Response Testing & Drills</li>
                </ul>
              </div>
            </div>

            {/* Data Handling Practices */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Data Handling Practices</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  We employ the following practices to protect your information:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Strict access controls and role-based permissions</li>
                  <li>Data retention policies and secure deletion</li>
                  <li>Regular backups with encryption</li>
                  <li>Employee training on data protection</li>
                  <li>Vendor management and third-party audits</li>
                </ul>
              </div>
            </div>

            {/* Breach Notification */}
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Breach Notification</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  In the unlikely event of a data breach, we will:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Notify affected users without undue delay</li>
                  <li>Provide details about the breach and affected data</li>
                  <li>Recommend protective measures users can take</li>
                  <li>Report to relevant regulatory authorities as required</li>
                  <li>Conduct a thorough incident investigation</li>
                </ul>
              </div>
            </div>

            {/* Compliance Contact */}
            <div className="bg-dark-700 border-2 border-cyan-500/20 p-8 rounded-xl">
              <h2 className="text-2xl font-black text-white mb-6">Compliance Questions?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white mb-2">Compliance Officer</p>
                    <a href="mailto:compliance@impactclub.com" className="text-cyan-400 hover:text-cyan-300">
                      compliance@impactclub.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
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
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
