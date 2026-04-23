'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus, Edit, Trash2, Search, Filter, Loader, AlertCircle, ChevronLeft, ChevronRight,
  BookOpen, Layers, Clock, CheckCircle, XCircle, Eye, Send, X, Shield, RefreshCw,
} from 'lucide-react';

interface Framework { id: string; name: string; level: string; }

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  subjectStrand: string;
  competencies: string[];
  learningObjectives: string[];
  estimatedWeeks: number;
  publishStatus: string;
  schoolId: string | null;
  frameworkId: string;
  framework: { id: string; name: string; level: string };
  _count: { lessons: number; versions: number };
  createdAt: string;
}

interface Pagination { page: number; pages: number; total: number; limit: number; }

const STATUS_STYLES: Record<string, string> = {
  DRAFT:          'bg-gray-500/20 text-gray-300',
  PENDING_REVIEW: 'bg-amber-500/20 text-amber-300',
  APPROVED:       'bg-blue-500/20 text-blue-300',
  PUBLISHED:      'bg-emerald-500/20 text-emerald-300',
  ARCHIVED:       'bg-red-500/20 text-red-300',
};

const LEVEL_LABELS: Record<string, string> = {
  PRIMARY: 'Primary',
  JUNIOR_SECONDARY: 'Junior Sec.',
  SENIOR_SECONDARY: 'Senior Sec.',
  IMPACTUNI: 'ImpactUni',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

interface ModuleFormProps {
  initial?: Partial<Module>;
  frameworks: Framework[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  userRole: string | null;
}

function ModuleForm({ initial, frameworks, onSubmit, onCancel, loading }: ModuleFormProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    frameworkId: initial?.frameworkId ?? frameworks[0]?.id ?? '',
    order: initial?.order ?? 1,
    subjectStrand: initial?.subjectStrand ?? '',
    competencies: (initial?.competencies ?? []).join('\n'),
    learningObjectives: (initial?.learningObjectives ?? []).join('\n'),
    estimatedWeeks: initial?.estimatedWeeks ?? 2,
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      competencies: form.competencies.split('\n').filter(Boolean),
      learningObjectives: form.learningObjectives.split('\n').filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Title *</label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Framework Level *</label>
          <select
            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500"
            value={form.frameworkId}
            onChange={e => set('frameworkId', e.target.value)}
            required
          >
            {frameworks.map(fw => (
              <option key={fw.id} value={fw.id}>
                {LEVEL_LABELS[fw.level] ?? fw.level} — {fw.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Subject Strand *</label>
          <Input
            value={form.subjectStrand}
            onChange={e => set('subjectStrand', e.target.value)}
            placeholder="e.g. Financial Literacy"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Order</label>
            <Input type="number" min={1} value={form.order} onChange={e => set('order', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Est. Weeks</label>
            <Input type="number" min={1} value={form.estimatedWeeks} onChange={e => set('estimatedWeeks', parseInt(e.target.value))} />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1">Description</label>
        <textarea
          className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">
            Learning Objectives <span className="text-gray-500 font-normal">(one per line)</span>
          </label>
          <textarea
            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500"
            rows={5}
            value={form.learningObjectives}
            onChange={e => set('learningObjectives', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">
            Competencies <span className="text-gray-500 font-normal">(one per line)</span>
          </label>
          <textarea
            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500"
            rows={5}
            value={form.competencies}
            onChange={e => set('competencies', e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={loading} className="gap-2">
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {initial?.id ? 'Save Changes' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterFramework, setFilterFramework] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStrand, setFilterStrand] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Module | null>(null);
  const [submitReview, setSubmitReview] = useState<Module | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const buildQuery = useCallback((overrides: Record<string, unknown> = {}) => {
    const params = new URLSearchParams();
    const s = (overrides.search as string) ?? search;
    const fw = (overrides.filterFramework as string) ?? filterFramework;
    const st = (overrides.filterStatus as string) ?? filterStatus;
    const str = (overrides.filterStrand as string) ?? filterStrand;
    const p = (overrides.page as number) ?? page;
    if (s) params.set('search', s);
    if (fw) params.set('frameworkId', fw);
    if (st) params.set('publishStatus', st);
    if (str) params.set('subjectStrand', str);
    params.set('page', String(p));
    params.set('limit', '25');
    return params.toString();
  }, [search, filterFramework, filterStatus, filterStrand, page]);

  const fetchModules = useCallback(async (overrides: Record<string, unknown> = {}) => {
    try {
      setLoading(true);
      setError(null);
      const qs = buildQuery(overrides);
      const res = await fetch(`/api/admin/curriculum/modules?${qs}`);
      if (!res.ok) throw new Error('Failed to load modules');
      const data = await res.json();
      setModules(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const fetchFrameworks = useCallback(async () => {
    const res = await fetch('/api/admin/curriculum/frameworks');
    if (res.ok) {
      const data = await res.json();
      setFrameworks(data.data);
    }
  }, []);

  useEffect(() => {
    fetchFrameworks();
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        setUserRole(d?.data?.role ?? null);
        setUserSchoolId(d?.data?.schoolId ?? null);
      })
      .catch(() => null);
  }, [fetchFrameworks]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchModules({ search: val, page: 1 }), 400);
  };

  const handleFilterChange = (key: string, val: string) => {
    if (key === 'filterFramework') setFilterFramework(val);
    if (key === 'filterStatus') setFilterStatus(val);
    if (key === 'filterStrand') setFilterStrand(val);
    setPage(1);
    fetchModules({ [key]: val, page: 1 });
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      setFormLoading(true);
      const res = await fetch('/api/admin/curriculum/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create');
      }
      setShowCreate(false);
      fetchModules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editModule) return;
    try {
      setFormLoading(true);
      const res = await fetch(`/api/admin/curriculum/modules/${editModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      setEditModule(null);
      fetchModules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setFormLoading(true);
      const res = await fetch(`/api/admin/curriculum/modules/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      setDeleteConfirm(null);
      fetchModules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submitReview) return;
    try {
      setSubmittingReview(true);
      // Save a version snapshot first
      const versionRes = await fetch('/api/admin/curriculum/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'MODULE',
          entityId: submitReview.id,
          moduleId: submitReview.id,
          content: submitReview,
          changeNotes: reviewNotes,
        }),
      });
      if (!versionRes.ok) throw new Error('Failed to create version');
      const vData = await versionRes.json();

      // Submit for review
      const submitRes = await fetch(`/api/admin/curriculum/versions/${vData.data.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reviewNotes }),
      });
      if (!submitRes.ok) throw new Error('Failed to submit for review');

      setSubmitReview(null);
      setReviewNotes('');
      fetchModules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isAdmin = userRole === 'ADMIN';
  const canEdit = (mod: Module) => isAdmin || mod.schoolId === userSchoolId;

  const uniqueStrands = [...new Set(modules.map(m => m.subjectStrand))].filter(Boolean).sort();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Curriculum Modules</h1>
              <p className="text-gray-400 mt-1">
                {pagination.total} module{pagination.total !== 1 ? 's' : ''} across all levels
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => fetchModules()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="primary" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="w-5 h-5" /> New Module
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search modules..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white"
            value={filterFramework}
            onChange={e => handleFilterChange('filterFramework', e.target.value)}
          >
            <option value="">All Levels</option>
            {frameworks.map(fw => (
              <option key={fw.id} value={fw.id}>{LEVEL_LABELS[fw.level] ?? fw.level}</option>
            ))}
          </select>
          <select
            className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white"
            value={filterStatus}
            onChange={e => handleFilterChange('filterStatus', e.target.value)}
          >
            <option value="">All Statuses</option>
            {['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {uniqueStrands.length > 0 && (
            <select
              className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white"
              value={filterStrand}
              onChange={e => handleFilterChange('filterStrand', e.target.value)}
            >
              <option value="">All Strands</option>
              {uniqueStrands.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {(search || filterFramework || filterStatus || filterStrand) && (
            <button
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              onClick={() => {
                setSearch(''); setFilterFramework(''); setFilterStatus(''); setFilterStrand('');
                fetchModules({ search: '', filterFramework: '', filterStatus: '', filterStrand: '', page: 1 });
              }}
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </Card>

      {error && (
        <Card className="p-6 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
            <p className="text-danger-300">{error}</p>
          </div>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-500 mx-auto mb-3 animate-spin" />
          <p className="text-gray-400">Loading modules…</p>
        </Card>
      ) : modules.length === 0 ? (
        <Card className="p-12 text-center">
          <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No modules found</p>
          <Button variant="primary" className="gap-2 mt-4" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Create your first module
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700 border-b border-dark-600">
                <tr>
                  {['Module', 'Level', 'Strand', 'Weeks', 'Lessons', 'Status', 'Scope', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {modules.map(mod => (
                  <tr key={mod.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-white line-clamp-1">{mod.title}</p>
                      {mod.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{mod.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-300">{LEVEL_LABELS[mod.framework?.level] ?? mod.framework?.level}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-white">{mod.subjectStrand}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Clock className="w-3.5 h-3.5" />{mod.estimatedWeeks}w
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <BookOpen className="w-3.5 h-3.5" />{mod._count.lessons}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={mod.publishStatus} />
                    </td>
                    <td className="px-5 py-4">
                      {mod.schoolId ? (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" /> School
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Platform
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {canEdit(mod) ? (
                          <>
                            <button
                              className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
                              title="Edit"
                              onClick={() => setEditModule(mod)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {mod.publishStatus === 'DRAFT' && (
                              <button
                                className="p-1.5 rounded-lg hover:bg-amber-500/20 text-gray-400 hover:text-amber-300 transition-colors"
                                title="Submit for Review"
                                onClick={() => { setSubmitReview(mod); setReviewNotes(''); }}
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                className="p-1.5 rounded-lg hover:bg-danger-500/20 text-gray-400 hover:text-danger-400 transition-colors"
                                title="Delete"
                                onClick={() => setDeleteConfirm(mod)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <button className="p-1.5 rounded-lg text-gray-600 cursor-not-allowed" title="View only">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-dark-600 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => { const p = page - 1; setPage(p); fetchModules({ page: p }); }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-white px-2">Page {pagination.page} / {pagination.pages}</span>
                <Button
                  variant="outline" size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => { const p = page + 1; setPage(p); fetchModules({ page: p }); }}
                >
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
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Module</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-dark-600">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <ModuleForm
              frameworks={frameworks}
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
              loading={formLoading}
              userRole={userRole}
            />
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Module</h2>
              <button onClick={() => setEditModule(null)} className="p-2 rounded-lg hover:bg-dark-600">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <ModuleForm
              initial={editModule}
              frameworks={frameworks}
              onSubmit={handleEdit}
              onCancel={() => setEditModule(null)}
              loading={formLoading}
              userRole={userRole}
            />
          </Card>
        </div>
      )}

      {/* Submit for Review Modal */}
      {submitReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Send className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Submit for Review</h2>
            </div>
            <p className="text-gray-300 text-sm">
              You&apos;re submitting <span className="font-semibold text-white">{submitReview.title}</span> for admin review before it can be published.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Change Notes (optional)</label>
              <textarea
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Describe what changed and why…"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSubmitReview(null)} disabled={submittingReview}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmitForReview} disabled={submittingReview} className="gap-2">
                {submittingReview && <Loader className="w-4 h-4 animate-spin" />}
                Submit for Review
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-danger-500/20">
                <Trash2 className="w-5 h-5 text-danger-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Module</h2>
            </div>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm.title}</span>?
              This will also remove all associated lessons and activities. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={formLoading}>Cancel</Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={formLoading}
                className="gap-2"
              >
                {formLoading && <Loader className="w-4 h-4 animate-spin" />}
                <XCircle className="w-4 h-4" /> Delete Module
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
