'use client';

import Link from 'next/link';
import { ArrowLeft, Download, BookOpen } from 'lucide-react';

export default function LibraryPage() {
  const resources = [
    { id: 1, title: 'The Art of Impact', type: 'PDF', author: 'Maria Gonzalez', size: '2.5 MB' },
    { id: 2, title: 'Sustainable Living Guide', type: 'Video', author: 'John Smith', duration: '45 min' },
    { id: 3, title: 'Community Organizing Handbook', type: 'PDF', author: 'Dr. Lisa Wong', size: '1.8 MB' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/resources" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Learning Library</h1>
          <p className="text-gray-400">Explore our curated collection of resources</p>
        </div>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-dark-500 border border-dark-400 rounded-2xl p-6 hover:border-primary-500 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{resource.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">by {resource.author}</p>
                  <p className="text-gray-500 text-xs mt-1">{resource.type} • {resource.size || resource.duration}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
