"use client";

import { Star, Quote } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useState, useEffect } from "react";

export default function Testimonials() {
  const { testimonials, loading, error } = useTestimonials(6);
  const [displayTestimonials, setDisplayTestimonials] = useState<any[]>([]);

  useEffect(() => {
    if (loading) {
      setDisplayTestimonials([
        { id: "skeleton-1", isLoading: true },
        { id: "skeleton-2", isLoading: true },
        { id: "skeleton-3", isLoading: true },
        { id: "skeleton-4", isLoading: true },
        { id: "skeleton-5", isLoading: true },
        { id: "skeleton-6", isLoading: true },
      ]);
    } else {
      setDisplayTestimonials(testimonials);
    }
  }, [testimonials, loading]);

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

  if (error) {
    return (
      <section className="relative py-24 lg:py-32 bg-dark-800 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-300">Failed to load testimonials. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full -ml-48 -mt-48 opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-100 rounded-full -mr-48 -mb-48 opacity-20"></div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-black text-text-500">
            Real Stories, Real Impact
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Hear from students, mentors, and partners transforming their lives
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial) => {
            const category = (testimonial.category || "student").toLowerCase();
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
                    className={`px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${
                      categoryColor
                    } ${testimonial.isLoading ? "bg-gray-300 text-gray-300 w-1/3 h-6" : ""}`}
                  >
                    {!testimonial.isLoading && categoryLabel}
                  </span>
                  <Quote className={`w-5 h-5 text-primary-300 ${testimonial.isLoading ? "opacity-0" : ""}`} />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        testimonial.isLoading
                          ? "bg-gray-300 text-gray-300"
                          : "fill-yellow-400 text-yellow-400"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className={`text-gray-300 leading-relaxed mb-6 italic line-clamp-5 ${
                  testimonial.isLoading ? "bg-dark-600 rounded h-20" : ""
                }`}>
                  {!testimonial.isLoading && `"${testimonial.quote}"`}
                </p>

                {/* Author */}
                <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm ${
                    testimonial.isLoading ? "bg-gray-300" : ""
                  }`}>
                    {!testimonial.isLoading && testimonial.authorName?.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className={`font-black text-text-500 ${
                      testimonial.isLoading ? "bg-dark-600 rounded w-1/2 h-5" : ""
                    }`}>
                      {!testimonial.isLoading && testimonial.authorName}
                    </p>
                    <p className={`text-xs text-gray-300 ${
                      testimonial.isLoading ? "bg-dark-600 rounded w-2/3 h-4 mt-1" : ""
                    }`}>
                      {!testimonial.isLoading && testimonial.authorRole}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105">
            Join Thousands of Success Stories
          </button>
        </div>
      </div>
    </section>
  );
}

