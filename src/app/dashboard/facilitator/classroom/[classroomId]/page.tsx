'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';
import { Loader, AlertCircle, BookOpen, MoreVertical, Share2, Eye } from 'lucide-react';
import ClassroomFormModal from '@/components/facilitator/ClassroomFormModal';
import ModuleBuilder from '@/components/facilitator/ModuleBuilder';
import LessonEditor from '@/components/facilitator/LessonEditor';
import ActivityCreator from '@/components/facilitator/ActivityCreator';
import LiveClassroomOpsPanel from '@/components/facilitator/LiveClassroomOpsPanel';

interface Classroom {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  ageGroup: string;
  subjectStrand: string;
  estimatedDuration: number;
  createdAt: string;
  isPublished: boolean;
  modules: Module[];
  enrollments: any[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedWeeks: number;
  ageGroup: string;
  subjectStrand: string;
  lessons: Lesson[];
  activities: Activity[];
  lessonCount: number;
  activityCount: number;
}

interface Lesson {
  id: string;
  title: string;
  learningLayer: string;
  duration: number;
  videoUrl?: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  activityType: string;
  dueDate?: string;
  maxPoints: number;
}

type Tab = 'modules' | 'lessons' | 'activities' | 'live';

export default function ClassroomEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const classroomId = params?.classroomId as string;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('modules');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch classroom data
  const fetchClassroom = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      const response = await fetch(`/api/facilitator/classroom/${classroomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load classroom');
      }

      const data = await response.json();
      setClassroom(data.data);

      // Set first module as selected
      if (data.data.modules && data.data.modules.length > 0) {
        setSelectedModule(data.data.modules[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchClassroom();
    }
  }, [classroomId, refreshTrigger]);

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading classroom...</p>
        </div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Classroom</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group lessons by learning layer
  const lessonsByLayer = selectedModule?.lessons
    ? selectedModule.lessons.reduce(
        (acc, lesson) => {
          if (!acc[lesson.learningLayer]) {
            acc[lesson.learningLayer] = [];
          }
          acc[lesson.learningLayer].push(lesson);
          return acc;
        },
        {} as Record<string, Lesson[]>
      )
    : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <button
                onClick={() => router.back()}
                className="text-sm text-gray-600 hover:text-gray-900 transition mb-2"
              >
                ← Back to Classrooms
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{classroom.title}</h1>
              <p className="text-gray-600 mt-1">
                {classroom.subjectStrand} • {classroom.ageGroup} years • {classroom.difficulty}
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-medium">
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-medium">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Edit Details
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Modules</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{classroom.modules.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">Lessons</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {classroom.modules.reduce((sum, m) => sum + (m.lessonCount || 0), 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Activities</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {classroom.modules.reduce((sum, m) => sum + (m.activityCount || 0), 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium">Enrolled</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{classroom.enrollments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Module List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 sticky top-24 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Modules
                </h3>
              </div>

              {classroom.modules.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No modules yet. Create your first one!
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {classroom.modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                        selectedModule?.id === module.id
                          ? 'bg-primary-100 text-primary-900 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">Module {module.order}</div>
                      <div className="text-xs opacity-75 truncate">{module.title}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex border-b border-gray-200">
                {(
                  [
                    { id: 'modules', label: 'Modules', icon: '📚' },
                    { id: 'lessons', label: 'Lessons', icon: '📖' },
                    { id: 'activities', label: 'Activities', icon: '✏️' },
                    { id: 'live', label: 'Live Classroom', icon: '🎙️' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 font-medium flex items-center justify-center gap-2 transition ${
                      activeTab === tab.id
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 border-b-2 border-transparent hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'modules' && (
                  <ModuleBuilder
                    classroomId={classroom.id}
                    modules={classroom.modules}
                    onModuleCreated={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                )}

                {activeTab === 'lessons' && selectedModule ? (
                  <LessonEditor
                    classroomId={classroom.id}
                    moduleId={selectedModule.id}
                    moduleName={selectedModule.title}
                    lessonsByLayer={lessonsByLayer}
                    onLessonCreated={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                ) : activeTab === 'lessons' ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Create a module first to add lessons</p>
                  </div>
                ) : null}

                {activeTab === 'activities' && (
                  <ActivityCreator
                    classroomId={classroom.id}
                    activities={classroom.modules.flatMap((m) => m.activities)}
                    onActivityCreated={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                )}

                {activeTab === 'live' && (
                  <LiveClassroomOpsPanel classroomId={classroom.id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ClassroomFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editingClassroom={classroom}
        onSuccess={(updatedClassroom) => {
          setClassroom(updatedClassroom);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
