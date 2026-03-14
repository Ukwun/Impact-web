'use client';

import { useCourses } from '@/hooks/useCourses';
import Link from 'next/link';
import { BookOpen, Clock, Users, Star, Search } from 'lucide-react';
import { useState } from 'react';

export default function CoursesPage() {
  const { courses, loading } = useCourses(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      course.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          My Learning Journey
        </h1>
        <p className="text-gray-400">
          Continue your courses or explore new ones
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-500 border-2 border-dark-400 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 capitalize ${
                selectedDifficulty === level
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-500 text-gray-400 hover:text-white border-2 border-dark-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="space-y-6 col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-dark-500 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/courses/${course.id}`}
              className="bg-gradient-to-b from-dark-500 to-dark-600 rounded-lg overflow-hidden border-2 border-dark-400 hover:border-primary-500 transition-all duration-300 group"
            >
              {/* Course Header */}
              <div className="h-32 bg-gradient-to-br from-primary-500 to-secondary-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-dark-600 rounded-full"></div>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                  {course.difficulty}
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-4 flex flex-col h-full">
                <div>
                  <h3 className="font-black text-lg text-white group-hover:text-primary-400 transition-colors mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {course.description || 'Learn new skills with this comprehensive course'}
                  </p>
                </div>

                {/* Instructor */}
                <div className="text-sm text-gray-400">
                  <p className="font-semibold text-gray-300">{course.instructor}</p>
                </div>

                {/* Stats */}
                <div className="space-y-2 py-4 border-t border-dark-400">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen size={16} />
                    <span>{course.lessonCount} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={16} />
                    <span>{Math.ceil(course.duration / 60)}h hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    <span>{course.enrollmentCount.toLocaleString()} students</span>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full mt-auto px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg font-bold transition-all duration-300">
                  Continue Learning
                </button>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">No courses found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
