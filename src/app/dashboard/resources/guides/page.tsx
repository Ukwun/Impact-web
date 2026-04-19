'use client';

import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronRight } from 'lucide-react';

export default function GuidesPage() {
  const guides = [
    {
      id: 1,
      title: 'Getting Started with ImpactEdu',
      description: 'A complete guide to navigating the platform',
      category: 'General',
    },
    {
      id: 2,
      title: 'How to Submit Assignments',
      description: 'Step-by-step instructions for submitting your work',
      category: 'Learning',
    },
    {
      id: 3,
      title: 'Understanding Badges and Certificates',
      description: 'Learn how to earn and track your achievements',
      category: 'Achievements',
    },
    {
      id: 4,
      title: 'Collaborating with Classmates',
      description: 'Tips for effective group work and communication',
      category: 'Community',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/resources" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Help & Guides</h1>
          <p className="text-gray-400">Find answers and get support</p>
        </div>
      </div>

      <div className="space-y-4">
        {guides.map((guide) => (
          <button
            key={guide.id}
            className="w-full text-left bg-dark-500 border border-dark-400 rounded-2xl p-6 hover:border-primary-500 transition-all hover:bg-dark-400"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="text-primary-400" size={20} />
                  <h3 className="text-lg font-bold text-white">{guide.title}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">{guide.description}</p>
                <span className="inline-block px-2 py-1 bg-dark-600 text-gray-300 text-xs rounded font-semibold">
                  {guide.category}
                </span>
              </div>
              <ChevronRight className="text-gray-400 flex-shrink-0" size={24} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
