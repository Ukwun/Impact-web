'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus, Edit, Trash2, Search, Loader, AlertCircle, ChevronLeft, ChevronRight,
  Zap, X, Send, RefreshCw, Calendar, Star, Eye,
} from 'lucide-react';

interface Lesson { id: string; title: string; }

interface Activity {
  id: string;
  title: string;
  description: string | null;
  activityType: string;
  points: number;
  dueDate: string | null;
  isRequired: boolean;
  createdAt: string;
  lesson: {
    id: string;
    title: string;
    curriculumModule: {
      id: string;
      title: string;
      subjectStrand: string;
      framework: { level: string };
    } | null;
  } | null;
}

interface Pagination { page: number; pages: number; total: number; limit: number; }

const ACTIVITY_TYPES = ['QUIZ', 'ASSIGNMENT', 'PROJECT', 'DISCUSSION', 'REFLECTION', 'READING', 'CHALLENGE', 'SIMULATION'];

const TYPE_COLORS: Record<string, string> = {
  QUIZ: 'bg-blue-500/20 text-blue-300',
  ASSIGNMENT: 'bg-purple-500/20 text-purple-300',
  PROJECT: 'bg-emerald-500/20 text-emerald-300',
  DISCUSSION: 'bg-amber-500/20 text-amber-300',
  REFLECTION: 'bg-pink-500/20 text-pink-300',
  READING: 'bg-gray-500/20 text-gray-300',
  CHALLENGE: 'bg-orange-500/20 text-orange-300',
  SIMULATION: 'bg-cyan-500/20 text-cyan-300',
};

const LEVEL_LABELS: Record<string, string> = {
  PRIMARY: 'Primary', JUNIOR_SECONDARY: 'Jr. Sec.', SENIOR_SECONDARY: 'Sr. Sec.', IMPACTUNI: 'ImpactUni',
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterLesson, setFilterLesson] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Activity | null>(null);
  const [submitReview, setSubmitReview] = useState<Activity | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', activityType: 'QUIZ',
    lessonId: '', points: 0, dueDate: '', isRequired: false,
  });

  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const buildQuery = useCallback((o: Record<string, unknown> = {}) => {
    const p = new URLSearchParams();
    if ((o.search ?? search) as string) p.set('search', (o.search ?? search) as string);
    if ((o.filterLesson ?? filterLesson) as string) p.set('lessonId', (o.filterLesson ?? filterLesson) as string);
    if ((o.filterType ?? filterType) as string) p.set('activityType', (o.filterType ?? filterType) as string);
    p.set('page', String((o.page ?? page) as number));
    p.set('limit', '25');
    return p.toString();
  }, [search, filterLesson, filterType, page]);

  const fetchActivities = useCallback(async (o: Record<string, unknown> = {}) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/curriculum/activities?${buildQuery(o)}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setActivities(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetch('/api/admin/curriculum/lessons?limit=100').then(r => r.json()).then(d => setLessons(d.data ?? [])).catch(() => null);
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUserRole(d?.data?.role ?? null);
      setUserSchoolId(d?.data?.schoolId ?? null);
    }).catch(() => null);
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const canEdit = (activity: Activity) => {
    const schoolId = activity.lesson?.curriculumModule?.id;
    return userRole === 'ADMIN' || schoolId !== undefined;
  };

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      const res = await fetch('/api/admin/curriculum/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dueDate: form.dueDate || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setShowCreate(false);
      setForm({ title: '', description: '', activityType: 'QUIZ', lessonId: '', points: 0, dueDate: '', isRequired: false });
      fetchActivities();
    } catch (err) { alert(err instanceof Error ? err.message : 'Create failed'); }
    finally { setFormLoading(false); }
  };

  const handleSaveEdit = async () => {
    if (!editActivity) return;
    try {
      setFormLoading(true);
      const res = await fetch(`/api/admin/curriculum/activities/${editActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dueDate: form.dueDate || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setEditActivity(null);
      fetchActivities();
    } catch (err) { alert(err instanceof Error ? err.message : 'Save failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setFormLoading(true);
      const res = await fetch(`/api/admin/curriculum/activities/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setDeleteConfirm(null);
      fetchActivities();
    } catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
    finally { setFormLoading(false); }
  };

  const handleSubmitReview = async () => {
    if (!submitReview) return;
    try {
      setSubmittingReview(true);
      const vRes = await fetch('/api/admin/curriculum/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'ACTIVITY', entityId: submitReview.id,
          content: { title: submitReview.title, description: submitReview.description },
          changeNotes: reviewNotes,
        }),
      });
      if (!vRes.ok) throw new Error('Failed to create version');
      const vData = await vRes.json();
      await fetch(`/api/admin/curriculum/versions/${vData.data.id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      setSubmitReview(null);
      setReviewNotes('');
    } catch (err) { alert(err instanceof Error ? err.message : 'Submit failed'); }
    finally { setSubmittingReview(false); }
  };

  const openEdit = (a: Activity) => {
    setEditActivity(a);
    setForm({
      title: a.title, description: a.description ?? '', activityType: a.activityType,
      lessonId: a.lesson?.id ?? '', points: a.points,
      dueDate: a.dueDate ? a.dueDate.slice(0, 10) : '', isRequired: a.isRequired,
    });
  };

  const ActivityForm = ({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1">Title *</label>
        <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Type *</label>
          <select className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white"
            value={form.activityType} onChange={e => setForm(f => ({ ...f, activityType: e.target.value }))}>
            {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Lesson *</label>
          <select className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white"
            value={form.lessonId} onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}>
            <option value="">Select lesson…</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Points</label>
          <Input type="number" min={0} value={form.points} onChange={e => setForm(f => ({ ...f, points: parseInt(e.target.value) }))} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Due Date</label>
          <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1">Description</label>
        <textarea className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500"
          rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="isRequired" checked={form.isRequired}
          onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))} className="w-4 h-4 accent-primary-500" />
        <label htmlFor="isRequired" className="text-sm text-gray-300">Required activity</label>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={formLoading}>Cancel</Button>
        <Button variant="primary" onClick={onSubmit} disabled={formLoading} className="gap-2">
          {formLoading && <Loader className="w-4 h-4 animate-spin" />}
          {editActivity ? 'Save Changes' : 'Create Activity'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Activities</h1>
            <p className="text-gray-400 mt-1">{pagination.total} total activities</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchActivities()}><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="primary" className="gap-2" onClick={() => { setForm({ title: '', description: '', activityType: 'QUIZ', lessonId: lessons[0]?.id ?? '', points: 0, dueDate: '', isRequired: false }); setShowCreate(true); }}>
            <Plus className="w-5 h-5" /> New Activity
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input placeholder="Search activities..." value={search} className="pl-9"
              onChange={e => {
                setSearch(e.target.value);
                if (searchTimer.current) clearTimeout(searchTimer.current);
                searchTimer.current = setTimeout(() => fetchActivities({ search: e.target.value, page: 1 }), 400);
              }} />
          </div>
          <select className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white"
            value={filterLesson} onChange={e => { setFilterLesson(e.target.value); fetchActivities({ filterLesson: e.target.value, page: 1 }); }}>
            <option value="">All Lessons</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
          <select className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white"
            value={filterType} onChange={e => { setFilterType(e.target.value); fetchActivities({ filterType: e.target.value, page: 1 }); }}>
            <option value="">All Types</option>
            {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-2"><AlertCircle className="w-4 h-4 text-danger-400 flex-shrink-0" /><p className="text-danger-300 text-sm">{error}</p></div>
        </Card>
      )}

      {loading ? (
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-500 mx-auto animate-spin mb-2" />
          <p className="text-gray-400">Loading activities…</p>
        </Card>
      ) : activities.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No activities found</p>
          <Button variant="primary" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Create Activity
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700 border-b border-dark-600">
                <tr>
                  {['Activity', 'Type', 'Lesson / Module', 'Points', 'Due Date', 'Required', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {activities.map(a => (
                  <tr key={a.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-white line-clamp-1">{a.title}</p>
                      {a.description && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{a.description}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[a.activityType] ?? 'bg-gray-500/20 text-gray-300'}`}>
                        {a.activityType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {a.lesson ? (
                        <div>
                          <p className="text-sm text-white line-clamp-1">{a.lesson.title}</p>
                          <p className="text-xs text-gray-400">{a.lesson.curriculumModule?.title ?? ''}</p>
                          <p className="text-xs text-gray-500">{LEVEL_LABELS[a.lesson.curriculumModule?.framework?.level ?? ''] ?? ''}</p>
                        </div>
                      ) : <span className="text-gray-500 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-white">
                        <Star className="w-3.5 h-3.5 text-amber-400" />{a.points}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {a.dueDate ? (
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(a.dueDate).toLocaleDateString()}
                        </div>
                      ) : <span className="text-gray-500 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold ${a.isRequired ? 'text-red-400' : 'text-gray-500'}`}>
                        {a.isRequired ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {canEdit(a) ? (
                          <>
                            <button className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white" title="Edit" onClick={() => openEdit(a)}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-amber-500/20 text-gray-400 hover:text-amber-300" title="Submit for Review"
                              onClick={() => { setSubmitReview(a); setReviewNotes(''); }}>
                              <Send className="w-4 h-4" />
                            </button>
                            {userRole === 'ADMIN' && (
                              <button className="p-1.5 rounded-lg hover:bg-danger-500/20 text-gray-400 hover:text-danger-400" title="Delete"
                                onClick={() => setDeleteConfirm(a)}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <button className="p-1.5 text-gray-600 cursor-not-allowed"><Eye className="w-4 h-4" /></button>
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
              <p className="text-sm text-gray-400">{(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1}
                  onClick={() => { const p = page - 1; setPage(p); fetchActivities({ page: p }); }}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-white px-2">{pagination.page} / {pagination.pages}</span>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages}
                  onClick={() => { const p = page + 1; setPage(p); fetchActivities({ page: p }); }}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Activity</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-dark-600"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <ActivityForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Activity</h2>
              <button onClick={() => setEditActivity(null)} className="p-2 rounded-lg hover:bg-dark-600"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <ActivityForm onSubmit={handleSaveEdit} onCancel={() => setEditActivity(null)} />
          </Card>
        </div>
      )}

      {/* Submit for Review */}
      {submitReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20"><Send className="w-5 h-5 text-amber-400" /></div>
              <h2 className="text-xl font-bold text-white">Submit for Review</h2>
            </div>
            <p className="text-gray-300 text-sm">Submitting <span className="font-semibold text-white">{submitReview.title}</span> for admin review.</p>
            <textarea className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none" rows={3}
              placeholder="Change notes…" value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSubmitReview(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmitReview} disabled={submittingReview} className="gap-2">
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
            <h2 className="text-xl font-bold text-white">Delete Activity</h2>
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
