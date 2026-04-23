'use client';

import { useAuth } from '@/hooks/useAuth';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, BarChart3, TrendingUp, Loader, AlertCircle, Plus, Eye, Trash2, Edit } from 'lucide-react';
import ClassroomFormModal from '@/components/facilitator/ClassroomFormModal';

interface Classroom {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  ageGroup: string;
  subjectStrand: string;
  enrollmentCount?: number;
  completedCount?: number;
  averageProgress?: number;
  modules?: any[];
  isPublished?: boolean;
  createdAt: string;
}

export default function FacilitatorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState({
    totalClassrooms: 0,
    totalStudents: 0,
    avgCompletion: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch facilitator's classrooms
  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      const response = await fetch('/api/facilitator/classroom', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setClassrooms(data.data);

        // Calculate aggregated stats
        const totalStudents = data.data.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0);
        const avgCompletion = data.data.length > 0
          ? Math.round(
              data.data.reduce((sum: number, c: any) => sum + (c.averageProgress || 0), 0) / data.data.length
            )
          : 0;

        setStats({
          totalClassrooms: data.data.length,
          totalStudents,
          avgCompletion,
        });
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchClassrooms();
    }
  }, [user?.id, refreshTrigger]);

  const statConfig = [
    { icon: BookOpen, label: 'Classrooms', value: stats.totalClassrooms.toString(), color: 'blue' },
    { icon: Users, label: 'Students Enrolled', value: stats.totalStudents.toString(), color: 'green' },
    { icon: BarChart3, label: 'Avg Completion', value: `${stats.avgCompletion}%`, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome, {user?.firstName} 👋
          </h1>
          <p className="text-gray-400">
            Create and manage learning classrooms for your students
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statConfig.map((stat, idx) => {
            const Icon = stat.icon;
            const colorMap: Record<string, string> = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
              orange: 'from-orange-500 to-orange-600',
            };

            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${colorMap[stat.color]} rounded-lg p-6 text-white`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">{stat.label}</p>
                    <p className="text-4xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <Icon className="w-12 h-12 opacity-30" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-300">Failed to load classrooms</p>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Classrooms */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                My Classrooms
              </h2>
              <button
                onClick={() => {
                  setEditingClassroom(null);
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Classroom
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-gray-400">Loading your classrooms...</p>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center bg-gray-900/50">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 text-lg mb-6 font-medium">No classrooms yet</p>
                <p className="text-gray-400 mb-8">Start creating your first classroom to engage students with the 4-layer learning model</p>
                <button
                  onClick={() => {
                    setEditingClassroom(null);
                    setShowCreateModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Classroom
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:border-primary-500 transition-all hover:shadow-lg group overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')]" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="px-6 py-6 -mt-8 relative">
                      <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{classroom.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{classroom.description}</p>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Students Enrolled:</span>
                          <span className="text-white font-semibold">{classroom.enrollmentCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Modules:</span>
                          <span className="text-white font-semibold">{classroom.modules?.length || 0}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${classroom.averageProgress || 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{classroom.averageProgress || 0}% completion</p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded font-medium">
                          {classroom.ageGroup} years
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded font-medium">
                          {classroom.difficulty}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/facilitator/classroom/${classroom.id}`)}
                          className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/facilitator/classroom/${classroom.id}?preview=true`)}
                          className="flex-1 px-3 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classroom Form Modal */}
      <ClassroomFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingClassroom(null);
        }}
        editingClassroom={editingClassroom || undefined}
        onSuccess={() => {
          setShowCreateModal(false);
          setEditingClassroom(null);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
