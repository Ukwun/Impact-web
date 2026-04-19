'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader, AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAssignments } from '@/hooks/useAssignments';

export default function AssignmentsPage() {
  const { assignments, loading, error } = useAssignments();
  const [sortBy, setSortBy] = useState<'due-date' | 'status'>('due-date');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'SUBMITTED':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'OVERDUE':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      default:
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GRADED':
        return <CheckCircle size={16} />;
      case 'SUBMITTED':
        return <CheckCircle size={16} />;
      case 'OVERDUE':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  let sortedAssignments = [...assignments];
  if (sortBy === 'due-date') {
    sortedAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  } else {
    const statusOrder = ['OVERDUE', 'PENDING', 'SUBMITTED', 'GRADED'];
    sortedAssignments.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
  }

  if (error) {
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

        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 flex items-center gap-4">
          <AlertCircle className="text-red-400" size={24} />
          <div>
            <h3 className="text-white font-bold mb-1">Unable to load assignments</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
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

        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-primary-400 mr-3" size={24} />
          <p className="text-gray-400">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/learning-journey" className="text-primary-400 hover:text-primary-300">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Assignments</h1>
          <p className="text-gray-400 mb-4">View and submit your assignments</p>
        </div>
      </div>

      {assignments.length > 0 && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSortBy('due-date')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              sortBy === 'due-date'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-500 text-gray-400 border border-dark-400 hover:border-primary-400'
            }`}
          >
            Sort by Due Date
          </button>
          <button
            onClick={() => setSortBy('status')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              sortBy === 'status'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-500 text-gray-400 border border-dark-400 hover:border-primary-400'
            }`}
          >
            Sort by Status
          </button>
        </div>
      )}

      {sortedAssignments.length > 0 ? (
        <div className="space-y-4">
          {sortedAssignments.map((assignment) => {
            const daysLeft = daysUntilDue(assignment.dueDate);
            const isOverdue = daysLeft < 0;

            return (
              <Link
                key={assignment.id}
                href={`/dashboard/assignments/${assignment.id}`}
                className="block bg-dark-500 border border-dark-400 hover:border-primary-500 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary-600/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 hover:text-primary-400 transition-colors">
                      {assignment.title}
                    </h3>
                    <p className="text-primary-400 text-sm font-semibold mb-2">{assignment.courseName}</p>
                    <p className="text-gray-400 text-sm">{assignment.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-semibold flex items-center gap-2 whitespace-nowrap ml-4 ${getStatusColor(assignment.status)}`}>
                    {getStatusIcon(assignment.status)}
                    {assignment.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-dark-400">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Due Date</p>
                    <p className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                      {formatDate(assignment.dueDate)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Points</p>
                    <p className="text-white font-semibold">{assignment.maxPoints}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Submission</p>
                    {assignment.submission ? (
                      <div>
                        <p className="text-green-400 font-semibold">Submitted</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {assignment.submission.isLate ? '⚠️ Late' : '✓ On time'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-yellow-400 font-semibold">Not submitted</p>
                    )}
                  </div>

                  {assignment.submission?.isGraded ? (
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Grade</p>
                      <p className="text-green-400 font-semibold">{assignment.submission.score}/{assignment.maxPoints}</p>
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-dark-500 border border-dark-400 rounded-2xl p-12 text-center">
          <CheckCircle className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">No assignments</h3>
          <p className="text-gray-400">You don't have any assignments yet</p>
        </div>
      )}
    </div>
  );
}
