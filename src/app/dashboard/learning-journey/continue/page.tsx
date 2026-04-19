'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';

export default function ContinueLearningPage() {
  const activeCourses = [
    {
      id: 1,
      title: 'Introduction to Impact',
      progress: 65,
      timeLeft: '3 weeks',
      current: 'Lesson 5: Community Engagement',
    },
    {
      id: 2,
      title: 'Sustainable Development',
      progress: 42,
      timeLeft: '5 weeks',
      current: 'Lesson 3: SDG Basics',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/learning-journey" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Continue Learning</h1>
          <p className="text-gray-400">Jump back into your active courses</p>
        </div>
      </div>

      <div className="space-y-6">
        {activeCourses.map((course) => (
          <div key={course.id} className="bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-8 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">{course.title}</h2>
                <p className="text-primary-400 font-semibold">{course.current}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Time remaining</p>
                <p className="text-white font-bold">{course.timeLeft}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-bold">{course.progress}%</span>
              </div>
              <div className="w-full bg-dark-400 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

            <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors">
              Continue Lesson
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
