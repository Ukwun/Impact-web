"use client";

import { useState } from "react";
import { X, Search, Star, Users, Clock, DollarSign, ChevronRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // weeks
  enrollmentCount: number;
  rating: number; // 0-5
  reviewCount: number;
  price?: number;
  topics: string[];
  prerequisites?: string;
  startDate: string;
}

interface Props {
  isOpen: boolean;
  courses: Course[];
  onClose: () => void;
  onEnrollCourse: (courseId: string) => void;
}

export function CourseDiscoveryModal({ isOpen, courses, onClose, onEnrollCourse }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "newest" | "popular">("rating");

  if (!isOpen) return null;

  // Filter and sort courses
  let filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    const matchesCategory = !selectedCategory || course.category === selectedCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Sort courses
  if (sortBy === "rating") {
    filteredCourses = [...filteredCourses].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "popular") {
    filteredCourses = [...filteredCourses].sort((a, b) => b.enrollmentCount - a.enrollmentCount);
  } else if (sortBy === "newest") {
    filteredCourses = [...filteredCourses].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  const categories = Array.from(new Set(courses.map((c) => c.category)));
  const levels = ["beginner", "intermediate", "advanced"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Explore Courses</h2>
            <p className="text-primary-100 text-sm mt-1">Find programs that match your learning goals</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedCourse ? (
            <div className="flex gap-6 p-6">
              {/* Sidebar Filters */}
              <div className="w-48 space-y-6 flex-shrink-0">
                {/* Search */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Search Courses</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">Level</label>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                          selectedLevel === level
                            ? "bg-primary-100 text-primary-700 border border-primary-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">Category</label>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                          selectedCategory === cat
                            ? "bg-primary-100 text-primary-700 border border-primary-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Courses List */}
              <div className="flex-1">
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No courses found matching your criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCourses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-lg transition group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">by {course.instructor}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition" />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded font-medium">
                            {course.level}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {course.rating.toFixed(1)} ({course.reviewCount})
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.enrollmentCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duration}w
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2">{course.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Course Detail View */
            <div className="p-6">
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm mb-4 flex items-center gap-2"
              >
                ← Back to courses
              </button>

              <div className="space-y-6">
                {/* Course Header */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h3>
                      <p className="text-gray-600">Instructor: {selectedCourse.instructor}</p>
                    </div>
                    <div className="text-right">
                      {selectedCourse.price && (
                        <div className="text-3xl font-bold text-primary-600 flex items-center gap-1">
                          <DollarSign className="w-6 h-6" />
                          {selectedCourse.price}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Level</p>
                    <p className="font-bold text-gray-900">{selectedCourse.level}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <p className="font-bold text-gray-900">{selectedCourse.duration} weeks</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Rating</p>
                    <p className="font-bold text-gray-900">{selectedCourse.rating}/5</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Enrolled</p>
                    <p className="font-bold text-gray-900">{selectedCourse.enrollmentCount}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">About this course</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedCourse.description}</p>
                </div>

                {/* Topics */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Topics Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.topics.map((topic) => (
                      <span key={topic} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prerequisites */}
                {selectedCourse.prerequisites && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Prerequisites</h4>
                    <p className="text-gray-700 text-sm">{selectedCourse.prerequisites}</p>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => {
                    onEnrollCourse(selectedCourse.id);
                    setSelectedCourse(null);
                  }}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Enroll in Course
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
