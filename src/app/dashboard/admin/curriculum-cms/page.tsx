'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type CmsData = {
  programmes: Array<{ id: string; code: string; title: string; description?: string }>;
  levels: Array<{
    id: string;
    level: string;
    name: string;
    minAge: number;
    maxAge: number;
    signatureShift: string;
    primaryOutcome: string;
  }>;
  terms: Array<{
    id: string;
    level: string;
    term: string;
    title: string;
    focus: string;
    illustrativeTopics: string[];
  }>;
  modules: Array<{
    id: string;
    frameworkId: string;
    frameworkLevel: string;
    title: string;
    description?: string;
    order: number;
    subjectStrand: string;
  }>;
  lessons: Array<{
    id: string;
    title: string;
    description?: string;
    duration: number;
    order: number;
    learningLayer: string;
    courseId: string;
    curriculumModuleId?: string;
    course: { id: string; title: string };
  }>;
  activities: Array<{
    id: string;
    title: string;
    description?: string;
    activityType: string;
    maxPoints: number;
    order: number;
    courseId: string;
    lessonId?: string;
    course: { id: string; title: string };
    lesson?: { id: string; title: string };
  }>;
  courses: Array<{ id: string; title: string }>;
  levelOptions: string[];
};

type EntityType = 'PROGRAMME' | 'LEVEL' | 'TERM' | 'MODULE' | 'LESSON' | 'ACTIVITY';

const tabs: Array<{ id: EntityType; label: string }> = [
  { id: 'PROGRAMME', label: 'Programme' },
  { id: 'LEVEL', label: 'Level' },
  { id: 'TERM', label: 'Term' },
  { id: 'MODULE', label: 'Module' },
  { id: 'LESSON', label: 'Lesson' },
  { id: 'ACTIVITY', label: 'Activity' },
];

export default function CurriculumCmsPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('PROGRAMME');
  const [data, setData] = useState<CmsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState<{ entityType: EntityType; id: string } | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/cms/authoring');
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to load CMS data');
      }
      setData(result.data as CmsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CMS data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({});
    setEditMode(null);
  };

  const startEdit = (entityType: EntityType, payload: Record<string, unknown>) => {
    setEditMode({ entityType, id: String(payload.id) });
    const next: Record<string, string> = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        next[key] = value.join(', ');
      } else if (typeof value === 'object') {
        return;
      } else {
        next[key] = String(value);
      }
    });
    setForm(next);
    setActiveTab(entityType);
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload: Record<string, unknown> = { entityType: activeTab };
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'illustrativeTopics' || key === 'competencies' || key === 'learningObjectives') {
          payload[key] = value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        } else {
          payload[key] = value;
        }
      });

      const isEdit = editMode?.entityType === activeTab;
      const endpoint = isEdit
        ? `/api/admin/cms/authoring/${activeTab.toLowerCase()}/${editMode.id}`
        : '/api/admin/cms/authoring';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to save entity');
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entity');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entityType: EntityType, id: string) => {
    const confirmed = window.confirm('Delete this item?');
    if (!confirmed) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/cms/authoring/${entityType.toLowerCase()}/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to delete entity');
      }
      if (editMode?.id === id) {
        resetForm();
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entity');
    } finally {
      setSaving(false);
    }
  };

  const tableRows = useMemo(() => {
    if (!data) return [] as Array<Record<string, unknown>>;
    if (activeTab === 'PROGRAMME') return data.programmes;
    if (activeTab === 'LEVEL') return data.levels;
    if (activeTab === 'TERM') return data.terms;
    if (activeTab === 'MODULE') return data.modules;
    if (activeTab === 'LESSON') return data.lessons;
    return data.activities;
  }, [activeTab, data]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white">Curriculum CMS Authoring</h1>
        <p className="text-gray-400 mt-2">
          Author and maintain programme, level, term, module, lesson, and activity entities with live DB persistence.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-dark-600 text-gray-200 hover:bg-dark-500'
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              resetForm();
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <Card className="p-4 border border-danger-500 bg-danger-500/10">
          <p className="text-danger-500 font-semibold">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-5 xl:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-white">{editMode ? `Edit ${activeTab}` : `New ${activeTab}`}</h2>
          <EntityForm
            activeTab={activeTab}
            data={data}
            form={form}
            setForm={setForm}
          />
          <div className="flex gap-2">
            <Button onClick={submit} disabled={saving || loading}>
              {saving ? 'Saving...' : editMode ? 'Update' : 'Create'}
            </Button>
            {editMode && (
              <Button variant="outline" onClick={resetForm} disabled={saving}>
                Cancel Edit
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">{activeTab} Records</h2>
          {loading ? (
            <p className="text-gray-300">Loading records...</p>
          ) : (
            <div className="space-y-2 max-h-[640px] overflow-auto pr-1">
              {tableRows.map((row) => (
                <div key={String(row.id)} className="border border-dark-400 rounded-lg p-3 bg-dark-600/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">{String(row.title ?? row.name ?? row.term ?? row.code ?? row.id)}</p>
                      <p className="text-xs text-gray-400 mt-1">{row.description ? String(row.description) : row.focus ? String(row.focus) : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(activeTab, row)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => remove(activeTab, String(row.id))}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {tableRows.length === 0 && <p className="text-gray-400">No records found.</p>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function EntityForm({
  activeTab,
  data,
  form,
  setForm,
}: {
  activeTab: EntityType;
  data: CmsData | null;
  form: Record<string, string>;
  setForm: (next: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
}) {
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const inputClass =
    'w-full rounded-lg bg-dark-700 border border-dark-500 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500';

  if (activeTab === 'PROGRAMME') {
    return (
      <div className="space-y-3">
        <input className={inputClass} placeholder="Code: IMPACT_SCHOOL" value={form.code ?? ''} onChange={(event) => update('code', event.target.value)} />
        <input className={inputClass} placeholder="Title" value={form.title ?? ''} onChange={(event) => update('title', event.target.value)} />
        <textarea className={inputClass} placeholder="Description" value={form.description ?? form.shortDescription ?? ''} onChange={(event) => update('description', event.target.value)} />
      </div>
    );
  }

  if (activeTab === 'LEVEL') {
    return (
      <div className="space-y-3">
        <select className={inputClass} value={form.level ?? ''} onChange={(event) => update('level', event.target.value)}>
          <option value="">Select level</option>
          {(data?.levelOptions ?? []).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <input className={inputClass} placeholder="Name" value={form.name ?? ''} onChange={(event) => update('name', event.target.value)} />
        <input className={inputClass} placeholder="Min age" value={form.minAge ?? ''} onChange={(event) => update('minAge', event.target.value)} />
        <input className={inputClass} placeholder="Max age" value={form.maxAge ?? ''} onChange={(event) => update('maxAge', event.target.value)} />
        <textarea className={inputClass} placeholder="Primary outcome" value={form.primaryOutcome ?? ''} onChange={(event) => update('primaryOutcome', event.target.value)} />
        <textarea className={inputClass} placeholder="Signature shift" value={form.signatureShift ?? ''} onChange={(event) => update('signatureShift', event.target.value)} />
      </div>
    );
  }

  if (activeTab === 'TERM') {
    return (
      <div className="space-y-3">
        <select className={inputClass} value={form.level ?? form.curriculumLevel ?? ''} onChange={(event) => update('level', event.target.value)}>
          <option value="">Select level</option>
          {(data?.levelOptions ?? []).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <input className={inputClass} placeholder="Term label (Term 1)" value={form.term ?? form.termOrCycle ?? ''} onChange={(event) => update('term', event.target.value)} />
        <input className={inputClass} placeholder="Focus" value={form.focus ?? ''} onChange={(event) => update('focus', event.target.value)} />
        <textarea
          className={inputClass}
          placeholder="Illustrative topics (comma separated)"
          value={form.illustrativeTopics ?? ''}
          onChange={(event) => update('illustrativeTopics', event.target.value)}
        />
      </div>
    );
  }

  if (activeTab === 'MODULE') {
    return (
      <div className="space-y-3">
        <select className={inputClass} value={form.frameworkId ?? ''} onChange={(event) => update('frameworkId', event.target.value)}>
          <option value="">Select level framework</option>
          {(data?.levels ?? []).map((level) => (
            <option key={level.id} value={level.id}>
              {level.level} - {level.name}
            </option>
          ))}
        </select>
        <input className={inputClass} placeholder="Title" value={form.title ?? ''} onChange={(event) => update('title', event.target.value)} />
        <input className={inputClass} placeholder="Order" value={form.order ?? ''} onChange={(event) => update('order', event.target.value)} />
        <input className={inputClass} placeholder="Subject strand" value={form.subjectStrand ?? ''} onChange={(event) => update('subjectStrand', event.target.value)} />
        <textarea className={inputClass} placeholder="Description" value={form.description ?? ''} onChange={(event) => update('description', event.target.value)} />
      </div>
    );
  }

  if (activeTab === 'LESSON') {
    return (
      <div className="space-y-3">
        <select className={inputClass} value={form.courseId ?? ''} onChange={(event) => update('courseId', event.target.value)}>
          <option value="">Select course</option>
          {(data?.courses ?? []).map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <select className={inputClass} value={form.curriculumModuleId ?? ''} onChange={(event) => update('curriculumModuleId', event.target.value)}>
          <option value="">Select curriculum module (optional)</option>
          {(data?.modules ?? []).map((module) => (
            <option key={module.id} value={module.id}>
              {module.frameworkLevel} - {module.title}
            </option>
          ))}
        </select>
        <input className={inputClass} placeholder="Title" value={form.title ?? ''} onChange={(event) => update('title', event.target.value)} />
        <input className={inputClass} placeholder="Order" value={form.order ?? ''} onChange={(event) => update('order', event.target.value)} />
        <input className={inputClass} placeholder="Duration (minutes)" value={form.duration ?? ''} onChange={(event) => update('duration', event.target.value)} />
        <input className={inputClass} placeholder="Learning layer (LEARN/APPLY/ENGAGE_LIVE/SHOW_PROGRESS)" value={form.learningLayer ?? ''} onChange={(event) => update('learningLayer', event.target.value)} />
        <textarea className={inputClass} placeholder="Description" value={form.description ?? ''} onChange={(event) => update('description', event.target.value)} />
        <textarea className={inputClass} placeholder="Learning objectives (comma separated)" value={form.learningObjectives ?? ''} onChange={(event) => update('learningObjectives', event.target.value)} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <select className={inputClass} value={form.courseId ?? ''} onChange={(event) => update('courseId', event.target.value)}>
        <option value="">Select course</option>
        {(data?.courses ?? []).map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
      <select className={inputClass} value={form.lessonId ?? ''} onChange={(event) => update('lessonId', event.target.value)}>
        <option value="">Select lesson (optional)</option>
        {(data?.lessons ?? []).map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.title}
          </option>
        ))}
      </select>
      <input className={inputClass} placeholder="Title" value={form.title ?? ''} onChange={(event) => update('title', event.target.value)} />
      <input className={inputClass} placeholder="Type (WORKSHEET/TASK/REFLECTION)" value={form.activityType ?? ''} onChange={(event) => update('activityType', event.target.value)} />
      <input className={inputClass} placeholder="Max points" value={form.maxPoints ?? ''} onChange={(event) => update('maxPoints', event.target.value)} />
      <input className={inputClass} placeholder="Order" value={form.order ?? ''} onChange={(event) => update('order', event.target.value)} />
      <textarea className={inputClass} placeholder="Description" value={form.description ?? ''} onChange={(event) => update('description', event.target.value)} />
      <textarea className={inputClass} placeholder="Instructions" value={form.instructions ?? ''} onChange={(event) => update('instructions', event.target.value)} />
    </div>
  );
}
