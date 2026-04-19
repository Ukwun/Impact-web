'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProgressPage() {
  const courses = [
    { id: 1, title: 'Introduction to Impact', progress: 65, lessons: 8, completed: 5 },
    { id: 2, title: 'Sustainable Development', progress: 42, lessons: 10, completed: 4 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/learning-journey" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Progress Tracker</h1>
          <p className="text-gray-400">Monitor your learning progress across all courses</p>
        </div>
      </div>

      <div className="space-y-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-dark-500 border border-dark-400 rounded-2xl p-6 hover:border-primary-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{course.title}</h3>
              <span className="text-primary-400 font-bold">{course.progress}%</span>
            </div>
            <div className="w-full bg-dark-400 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm">{course.completed} of {course.lessons} lessons completed</p>
          </div>
        ))}
      </div>
    </div>
  );
}
