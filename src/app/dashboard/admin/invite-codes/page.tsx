'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  Clock3,
  Copy,
  Loader,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface InviteRecord {
  id: string;
  targetRole: string;
  targetEmail: string | null;
  status: string;
  createdByUserId: string | null;
  createdByEmail: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  usedAt: string | null;
  usedByUserId: string | null;
  usedByEmail: string | null;
  note: string | null;
}

interface IssueResponse {
  inviteId: string;
  inviteCode: string;
  expiresAt: string;
  targetEmail: string | null;
  targetRole: string;
}

function formatCountdown(targetIso: string): string {
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) return 'Invalid time';

  const diff = targetMs - Date.now();
  if (diff <= 0) return 'Expired';

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function statusClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === 'ACTIVE') return 'bg-emerald-50 text-emerald-700';
  if (normalized === 'USED') return 'bg-blue-50 text-blue-700';
  if (normalized === 'REVOKED') return 'bg-amber-50 text-amber-700';
  if (normalized === 'EXPIRED') return 'bg-red-50 text-red-700';
  return 'bg-gray-50 text-gray-700';
}

export default function OwnerAdminCodesPage() {
  const searchParams = useSearchParams();
  const { success, error: toastError, warning, info } = useToast();

  const [records, setRecords] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [note, setNote] = useState('');
  const [showReveal, setShowReveal] = useState(false);
  const [issuedInvite, setIssuedInvite] = useState<IssueResponse | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const defaultTarget = searchParams.get('targetEmail');
    if (defaultTarget) {
      setTargetEmail(defaultTarget);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCount = useMemo(
    () => records.filter((item) => item.status.toUpperCase() === 'ACTIVE').length,
    [records, nowTick]
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch('/api/admin/invite-codes?limit=50', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load invite codes');
      }

      setRecords(payload.data.records || []);
    } catch (err) {
      toastError('Unable to load owner invite codes', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const issueCode = async () => {
    try {
      setIssuing(true);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetEmail: targetEmail.trim().toLowerCase() || undefined,
          expiresInMinutes: expiryMinutes,
          note: note.trim() || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to issue admin code');
      }

      setIssuedInvite(payload.data as IssueResponse);
      setShowReveal(true);
      success('Admin code issued', 'Share it through a secure channel. It will not be shown again after closing this modal.');
      await fetchRecords();
    } catch (err) {
      toastError('Could not issue code', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIssuing(false);
    }
  };

  const copyIssuedCode = async () => {
    if (!issuedInvite?.inviteCode) return;

    try {
      await navigator.clipboard.writeText(issuedInvite.inviteCode);
      success('Code copied', 'Admin invite code copied to clipboard.');
    } catch {
      warning('Clipboard unavailable', 'Copy manually from the modal if clipboard access is blocked.');
    }
  };

  const revokeCode = async (inviteId: string) => {
    try {
      setRevokingId(inviteId);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`/api/admin/invite-codes/${inviteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'REVOKE' }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to revoke code');
      }

      success('Invite revoked', 'The admin invite code has been revoked and can no longer be redeemed.');
      await fetchRecords();
    } catch (err) {
      toastError('Revoke failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRevokingId(null);
    }
  };

  const closeRevealModal = () => {
    setShowReveal(false);
    setIssuedInvite(null);
    info('Code hidden', 'For security, the raw code is no longer visible. Use records for status tracking only.');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-text-500">Issue Admin Code</h1>
          <p className="mt-2 text-gray-300">
            Owner-only control panel for one-time ADMIN invite codes with audit-grade lifecycle tracking.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchRecords}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5 bg-dark-800 border border-dark-600">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-primary-500" size={22} />
            <div>
              <p className="text-sm text-gray-400">Active codes</p>
              <p className="text-2xl font-bold text-text-500">{activeCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-dark-800 border border-dark-600">
          <div className="flex items-center gap-3">
            <KeyRound className="text-secondary-500" size={22} />
            <div>
              <p className="text-sm text-gray-400">Total issued</p>
              <p className="text-2xl font-bold text-text-500">{records.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-dark-800 border border-dark-600">
          <div className="flex items-center gap-3">
            <Clock3 className="text-amber-500" size={22} />
            <div>
              <p className="text-sm text-gray-400">Max expiry policy</p>
              <p className="text-2xl font-bold text-text-500">24h</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-dark-800 border border-dark-600">
        <h2 className="text-xl font-bold text-text-500">Issue One-Time Admin Code</h2>
        <p className="mt-1 text-sm text-gray-400">
          Generate a one-time code bound to ADMIN elevation. Share only through verified owner channels.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Target email (recommended)</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-3.5 text-gray-500" />
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="candidate@institution.edu"
                className="w-full rounded-lg border border-dark-600 bg-dark-700 py-3 pl-10 pr-3 text-text-500 placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Expiry (minutes)</label>
            <input
              type="number"
              min={5}
              max={1440}
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(Math.max(5, Math.min(1440, Number(e.target.value || 30))))}
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-3 text-text-500 placeholder-gray-500 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-300">Owner note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Identity checks completed by owner over verified channel..."
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-3 text-text-500 placeholder-gray-500 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={issueCode} disabled={issuing} className="flex items-center gap-2">
            {issuing ? <Loader size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Issue Admin Code
          </Button>
          <p className="text-xs text-gray-400">The raw code appears once in a secure modal, then is hidden permanently.</p>
        </div>
      </Card>

      <Card className="p-6 bg-dark-800 border border-dark-600">
        <h2 className="text-xl font-bold text-text-500">Invite Code Records</h2>
        <p className="mt-1 text-sm text-gray-400">Track code state, expiry, usage, and revoke active codes instantly.</p>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin text-primary-500" size={28} />
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-lg border border-dashed border-dark-600 p-8 text-center text-gray-400">
            No invite code records yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-dark-600 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Target</th>
                  <th className="px-3 py-3">Expires in</th>
                  <th className="px-3 py-3">Created by</th>
                  <th className="px-3 py-3">Used by</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const status = record.status.toUpperCase();
                  const expiresIn = record.expiresAt ? formatCountdown(record.expiresAt) : 'N/A';
                  const canRevoke = status === 'ACTIVE';

                  return (
                    <tr key={record.id} className="border-b border-dark-700/70 text-sm">
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-text-500">
                        <p className="font-medium">{record.targetRole}</p>
                        <p className="text-xs text-gray-400">{record.targetEmail || 'Any verified claimant'}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock3 size={14} />
                          <span>{expiresIn}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-300">{record.createdByEmail || 'Unknown'}</td>
                      <td className="px-3 py-3 text-gray-300">{record.usedByEmail || '-'}</td>
                      <td className="px-3 py-3">
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={!canRevoke || revokingId === record.id}
                          onClick={() => revokeCode(record.id)}
                          className="flex items-center gap-2"
                        >
                          {revokingId === record.id ? <Loader size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showReveal}
        onClose={closeRevealModal}
        title="One-Time Admin Code"
        size="md"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button variant="outline" onClick={closeRevealModal}>
              Close
            </Button>
            <Button onClick={copyIssuedCode} className="flex items-center gap-2">
              <Copy size={15} />
              Copy code
            </Button>
          </div>
        }
      >
        {issuedInvite ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5" />
                <p>
                  This code is shown once. After this modal closes, only hashed records remain.
                  Share it through a verified secure channel.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-dark-600 bg-dark-800 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Admin invite code</p>
              <p className="font-mono text-2xl font-black tracking-widest text-secondary-500">{issuedInvite.inviteCode}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-dark-600 bg-dark-800 p-3">
                <p className="text-xs text-gray-400">Target email</p>
                <p className="text-sm font-medium text-text-500">{issuedInvite.targetEmail || 'Any matching pending ADMIN user'}</p>
              </div>
              <div className="rounded-lg border border-dark-600 bg-dark-800 p-3">
                <p className="text-xs text-gray-400">Expires in</p>
                <p className="text-sm font-bold text-text-500">{formatCountdown(issuedInvite.expiresAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 size={16} />
              <span>Code issued and audit-logged successfully.</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
