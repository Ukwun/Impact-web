'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  BookOpen, Edit, Save, X, Loader, AlertCircle, ChevronDown, ChevronUp,
  Users, Layers, Target, Clock, CheckCircle, Shield
} from 'lucide-react';

interface Framework {
  id: string;
  level: string;
  name: string;
  description: string | null;
  signatureShift: string;
  primaryOutcome: string;
  minAge: number;
  maxAge: number;
  durationWeeks: number;
  learningObjectives: string[];
  competencyAreas: string[];
  assessmentMethods: string[];
  _count: { modules: number };
}

const LEVEL_COLORS: Record<string, string> = {
  PRIMARY: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  JUNIOR_SECONDARY: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  SENIOR_SECONDARY: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  IMPACTUNI: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
};

const LEVEL_LABELS: Record<string, string> = {
  PRIMARY: 'Primary (Ages 7–11)',
  JUNIOR_SECONDARY: 'Junior Secondary (Ages 12–14)',
  SENIOR_SECONDARY: 'Senior Secondary (Ages 15–18)',
  IMPACTUNI: 'ImpactUni (Ages 18+)',
};

export default function AdminFrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editDraft, setEditDraft] = useState<Partial<Framework>>({});
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchFrameworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/curriculum/frameworks');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load frameworks');
      }
      const data = await res.json();
      setFrameworks(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFrameworks();
    // Get role from JWT payload via the /api/auth/me or similar; use cookie parse as fallback
    fetch('/api/auth/me').then(r => r.json()).then(d => setUserRole(d?.data?.role ?? null)).catch(() => null);
  }, [fetchFrameworks]);

  const startEdit = (fw: Framework) => {
    setEditingId(fw.id);
    setEditDraft({
      name: fw.name,
      description: fw.description ?? '',
      signatureShift: fw.signatureShift,
      primaryOutcome: fw.primaryOutcome,
      durationWeeks: fw.durationWeeks,
      learningObjectives: fw.learningObjectives,
      competencyAreas: fw.competencyAreas,
      assessmentMethods: fw.assessmentMethods,
    });
    setExpandedId(fw.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/curriculum/frameworks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editDraft }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      const data = await res.json();
      setFrameworks(prev => prev.map(f => f.id === id ? { ...f, ...data.data } : f));
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = userRole === 'ADMIN';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <BookOpen className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Curriculum Frameworks</h1>
              <p className="text-gray-400 mt-1">NCDF learning level definitions and pedagogical structures</p>
            </div>
          </div>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">View only — Framework editing requires Admin access</span>
          </div>
        )}
      </div>

      {error && (
        <Card className="p-6 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5 flex-shrink-0" />
            <p className="text-danger-300">{error}</p>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map(fw => (
          <Card key={fw.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${LEVEL_COLORS[fw.level] ?? ''}`}>
                {fw.level.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-2xl font-black text-white">{fw._count.modules}</p>
            <p className="text-xs text-gray-400 mt-1">modules</p>
          </Card>
        ))}
      </div>

      {/* Framework Cards */}
      <div className="space-y-4">
        {frameworks.map((fw) => {
          const isEditing = editingId === fw.id;
          const isExpanded = expandedId === fw.id;

          return (
            <Card key={fw.id} className="overflow-hidden">
              {/* Card Header */}
              <div className="p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${LEVEL_COLORS[fw.level] ?? ''}`}>
                      {LEVEL_LABELS[fw.level] ?? fw.level}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-white">{fw.name}</h2>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{fw.signatureShift}</p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>Ages {fw.minAge}–{fw.maxAge}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{fw.durationWeeks} weeks</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Layers className="w-4 h-4" />
                        <span>{fw._count.modules} modules</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isAdmin && !isEditing && (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => startEdit(fw)}>
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button variant="primary" size="sm" className="gap-2" onClick={() => saveEdit(fw.id)} disabled={saving}>
                        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <button
                    className="p-2 rounded-lg hover:bg-dark-600 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : fw.id)}
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-dark-600 p-6 space-y-6 bg-dark-800/50">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-1">Framework Name</label>
                          <Input
                            value={editDraft.name ?? ''}
                            onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-1">Duration (weeks)</label>
                          <Input
                            type="number"
                            value={editDraft.durationWeeks ?? fw.durationWeeks}
                            onChange={e => setEditDraft(d => ({ ...d, durationWeeks: parseInt(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Signature Pedagogical Shift</label>
                        <textarea
                          className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={2}
                          value={editDraft.signatureShift ?? ''}
                          onChange={e => setEditDraft(d => ({ ...d, signatureShift: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Primary Outcome</label>
                        <textarea
                          className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={2}
                          value={editDraft.primaryOutcome ?? ''}
                          onChange={e => setEditDraft(d => ({ ...d, primaryOutcome: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Description</label>
                        <textarea
                          className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={3}
                          value={editDraft.description ?? ''}
                          onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">
                          Learning Objectives <span className="text-gray-500 font-normal">(one per line)</span>
                        </label>
                        <textarea
                          className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={4}
                          value={(editDraft.learningObjectives ?? fw.learningObjectives).join('\n')}
                          onChange={e => setEditDraft(d => ({
                            ...d,
                            learningObjectives: e.target.value.split('\n').filter(Boolean),
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">
                          Competency Areas <span className="text-gray-500 font-normal">(one per line)</span>
                        </label>
                        <textarea
                          className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={4}
                          value={(editDraft.competencyAreas ?? fw.competencyAreas).join('\n')}
                          onChange={e => setEditDraft(d => ({
                            ...d,
                            competencyAreas: e.target.value.split('\n').filter(Boolean),
                          }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Primary Outcome
                          </h3>
                          <p className="text-white">{fw.primaryOutcome}</p>
                        </div>
                        {fw.description && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-300 text-sm">{fw.description}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Assessment Methods</h3>
                          <ul className="space-y-1">
                            {fw.assessmentMethods.map((m, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Learning Objectives</h3>
                          <ul className="space-y-1.5">
                            {fw.learningObjectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Competency Areas</h3>
                          <div className="flex flex-wrap gap-2">
                            {fw.competencyAreas.map((area, i) => (
                              <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-dark-600 text-gray-300">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
