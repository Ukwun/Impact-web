'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface CurriculumModule {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
  }>;
}

interface CurriculumFramework {
  id: string;
  level: string;
  name: string;
  signatureShift: string;
  primaryOutcome: string;
  minAge: number;
  maxAge: number;
  modules: CurriculumModule[];
  moduleCount?: number;
  totalLessons?: number;
  estimatedDuration?: string;
}

interface CurriculumProgressDashboardProps {
  userId?: string;
  compact?: boolean;
}

/**
 * Display all curriculum levels with progress tracking
 * Shows the 4-layer learning architecture:
 * - PRIMARY (Ages 7-11): Habit Formation
 * - JUNIOR_SECONDARY (Ages 12-14): Practical Application
 * - SENIOR_SECONDARY (Ages 15-18): Enterprise Readiness
 * - IMPACTUNI (Ages 18+): Execution & Capital
 */
export function CurriculumProgressDashboard({
  userId,
  compact = false
}: CurriculumProgressDashboardProps) {
  const [frameworks, setFrameworks] = useState<CurriculumFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/curriculum-framework', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(userId && { 'x-user-id': userId }),
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch curriculum frameworks: ${response.statusText}`);
        }

        const { data } = await response.json();
        setFrameworks(data || []);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Failed to fetch curriculum frameworks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading curriculum levels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-red-900">Error Loading Curriculum</h3>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (frameworks.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No curriculum frameworks available at this time.</p>
      </div>
    );
  }

  const curriculumLevels = [
    { key: 'PRIMARY', label: 'Primary', icon: '🌱' },
    { key: 'JUNIOR_SECONDARY', label: 'Junior Secondary', icon: '📚' },
    { key: 'SENIOR_SECONDARY', label: 'Senior Secondary', icon: '🚀' },
    { key: 'IMPACTUNI', label: 'Impact University', icon: '🎓' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Journey</h2>
        <p className="text-gray-600">Progress through our 4-level curriculum framework</p>
      </div>

      {/* Curriculum Timeline/Progression */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {curriculumLevels.map((level, index) => {
          const framework = frameworks.find(f => f.level === level.key);

          if (!framework) return null;

          return (
            <div
              key={level.key}
              className={`
                relative p-4 rounded-lg border-2 transition-all cursor-pointer
                ${
                  selectedLevel === level.key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-400'
                }
              `}
              onClick={() => setSelectedLevel(selectedLevel === level.key ? null : level.key)}
            >
              {/* Level Indicator */}
              <div className="absolute top-2 right-2 text-2xl">{level.icon}</div>

              {/* Content */}
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{level.label}</h3>
                <p className="text-xs text-gray-500">Ages {framework.minAge}-{framework.maxAge}</p>
              </div>

              {/* Stats */}
              <div className="space-y-1 text-xs mb-3">
                <p className="text-gray-700">
                  <span className="font-semibold">{framework.moduleCount}</span> Modules
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">{framework.totalLessons}</span> Lessons
                </p>
              </div>

              {/* Progress Bar (Example: would be filled based on user progress) */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.random() * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View of Selected Level */}
      {selectedLevel && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 animated-fade-in">
          {frameworks.find(f => f.level === selectedLevel) && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {frameworks.find(f => f.level === selectedLevel)?.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {frameworks.find(f => f.level === selectedLevel)?.signatureShift}
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                  <p className="text-sm font-semibold text-blue-900">Primary Outcome</p>
                  <p className="text-sm text-blue-800 mt-1">
                    {frameworks.find(f => f.level === selectedLevel)?.primaryOutcome}
                  </p>
                </div>
              </div>

              {/* Modules */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">
                  Modules ({frameworks.find(f => f.level === selectedLevel)?.modules.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {frameworks
                    .find(f => f.level === selectedLevel)
                    ?.modules.map(module => (
                      <Link
                        key={module.id}
                        href={`/course/${module.id}`}
                        className="p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-400 transition-colors"
                      >
                        <h5 className="font-semibold text-gray-900 mb-1">{module.title}</h5>
                        <p className="text-xs text-gray-500">
                          {module.lessons.length} lessons
                        </p>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Estimated Duration:</span>{' '}
                  {frameworks.find(f => f.level === selectedLevel)?.estimatedDuration}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compact Mode - Simple List */}
      {compact && (
        <div className="space-y-2">
          {frameworks.map((framework) => (
            <div
              key={framework.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
            >
              <div>
                <h4 className="font-semibold text-gray-900">{framework.name}</h4>
                <p className="text-sm text-gray-600">{framework.moduleCount} modules</p>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Explore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CurriculumProgressDashboard;
