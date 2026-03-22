"use client";

import { Star, Quote } from "lucide-react";
import Link from "next/link";

export default function Testimonials() {
  // Static testimonials - only 3 quotes as per brand specification
  const displayTestimonials = [
    {
      id: "1",
      quote: "I gained clarity on how to think about money and my future.",
      authorName: "Sarah M",
      category: "student",
      isLoading: false,
    },
    {
      id: "2",
      quote: "It helped me move from ideas to structured action.",
      authorName: "James K",
      category: "student",
      isLoading: false,
    },
    {
      id: "3",
      quote: "I found a community that supports real growth.",
      authorName: "Amara O",
      category: "partner",
      isLoading: false,
    },
  ];

  const categoryColors: Record<string, string> = {
    student: "from-primary-500 to-primary-600",
    mentor: "from-secondary-500 to-secondary-600",
    partner: "from-green-500 to-green-600",
  };

  const categoryLabels: Record<string, string> = {
    student: "Student Success",
    mentor: "Mentor Impact",
    partner: "Partner Story",
  };

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full -ml-48 -mt-48 opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-100 rounded-full -mr-48 -mb-48 opacity-20"></div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="font-sora text-5xl lg:text-6xl font-bold leading-tight text-text-500">
            Real Stories, Real Impact
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Growth that translates into real change
          </p>
        </div>

        {/* Testimonials Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial) => {
            // Type assertion
            const fullTestimonial = testimonial as any;
            const category = (fullTestimonial.category || "student").toLowerCase();
            const categoryColor = categoryColors[category] || categoryColors.student;
            const categoryLabel = categoryLabels[category] || categoryLabels.student;

            return (
              <div
                key={testimonial.id}
                className={`group relative rounded-2xl bg-white border-2 border-gray-100 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 overflow-hidden p-8 ${
                  !testimonial.isLoading ? "" : "animate-pulse"
                }`}
              >
                {/* Background accent */}
                <div
                  className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${categoryColor} opacity-10 rounded-full group-hover:opacity-20 transition-opacity`}
                ></div>

                {/* Category badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${categoryColor}`}
                  >
                    {categoryLabel}
                  </span>
                  <Quote className="w-5 h-5 text-primary-300" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-6 italic line-clamp-5 text-base">
                  {fullTestimonial.quote}
                </p>

                {/* Author */}
                <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                    {fullTestimonial.authorName?.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-text-500">
                      {fullTestimonial.authorName}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link href="/auth/register">
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              Join Thousands of Success Stories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

