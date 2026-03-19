"use client";

import { Button } from "@/components/ui/Button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const membershipTiers = [
  {
    id: 1,
    name: "Student Member",
    description: "For learners beginning their journey",
    price: "Free",
    benefits: [
      "Access to structured learning pathways",
      "Foundational courses and certifications",
      "Community network access",
      "Monthly events and webinars",
      "Basic mentorship support",
      "Digital certificates",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    id: 2,
    name: "Campus Member",
    description: "For university students and scholars",
    price: "Special Rate",
    benefits: [
      "All Student benefits",
      "University-specific programmes",
      "Campus Chapter access",
      "Priority event registration",
      "Internship opportunities board",
      "Faculty mentorship network",
      "Peer learning circles",
    ],
    cta: "Join Campus",
    featured: false,
  },
  {
    id: 3,
    name: "Young Professional Member",
    description: "For professionals in early career",
    price: "Premium",
    benefits: [
      "All Student benefits",
      "Professional development courses",
      "Exclusive 'Circle' networking",
      "Job & opportunities board",
      "1-on-1 professional mentorship",
      "Industry workshops & masterclasses",
      "Career advancement resources",
      "Leadership project opportunities",
    ],
    cta: "Upgrade Now",
    featured: true,
  },
  {
    id: 4,
    name: "Mentor / Faculty Member",
    description: "For educators and industry experts",
    price: "Partner",
    benefits: [
      "All member benefits",
      "Course creation platform",
      "Student mentee management",
      "Content monetization",
      "Platform recognition",
      "Teaching resources & support",
      "Professional development credits",
      "Community leadership role",
    ],
    cta: "Apply as Mentor",
    featured: false,
  },
  {
    id: 5,
    name: "Chapter Lead / Ambassador",
    description: "For community organizers and leaders",
    price: "Leadership",
    benefits: [
      "All member benefits",
      "Chapter/Community management tools",
      "Event organization platform",
      "Leadership training & resources",
      "Exclusive stakeholder meetings",
      "Impact reporting dashboard",
      "Community building resources",
      "Revenue sharing opportunities",
    ],
    cta: "Apply for Leadership",
    featured: false,
  },
  {
    id: 6,
    name: "Institutional Partner",
    description: "For schools, universities, and organizations",
    price: "Custom",
    benefits: [
      "Unlimited student access",
      "Institutional branding & customization",
      "Dedicated account management",
      "Curriculum alignment services",
      "Staff training programmes",
      "Analytics & reporting dashboards",
      "Custom integration options",
      "Priority support",
      "Enterprise SLA",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export default function MembershipPage() {
  return (
    <div className="w-full bg-dark-900">
      {/* Hero */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-dark-800 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-6xl font-black text-white">
            Choose Your Membership Path
          </h1>
          <p className="text-xl text-gray-300">
            Join ImpactClub and unlock access to learning, networks, opportunities, and pathways for growth and leadership
          </p>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {membershipTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative group rounded-3xl overflow-hidden transition-all duration-500 ${
                  tier.featured
                    ? "md:col-span-1 lg:col-span-1 ring-2 ring-primary-400 transform lg:scale-105"
                    : ""
                }`}
              >
                {/* Card Background */}
                <div
                  className={`relative h-full rounded-3xl border backdrop-blur-sm p-8 flex flex-col ${
                    tier.featured
                      ? "bg-gradient-to-br from-primary-500/20 to-secondary-500/10 border-primary-400/50"
                      : "bg-gradient-to-br from-dark-700/50 to-dark-800/30 border-dark-600/30 group-hover:border-dark-500/60"
                  }`}
                >
                  {/* Featured Badge */}
                  {tier.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 text-dark-900 text-xs font-black uppercase tracking-wider">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6 pt-4">
                    <h3 className="text-2xl font-black text-white mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
                    <div className="text-3xl font-black text-primary-400">
                      {tier.price}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="flex-1 mb-8">
                    <p className="text-xs uppercase text-gray-500 font-bold mb-4">Benefits include:</p>
                    <ul className="space-y-3">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/auth/register?tier=${tier.id}`}>
                    <Button
                      variant={tier.featured ? "primary" : "outline"}
                      size="lg"
                      className={`w-full gap-2 ${
                        tier.featured
                          ? "shadow-lg shadow-primary-500/30"
                          : "border-gray-600 hover:border-primary-400 text-white"
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-dark-900 to-dark-800">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Find answers about membership and getting started</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Can I change my membership tier?",
                a: "Yes! You can upgrade or downgrade your membership at any time. Changes take effect immediately.",
              },
              {
                q: "Is there a free trial?",
                a: "Student Members get free access to our platform to get started. Premium tiers offer 7-day free trials.",
              },
              {
                q: "Do I get a refund if I cancel?",
                a: "Yes, we offer pro-rated refunds if you cancel within 30 days of upgrade.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept credit/debit cards, bank transfers, and mobile money through our secure payment gateway.",
              },
              {
                q: "Is membership cancellable anytime?",
                a: "Absolutely! You can cancel your membership anytime with no penalties.",
              },
              {
                q: "Do institutional partners get custom pricing?",
                a: "Yes! For organizations with 50+ members, we offer custom enterprise packages.",
              },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <button className="w-full text-left p-4 rounded-xl bg-dark-700/30 hover:bg-dark-600/50 transition-colors border border-dark-600/30 group-hover:border-primary-400/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors">
                      {item.q}
                    </h3>
                    <div className="text-primary-400 group-hover:scale-110 transition-transform text-xl">+</div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-300">
                    {item.a}
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-3xl bg-gradient-to-r from-primary-500 to-secondary-500 p-12 text-center space-y-6">
            <h2 className="text-4xl font-black text-white">Ready to Make an Impact?</h2>
            <p className="text-lg text-primary-100">
              Join thousands of members building skills, networks, and opportunities for lasting change
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/register">
                <Button variant="primary" size="lg" className="gap-2 bg-white text-primary-600 hover:bg-gray-100">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#faq">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
