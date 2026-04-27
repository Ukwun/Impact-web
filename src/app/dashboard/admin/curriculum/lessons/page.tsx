'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus, Edit, Trash2, Search, Loader, AlertCircle, ChevronLeft, ChevronRight,
  FileText, CheckCircle, XCircle, X, Send, RefreshCw, Layers, Eye,
} from 'lucide-react';

interface Module { id: string; title: string; framework: { level: string }; }

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  curriculumModule: {
    id: string;
    title: string;
    subjectStrand: string;
    framework: { level: string; name: string };
    schoolId?: string | null;
  } | null;
  course: { id: string; title: string } | null;
  _count: { activities: number };
}

interface Pagination { page: number; pages: number; total: number; limit: number; }

const LEVEL_LABELS: Record<string, string> = {
  PRIMARY: 'Primary', JUNIOR_SECONDARY: 'Jr. Sec.',
  SENIOR_SECONDARY: 'Sr. Sec.', IMPACTUNI: 'ImpactUni',
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Lesson | null>(null);
  const [submitReview, setSubmitReview] = useState<Lesson | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Form state
  const [form, setForm] = useState({ title: '', content: '', order: 1, curriculumModuleId: '' });

  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const buildQuery = useCallback((o: Record<string, unknown> = {}) => {
    const p = new URLSearchParams();
    if ((o.search ?? search) as string) p.set('search', (o.search ?? search) as string);
    if ((o.filterModule ?? filterModule) as string) p.set('moduleId', (o.filterModule ?? filterModule) as string);
    if ((o.filterPublished ?? filterPublished) as string) p.set('isPublished', (o.filterPublished ?? filterPublished) as string);
    p.set('page', String((o.page ?? page) as number));
    p.set('limit', '25');
    return p.toString();
  }, [search, filterModule, filterPublished, page]);

  const fetchLessons = useCallback(async (o: Record<string, unknown> = {}) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/curriculum/lessons?${buildQuery(o)}`);
      if (!res.ok) throw new Error('Failed to load lessons');
      const data = await res.json();
      setLessons(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetch('/api/admin/curriculum/modules?limit=100').then(r => r.json()).then(d => setModules(d.data ?? [])).catch(() => null);
    const authToken = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
    if (authToken) {
      fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      }).then(r => r.json()).then(d => {
        setUserRole(d?.data?.role ?? null);
        setUserSchoolId(d?.data?.schoolId ?? null);
      }).catch(() => null);
    }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const canEdit = (lesson: Lesson) =>
    userRole === 'ADMIN' || lesson.curriculumModule?.schoolId === userSchoolId;

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      const res = await fetch('/api/admin/curriculum/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setShowCreate(false);
      setForm({ title: '', content: '', order: 1, curriculumModuleId: '' });
      fetchLessons();
    } catch (err) { alert(err instanceof Error ? err.message : 'Create failed'); }
    finally { setFormLoading(false); }
  };

  const handleSaveEdit = async () => {
    if (!editLesson) return;
    try {
      setFormLoading(true);
      const res = await fetch(`/api/admin/curriculum/lessons/${editLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setEditLesson(null);
      fetchLessons();
    } catch (err) { alert(err instanceof Error ? err.message : 'Save failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setFormLoading(true);
      const res = await fetch(`/api/admin/curriculum/lessons/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setDeleteConfirm(null);
      fetchLessons();
    } catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
    finally { setFormLoading(false); }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      const res = await fetch(`/api/admin/curriculum/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !lesson.isPublished }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      fetchLessons();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleSubmitForReview = async () => {
    if (!submitReview) return;
    try {
      setSubmittingReview(true);
      const vRes = await fetch('/api/admin/curriculum/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'LESSON',
          entityId: submitReview.id,
          content: { title: submitReview.title, content: submitReview.content },
          changeNotes: reviewNotes,
        }),
      });
      if (!vRes.ok) throw new Error('Failed to create version');
      const vData = await vRes.json();
      await fetch(`/api/admin/curriculum/versions/${vData.data.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      setSubmitReview(null);
      setReviewNotes('');
    } catch (err) { alert(err instanceof Error ? err.message : 'Submit failed'); }
    finally { setSubmittingReview(false); }
  };

  const openEdit = (lesson: Lesson) => {
    setEditLesson(lesson);
    setForm({ title: lesson.title, content: lesson.content, order: lesson.order, curriculumModuleId: lesson.curriculumModule?.id ?? '' });
  };

  const openCreate = () => {
    setForm({ title: '', content: '', order: 1, curriculumModuleId: modules[0]?.id ?? '' });
    setShowCreate(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Lessons</h1>
            <p className="text-gray-400 mt-1">{pagination.total} total lessons</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchLessons()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="primary" className="gap-2" onClick={openCreate}>
            <Plus className="w-5 h-5" /> New Lesson
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search lessons..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (searchTimer.current) clearTimeout(searchTimer.current);
                searchTimer.current = setTimeout(() => fetchLessons({ search: e.target.value, page: 1 }), 400);
              }}
              className="pl-9"
            />
          </div>
          <select
            className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white"
            value={filterModule}
            onChange={e => { setFilterModule(e.target.value); setPage(1); fetchLessons({ filterModule: e.target.value, page: 1 }); }}
          >
            <option value="">All Modules</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <select
            className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white"
            value={filterPublished}
            onChange={e => { setFilterPublished(e.target.value); setPage(1); fetchLessons({ filterPublished: e.target.value, page: 1 }); }}
          >
            <option value="">All Statuses</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-2 items-center"><AlertCircle className="w-4 h-4 text-danger-400" /><p className="text-danger-300 text-sm">{error}</p></div>
        </Card>
      )}

      {loading ? (
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-500 mx-auto animate-spin mb-2" />
          <p className="text-gray-400">Loading lessons…</p>
        </Card>
      ) : lessons.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No lessons found</p>
          <Button variant="primary" className="gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Create Lesson
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700 border-b border-dark-600">
                <tr>
                  {['Lesson', 'Module / Level', 'Activities', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {lessons.map(lesson => (
                  <tr key={lesson.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-white line-clamp-1">{lesson.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Order #{lesson.order}</p>
                    </td>
                    <td className="px-5 py-4">
                      {lesson.curriculumModule ? (
                        <div>
                          <p className="text-sm text-white line-clamp-1">{lesson.curriculumModule.title}</p>
                          <p className="text-xs text-gray-400">{LEVEL_LABELS[lesson.curriculumModule.framework?.level] ?? ''}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">{lesson.course?.title ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Layers className="w-3.5 h-3.5" />{lesson._count.activities}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {lesson.isPublished ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <XCircle className="w-3.5 h-3.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {canEdit(lesson) ? (
                          <>
                            <button className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white" title="Edit" onClick={() => openEdit(lesson)}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className={`p-1.5 rounded-lg transition-colors text-gray-400 ${lesson.isPublished ? 'hover:text-amber-400 hover:bg-amber-500/20' : 'hover:text-emerald-400 hover:bg-emerald-500/20'}`}
                              title={lesson.isPublished ? 'Unpublish' : 'Publish'}
                              onClick={() => handleTogglePublish(lesson)}
                            >
                              {lesson.isPublished ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            {!lesson.isPublished && (
                              <button className="p-1.5 rounded-lg hover:bg-amber-500/20 text-gray-400 hover:text-amber-300" title="Submit for Review"
                                onClick={() => { setSubmitReview(lesson); setReviewNotes(''); }}>
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            {userRole === 'ADMIN' && (
                              <button className="p-1.5 rounded-lg hover:bg-danger-500/20 text-gray-400 hover:text-danger-400" title="Delete"
                                onClick={() => setDeleteConfirm(lesson)}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <button className="p-1.5 text-gray-600 cursor-not-allowed" title="View only"><Eye className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-dark-600 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1}
                  onClick={() => { const p = page - 1; setPage(p); fetchLessons({ page: p }); }}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-white px-2">{pagination.page} / {pagination.pages}</span>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages}
                  onClick={() => { const p = page + 1; setPage(p); fetchLessons({ page: p }); }}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Create / Edit Modal */}
      {(showCreate || editLesson) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editLesson ? 'Edit Lesson' : 'Create Lesson'}</h2>
              <button onClick={() => { setShowCreate(false); setEditLesson(null); }} className="p-2 rounded-lg hover:bg-dark-600">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Module *</label>
                <select
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white"
                  value={form.curriculumModuleId}
                  onChange={e => setForm(f => ({ ...f, curriculumModuleId: e.target.value }))}
                >
                  <option value="">Select module…</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Order</label>
                <Input type="number" min={1} value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Content</label>
              <textarea
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500"
                rows={8}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Lesson content, instructions, or rich text…"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowCreate(false); setEditLesson(null); }} disabled={formLoading}>Cancel</Button>
              <Button variant="primary" onClick={editLesson ? handleSaveEdit : handleCreate} disabled={formLoading} className="gap-2">
                {formLoading && <Loader className="w-4 h-4 animate-spin" />}
                {editLesson ? 'Save Changes' : 'Create Lesson'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Submit for Review Modal */}
      {submitReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20"><Send className="w-5 h-5 text-amber-400" /></div>
              <h2 className="text-xl font-bold text-white">Submit for Review</h2>
            </div>
            <p className="text-gray-300 text-sm">Submitting <span className="font-semibold text-white">{submitReview.title}</span> for admin review.</p>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Notes (optional)</label>
              <textarea className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none" rows={3}
                value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSubmitReview(null)} disabled={submittingReview}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmitForReview} disabled={submittingReview} className="gap-2">
                {submittingReview && <Loader className="w-4 h-4 animate-spin" />} Submit
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Delete Lesson</h2>
            <p className="text-gray-300">Delete <span className="font-semibold text-white">{deleteConfirm.title}</span>? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} disabled={formLoading} className="gap-2">
                {formLoading && <Loader className="w-4 h-4 animate-spin" />} Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
