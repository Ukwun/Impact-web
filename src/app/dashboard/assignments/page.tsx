'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AssignmentsPage() {
  const assignments = [
    { id: 1, title: 'Write a Community Impact Plan', course: 'Introduction to Impact', dueDate: '2026-04-25', status: 'pending' },
    { id: 2, title: 'SDG Analysis Report', course: 'Sustainable Development', dueDate: '2026-04-20', status: 'submitted' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/learning-journey" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Assignments</h1>
          <p className="text-gray-400">View and submit your assignments</p>
        </div>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-dark-500 border border-dark-400 rounded-2xl p-6 hover:border-primary-500 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{assignment.title}</h3>
                <p className="text-gray-400 text-sm">{assignment.course}</p>
                <p className="text-gray-500 text-sm mt-2">Due: {assignment.dueDate}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${assignment.status === 'pending' ? 'bg-yellow-600 text-yellow-100' : 'bg-green-600 text-green-100'}`}>
                {assignment.status === 'pending' ? 'Pending' : 'Submitted'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
