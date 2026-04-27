'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  CheckCircle, XCircle, Clock, Send, AlertCircle, Loader, Eye,
  RefreshCw, MessageSquare, X, Globe, Filter, ChevronLeft, ChevronRight,
  BookOpen, FileText, Zap, Layers,
} from 'lucide-react';

interface Author { id: string; firstName: string; lastName: string; email: string; }
interface Reviewer { id: string; firstName: string; lastName: string; }

interface Version {
  id: string;
  entityType: string;
  entityId: string;
  versionNumber: number;
  status: string;
  content: Record<string, unknown>;
  changeNotes: string | null;
  reviewerComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
  author: Author;
  reviewer: Reviewer | null;
  approvalRequest: {
    id: string;
    status: string;
    requestNotes: string | null;
    reviewNotes: string | null;
    requestedAt: string;
    reviewedAt: string | null;
  } | null;
}

interface Pagination { page: number; pages: number; total: number; limit: number; }

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  DRAFT:          { bg: 'bg-gray-500/10 border-gray-500/30', text: 'text-gray-400', icon: <Clock className="w-4 h-4" /> },
  PENDING_REVIEW: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', icon: <Send className="w-4 h-4" /> },
  APPROVED:       { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', icon: <CheckCircle className="w-4 h-4" /> },
  PUBLISHED:      { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', icon: <Globe className="w-4 h-4" /> },
  ARCHIVED:       { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', icon: <XCircle className="w-4 h-4" /> },
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  FRAMEWORK: <BookOpen className="w-4 h-4" />,
  MODULE:    <Layers className="w-4 h-4" />,
  LESSON:    <FileText className="w-4 h-4" />,
  ACTIVITY:  <Zap className="w-4 h-4" />,
};

export default function AdminReviewQueuePage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState('PENDING_REVIEW');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);

  // Review modal state
  const [reviewing, setReviewing] = useState<Version | null>(null);
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Publish modal state
  const [publishing, setPublishing] = useState<Version | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  // Preview modal
  const [preview, setPreview] = useState<Version | null>(null);

  const buildQuery = useCallback((o: Record<string, unknown> = {}) => {
    const p = new URLSearchParams();
    const s = (o.filterStatus ?? filterStatus) as string;
    const t = (o.filterType ?? filterType) as string;
    if (s) p.set('status', s);
    if (t) p.set('entityType', t);
    p.set('page', String((o.page ?? page) as number));
    p.set('limit', '25');
    return p.toString();
  }, [filterStatus, filterType, page]);

  const fetchVersions = useCallback(async (o: Record<string, unknown> = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/curriculum/versions?${buildQuery(o)}`);
      if (!res.ok) throw new Error('Failed to load review queue');
      const data = await res.json();
      setVersions(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchVersions();
    const authToken = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
    if (authToken) {
      fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      }).then(r => r.json()).then(d => setUserRole(d?.data?.role ?? null)).catch(() => null);
    }
  }, [fetchVersions]);

  const handleReview = async () => {
    if (!reviewing || !decision) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/curriculum/versions/${reviewing.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comment: reviewComment }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setReviewing(null);
      setDecision(null);
      setReviewComment('');
      fetchVersions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Review failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!publishing) return;
    try {
      setPublishLoading(true);
      const res = await fetch(`/api/admin/curriculum/versions/${publishing.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      setPublishing(null);
      fetchVersions({ filterStatus: 'APPROVED' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishLoading(false);
    }
  };

  const pendingCount = filterStatus === 'PENDING_REVIEW' ? pagination.total : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <MessageSquare className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Review Queue</h1>
            <p className="text-gray-400 mt-1">
              {pendingCount !== null && pendingCount > 0
                ? <span className="text-amber-400 font-semibold">{pendingCount} pending review{pendingCount !== 1 ? 's' : ''}</span>
                : 'Curriculum change approvals & version history'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => fetchVersions()}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {['PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map(s => {
          const style = STATUS_STYLES[s];
          const isActive = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1); fetchVersions({ filterStatus: s, page: 1 }); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                isActive ? `${style.bg} ${style.text} border-current` : 'bg-dark-700 text-gray-400 border-dark-600 hover:border-dark-400'
              }`}
            >
              {style.icon}
              {s.replace(/_/g, ' ')}
            </button>
          );
        })}
        <div className="flex items-center gap-2 ml-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white"
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(1); fetchVersions({ filterType: e.target.value, page: 1 }); }}>
            <option value="">All Types</option>
            {['FRAMEWORK', 'MODULE', 'LESSON', 'ACTIVITY'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-2"><AlertCircle className="w-4 h-4 text-danger-400" /><p className="text-danger-300 text-sm">{error}</p></div>
        </Card>
      )}

      {loading ? (
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-500 mx-auto animate-spin mb-2" />
          <p className="text-gray-400">Loading versions…</p>
        </Card>
      ) : versions.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
          <p className="text-gray-400">
            {filterStatus === 'PENDING_REVIEW' ? 'No pending reviews — all clear!' : `No ${filterStatus.toLowerCase().replace(/_/g, ' ')} versions`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {versions.map(version => {
            const style = STATUS_STYLES[version.status] ?? STATUS_STYLES.DRAFT;
            const isPending = version.status === 'PENDING_REVIEW';
            const isApproved = version.status === 'APPROVED';
            const isAdmin = userRole === 'ADMIN';

            return (
              <Card key={version.id} className={`border ${style.bg}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${style.bg} ${style.text} flex-shrink-0 mt-0.5`}>
                        {ENTITY_ICONS[version.entityType] ?? <BookOpen className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
                            {version.entityType}
                          </span>
                          <span className="text-gray-600">·</span>
                          <span className="text-xs text-gray-400">v{version.versionNumber}</span>
                          <span className="text-gray-600">·</span>
                          <span className={`flex items-center gap-1 text-xs font-semibold ${style.text}`}>
                            {style.icon} {version.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="font-semibold text-white mt-1 line-clamp-1">
                          {(version.content as Record<string, unknown>)?.title as string ?? `Entity ${version.entityId.slice(0, 8)}…`}
                        </p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span>By</span>
                            <span className="text-white font-medium">{version.author.firstName} {version.author.lastName}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(version.createdAt).toLocaleString()}
                          </div>
                          {version.approvalRequest?.requestedAt && (
                            <div className="text-xs text-amber-400">
                              Submitted {new Date(version.approvalRequest.requestedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                        {version.changeNotes && (
                          <div className="mt-2 px-3 py-2 rounded-lg bg-dark-700/60 text-xs text-gray-300">
                            <span className="font-semibold text-gray-400">Change notes: </span>{version.changeNotes}
                          </div>
                        )}
                        {version.approvalRequest?.requestNotes && (
                          <div className="mt-2 px-3 py-2 rounded-lg bg-amber-500/10 text-xs text-amber-200">
                            <span className="font-semibold">Submitter notes: </span>{version.approvalRequest.requestNotes}
                          </div>
                        )}
                        {version.reviewerComment && (
                          <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${version.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-200' : 'bg-gray-700/60 text-gray-300'}`}>
                            <span className="font-semibold">Reviewer: </span>{version.reviewerComment}
                            {version.reviewer && <span className="text-gray-400"> — {version.reviewer.firstName} {version.reviewer.lastName}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
                        title="Preview content"
                        onClick={() => setPreview(version)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isAdmin && isPending && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => { setReviewing(version); setDecision('APPROVE'); setReviewComment(''); }}
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10"
                            onClick={() => { setReviewing(version); setDecision('REJECT'); setReviewComment(''); }}
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                        </>
                      )}

                      {isAdmin && isApproved && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-2"
                          onClick={() => setPublishing(version)}
                        >
                          <Globe className="w-4 h-4" /> Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Card className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1}
                  onClick={() => { const p = page - 1; setPage(p); fetchVersions({ page: p }); }}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-white px-2">{pagination.page} / {pagination.pages}</span>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages}
                  onClick={() => { const p = page + 1; setPage(p); fetchVersions({ page: p }); }}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Review Decision Modal */}
      {reviewing && decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${decision === 'APPROVE' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                {decision === 'APPROVE'
                  ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                  : <XCircle className="w-6 h-6 text-red-400" />
                }
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {decision === 'APPROVE' ? 'Approve Version' : 'Reject Version'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {(reviewing.content as Record<string, unknown>)?.title as string} · v{reviewing.versionNumber}
                </p>
              </div>
            </div>

            {decision === 'APPROVE' ? (
              <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
                Approving will allow this version to be published to production. You can add an optional comment.
              </div>
            ) : (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                Rejecting will move this version back to Draft status. The author will need to revise and resubmit. Please leave a comment explaining the reason.
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">
                Comment {decision === 'REJECT' ? <span className="text-red-400">*</span> : <span className="text-gray-500 font-normal">(optional)</span>}
              </label>
              <textarea
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder={decision === 'REJECT' ? 'Explain what needs to be corrected…' : 'Optional feedback for the author…'}
                required={decision === 'REJECT'}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setReviewing(null); setDecision(null); }} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant={decision === 'APPROVE' ? 'primary' : 'danger'}
                className={`gap-2 ${decision === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                onClick={handleReview}
                disabled={submitting || (decision === 'REJECT' && !reviewComment.trim())}
              >
                {submitting && <Loader className="w-4 h-4 animate-spin" />}
                {decision === 'APPROVE' ? 'Approve' : 'Reject & Return'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Publish Confirm Modal */}
      {publishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/20">
                <Globe className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Publish to Live</h2>
                <p className="text-sm text-gray-400">This will update the live curriculum</p>
              </div>
            </div>
            <div className="px-4 py-3 rounded-lg bg-primary-500/10 border border-primary-500/20 text-sm text-primary-200">
              Publishing <span className="font-semibold text-white">
                {(publishing.content as Record<string, unknown>)?.title as string}
              </span> will apply this version&apos;s content snapshot to the live {publishing.entityType.toLowerCase()} immediately. All learners will see the updated content.
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPublishing(null)} disabled={publishLoading}>Cancel</Button>
              <Button variant="primary" onClick={handlePublish} disabled={publishLoading} className="gap-2">
                {publishLoading && <Loader className="w-4 h-4 animate-spin" />}
                <Globe className="w-4 h-4" /> Publish Now
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Content Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Content Preview</h2>
                <p className="text-sm text-gray-400">{preview.entityType} · v{preview.versionNumber}</p>
              </div>
              <button onClick={() => setPreview(null)} className="p-2 rounded-lg hover:bg-dark-600">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="bg-dark-800 rounded-lg p-4">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto font-mono">
                {JSON.stringify(preview.content, null, 2)}
              </pre>
            </div>
            {preview.changeNotes && (
              <div>
                <p className="text-sm font-semibold text-gray-400 mb-1">Change Notes</p>
                <p className="text-sm text-gray-300">{preview.changeNotes}</p>
              </div>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Authored by {preview.author.firstName} {preview.author.lastName} ({preview.author.email})</span>
              <span>·</span>
              <span>{new Date(preview.createdAt).toLocaleString()}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
