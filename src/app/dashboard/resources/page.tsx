'use client';

import Link from 'next/link';
import { BookOpen, HelpCircle } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Resources</h1>
        <p className="text-gray-400">Access learning materials and support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/resources/library"
          className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 hover:shadow-lg hover:shadow-primary-600/50 transition-all group"
        >
          <BookOpen className="text-primary-100 group-hover:scale-110 transition-transform mb-4" size={40} />
          <h2 className="text-2xl font-black text-white mb-2">Learning Library</h2>
          <p className="text-primary-100">Access books, articles, and multimedia resources</p>
          <span className="inline-block mt-4 text-primary-200 font-semibold">Browse →</span>
        </Link>

        <Link
          href="/dashboard/resources/guides"
          className="bg-gradient-to-br from-secondary-600 to-secondary-700 rounded-2xl p-8 hover:shadow-lg hover:shadow-secondary-600/50 transition-all group"
        >
          <HelpCircle className="text-secondary-100 group-hover:scale-110 transition-transform mb-4" size={40} />
          <h2 className="text-2xl font-black text-white mb-2">Help & Guides</h2>
          <p className="text-secondary-100">Get help with learning and platform features</p>
          <span className="inline-block mt-4 text-secondary-200 font-semibold">View →</span>
        </Link>
      </div>
    </div>
  );
}
