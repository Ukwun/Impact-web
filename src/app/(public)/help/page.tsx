"use client";

import { HelpCircle, MessageSquare, Search, Mail, Phone, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I create an account on ImpactKnowledge?",
      answer: "Click the 'Sign Up' button on the homepage, fill in your details, verify your email, and you're ready to go. You can choose your profile type (Student, Entrepreneur, Investor) during registration."
    },
    {
      id: 2,
      question: "What programmes are available on ImpactKnowledge?",
      answer: "We offer four main programmes: ImpactSchools (for primary/secondary students), ImpactUni (for university students and entrepreneurs), ImpactHub (our knowledge community), and ImpactCircle (for investors and capital providers)."
    },
    {
      id: 3,
      question: "Is there a cost to join ImpactKnowledge?",
      answer: "Basic access is free for most programmes. Premium features and advanced memberships may have associated costs. Check the membership tiers page for detailed pricing and benefits."
    },
    {
      id: 4,
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to your inbox. If you don't receive the email, check your spam folder or contact support."
    },
    {
      id: 5,
      question: "Can I change my profile information?",
      answer: "Yes! Go to your account settings to update your profile information, contact details, preferences, and programme enrollment at any time."
    },
    {
      id: 6,
      question: "How do I get certified by ImpactKnowledge?",
      answer: "Complete the required courses and assessments in your chosen programme. Upon successful completion, you'll receive a recognized certificate demonstrating your competency."
    }
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: "Email Support",
      value: "support@impactclub.com",
      description: "Response within 24 hours"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      value: "9am - 6pm WAT, Mon-Fri",
      description: "Real-time support"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+234 (800) 000-0000",
      description: "Call during business hours"
    }
  ];

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-green-900/30 to-dark-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-500/20 border border-green-400/30 backdrop-blur-sm">
              <HelpCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold text-green-300">We're Here to Help</span>
            </div>

            <h1 className="text-6xl font-black text-white leading-tight">
              Help & Support Center
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed">
              Find answers to common questions and get in touch with our support team.
            </p>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full px-6 py-4 rounded-lg bg-dark-800 border-2 border-dark-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 pl-12"
              />
              <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-dark-800 border-b border-dark-700">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Getting Started", desc: "First time? Start here" },
              { title: "Account Management", desc: "Settings and preferences" },
              { title: "Programmes", desc: "Learn about our offerings" },
              { title: "Billing & Payments", desc: "Subscription questions" }
            ].map((link, i) => (
              <button key={i} className="p-6 bg-dark-700 border-2 border-dark-600 hover:border-green-500/30 rounded-xl text-left transition-colors hover:bg-dark-600">
                <p className="font-black text-white mb-1">{link.title}</p>
                <p className="text-sm text-gray-400">{link.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-24 bg-dark-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black text-white text-center mb-16">Get In Touch</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {contactOptions.map((option, i) => (
              <div key={i} className="bg-dark-800 border-2 border-dark-700 hover:border-green-500/30 p-8 rounded-xl text-center transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-lg mb-4">
                  <option.icon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">{option.title}</h3>
                {option.value.includes("@") || option.value.includes("+") ? (
                  <a
                    href={option.value.includes("@") ? `mailto:${option.value}` : `tel:${option.value}`}
                    className="text-green-400 hover:text-green-300 font-semibold text-lg mb-2"
                  >
                    {option.value}
                  </a>
                ) : (
                  <p className="text-green-400 font-semibold text-lg mb-2">{option.value}</p>
                )}
                <p className="text-sm text-gray-400">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-white text-center mb-16">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full text-left"
                >
                  <div className="bg-dark-700 border-2 border-dark-600 hover:border-green-500/30 p-6 rounded-xl transition-all">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white pr-4">{faq.question}</h3>
                      <ChevronDown
                        className={`w-5 h-5 text-green-400 flex-shrink-0 transition-transform duration-300 ${
                          expandedFaq === faq.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {expandedFaq === faq.id && (
                      <p className="text-gray-300 mt-4 leading-relaxed">{faq.answer}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="py-24 bg-gradient-to-r from-green-500 to-teal-500">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-black text-white">Didn't Find What You're Looking For?</h2>
            <p className="text-lg text-white text-opacity-90">
              Contact our support team and we'll get back to you as soon as possible.
            </p>

            <button className="px-8 py-4 bg-white text-green-600 font-black rounded-lg hover:bg-gray-100 transition-colors">
              Contact Support Team
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-dark-900 border-t border-dark-700">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="text-green-400 hover:text-green-300 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
