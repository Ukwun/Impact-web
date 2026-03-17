"use client";

import { Button } from "@/components/ui/Button";
import { Star, Users, Clock, ArrowRight } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";

export default function FeaturedCourses() {
  const { courses, loading, error } = useCourses(3);

  const colorClasses: Record<number, string> = {
    0: "from-primary-500 to-primary-600 border-primary-400",
    1: "from-secondary-500 to-secondary-600 border-secondary-400",
    2: "from-green-500 to-green-600 border-green-400",
  };

  if (error) {
    return (
      <section className="relative py-24 lg:py-32 bg-dark-800 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-300">Failed to load courses. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  const displayCourses = loading
    ? [1, 2, 3].map((i) => ({
        id: `skeleton-${i}`,
        title: "Loading...",
        description: "",
        difficulty: "BEGINNER",
        duration: 0,
        instructor: "",
        enrollmentCount: 0,
        lessonCount: 0,
        moduleCount: 0,
        createdAt: new Date().toISOString(),
        isLoading: true,
      }))
    : (courses || []).slice(0, 3).map(course => ({ ...course, isLoading: false }));

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Background */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-100 rounded-full -mr-48 -mb-48 opacity-30"></div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-5xl lg:text-6xl font-black text-text-500">
            Featured Courses
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Dive into our most popular learning paths, designed by industry experts
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayCourses.map((course, idx) => (
            <div
              key={course.id}
              className={`group relative rounded-2xl bg-white border-2 border-gray-100 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                !course.isLoading ? "transform hover:scale-105" : ""
              }`}
            >
              {/* Header gradient */}
              <div
                className={`h-40 bg-gradient-to-br ${
                  colorClasses[idx % 3]
                } relative overflow-hidden`}
              >
                {/* Animated background element */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-white rounded-full mix-blend-overlay group-hover:scale-150 transition-transform duration-300"></div>
                </div>

                <div className="relative z-10 p-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">
                    {course.difficulty}
                  </p>
                  <h3 className={`text-2xl font-black leading-tight ${
                    course.isLoading ? "bg-gray-300 rounded w-3/4 h-6" : ""
                  }`}>
                    {!course.isLoading && course.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Description */}
                <p className={`text-gray-300 text-sm leading-relaxed ${
                    course.isLoading ? "bg-dark-600 rounded h-16" : ""
                }`}>
                  {!course.isLoading && course.description}
                </p>

                {/* Meta info */}
                <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gray-100 text-sm">
                  <div>
                    <p className="text-xs font-bold text-gray-300 uppercase">Lessons</p>
                    <p className={`font-bold text-text-500 ${
                      course.isLoading ? "bg-gray-200 rounded w-1/2 h-5" : ""
                    }`}>
                      {!course.isLoading && course.lessonCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-300" />
                    <div>
                      <p className="text-xs font-bold text-gray-300 uppercase">
                        Enrolled
                      </p>
                      <p className={`font-bold text-text-500 ${
                        course.isLoading ? "bg-gray-200 rounded w-1/2 h-5" : ""
                      }`}>
                        {!course.isLoading && course.enrollmentCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <div>
                      <p className="text-xs font-bold text-gray-300 uppercase">
                        Duration
                      </p>
                      <p className={`font-bold text-text-500 ${
                        course.isLoading ? "bg-gray-200 rounded w-1/2 h-5" : ""
                      }`}>
                        {!course.isLoading && `${Math.ceil(course.duration / 60)}h`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                {!course.isLoading && (
                  <div>
                    <p className="text-xs font-bold text-gray-300 uppercase">
                      Instructor
                    </p>
                    <p className="font-semibold text-text-500">{course.instructor}</p>
                  </div>
                )}

                {/* CTA */}
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center gap-2 group/btn disabled:opacity-50"
                  disabled={course.isLoading}
                >
                  {course.isLoading ? "Loading..." : "Enroll Now"}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="gap-2">
            Explore All Courses
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
