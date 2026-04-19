'use client';

import Link from 'next/link';
import { Folder, Clock, CheckCircle } from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: 'Community Impact Plan',
      status: 'in-progress',
      progress: 60,
      course: 'Introduction to Impact',
    },
    {
      id: 2,
      title: 'Sustainability Analysis',
      status: 'completed',
      progress: 100,
      course: 'Sustainable Development',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">My Projects</h1>
        <p className="text-gray-400">Manage your course projects and submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-dark-500 border border-dark-400 rounded-2xl p-6 hover:border-primary-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Folder className="text-primary-400" size={32} />
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.status === 'in-progress' ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'}`}>
                {project.status === 'in-progress' ? 'In Progress' : 'Completed'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{project.course}</p>
            <div className="mb-4">
              <div className="w-full bg-dark-400 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors text-sm">
              View Project
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
