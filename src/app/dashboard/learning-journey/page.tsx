'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Zap } from 'lucide-react';

export default function LearningJourneyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Your Learning Journey</h1>
        <p className="text-gray-400">Track your progress and continue where you left off</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/learning-journey/continue"
          className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 hover:shadow-lg hover:shadow-primary-600/50 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Continue Learning</h2>
              <p className="text-primary-100">Resume your active courses</p>
            </div>
            <Zap className="text-primary-200 group-hover:scale-110 transition-transform" size={32} />
          </div>
        </Link>

        <Link
          href="/dashboard/courses"
          className="bg-gradient-to-br from-secondary-600 to-secondary-700 rounded-2xl p-8 hover:shadow-lg hover:shadow-secondary-600/50 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">My Courses</h2>
              <p className="text-secondary-100">Browse all your enrolled courses</p>
            </div>
            <BookOpen className="text-secondary-200 group-hover:scale-110 transition-transform" size={32} />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/assignments"
          className="bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-6 transition-all"
        >
          <h3 className="text-xl font-bold text-white mb-2">Assignments</h3>
          <p className="text-gray-400 text-sm">View pending assignments</p>
          <span className="inline-block mt-4 text-primary-400 font-semibold text-sm">View all →</span>
        </Link>

        <Link
          href="/dashboard/progress"
          className="bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-6 transition-all"
        >
          <h3 className="text-xl font-bold text-white mb-2">Progress Tracker</h3>
          <p className="text-gray-400 text-sm">Track your learning progress</p>
          <span className="inline-block mt-4 text-primary-400 font-semibold text-sm">View all →</span>
        </Link>

        <Link
          href="/dashboard/projects"
          className="bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-6 transition-all"
        >
          <h3 className="text-xl font-bold text-white mb-2">Projects</h3>
          <p className="text-gray-400 text-sm">Your project submissions</p>
          <span className="inline-block mt-4 text-primary-400 font-semibold text-sm">View all →</span>
        </Link>
      </div>
    </div>
  );
}
