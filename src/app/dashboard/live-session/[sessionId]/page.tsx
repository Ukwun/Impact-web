'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_TOKEN_KEY } from '@/lib/authStorage';

// ── Types ────────────────────────────────────────────────────────────────

type SessionInfo = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  meetingUrl: string | null;
  recordingUrl: string | null;
  hasPolls: boolean;
  hasQandA: boolean;
  breakoutGroups: number;
  startTime: string;
  endTime: string;
  courseTitle: string;
};

type Poll = {
  id: string;
  question: string;
  options: string[];
  status: string;
  allowMultiple: boolean;
  totalResponses: number;
  tally: Record<string, number>;
  myResponse: string[] | null;
};

type QaQuestion = {
  id: string;
  questionText: string;
  authorLabel: string;
  status: string;
  isPinned: boolean;
  answerText: string | null;
  upvotes: number;
  isMine: boolean;
  createdAt: string;
};

type BreakoutRoom = {
  id: string;
  roomName: string;
  meetingUrl: string | null;
  memberUserIds: string[];
  topic: string | null;
  isActive: boolean;
};

type Tab = 'session' | 'polls' | 'qa' | 'breakout';

// ── Component ────────────────────────────────────────────────────────────

export default function StudentLiveSessionPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('session');

  // Poll responses
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [pollMsg, setPollMsg] = useState<string | null>(null);

  // Q&A
  const [questionDraft, setQuestionDraft] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [qaMsg, setQaMsg] = useState<string | null>(null);

  const authHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAll = useCallback(async () => {
    if (!sessionId) return;
    try {
      const [sessionRes, pollsRes, questionsRes, breakoutsRes] = await Promise.all([
        fetch(`/api/facilitator/live-classroom/sessions/${sessionId}`, { headers: authHeader() }),
        fetch(`/api/facilitator/live-classroom/sessions/${sessionId}/polls`, { headers: authHeader() }),
        fetch(`/api/facilitator/live-classroom/sessions/${sessionId}/questions`, { headers: authHeader() }),
        fetch(`/api/facilitator/live-classroom/sessions/${sessionId}/breakouts`, { headers: authHeader() }),
      ]);

      if (!sessionRes.ok) throw new Error('Session not found or access denied');

      const sessionJson = await sessionRes.json();
      const pollsJson = pollsRes.ok ? await pollsRes.json() : { data: [] };
      const questionsJson = questionsRes.ok ? await questionsRes.json() : { data: [] };
      const breakoutsJson = breakoutsRes.ok ? await breakoutsRes.json() : { data: [] };

      setSession(sessionJson.data?.session ?? sessionJson.data);
      setPolls(pollsJson.data || []);
      setQuestions(questionsJson.data || []);
      setBreakoutRooms((breakoutsJson.data || []).filter((r: BreakoutRoom) => r.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!authLoading) fetchAll();
  }, [authLoading, fetchAll]);

  // Auto-refresh every 30 s to pick up new polls / questions
  useEffect(() => {
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const respondToPoll = async (pollId: string) => {
    const chosen = selectedOptions[pollId];
    if (!chosen || chosen.length === 0) return;
    setPollMsg(null);
    try {
      const res = await fetch(
        `/api/facilitator/live-classroom/sessions/${sessionId}/polls/${pollId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ action: 'RESPOND', selectedOptions: chosen }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPollMsg('Response submitted!');
      await fetchAll();
    } catch (err) {
      setPollMsg(err instanceof Error ? err.message : 'Failed to submit response');
    }
  };

  const submitQuestion = async () => {
    if (!questionDraft.trim()) return;
    setQaMsg(null);
    try {
      const res = await fetch(
        `/api/facilitator/live-classroom/sessions/${sessionId}/questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ questionText: questionDraft, isAnonymous }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setQuestionDraft('');
      setQaMsg('Question submitted!');
      await fetchAll();
    } catch (err) {
      setQaMsg(err instanceof Error ? err.message : 'Failed to submit question');
    }
  };

  const upvoteQuestion = async (questionId: string) => {
    try {
      await fetch(
        `/api/facilitator/live-classroom/sessions/${sessionId}/questions/${questionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ action: 'UPVOTE' }),
        }
      );
      await fetchAll();
    } catch {}
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading session…</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-red-600">{error || 'Session not found'}</p>
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const myBreakoutRoom = breakoutRooms.find(
    (r) => r.memberUserIds.includes(user?.id ?? '')
  );

  const TABS: { key: Tab; label: string; show: boolean }[] = [
    { key: 'session', label: 'Session', show: true },
    { key: 'polls', label: `Polls (${polls.filter((p) => p.status === 'ACTIVE').length})`, show: session.hasPolls },
    { key: 'qa', label: `Q&A (${questions.filter((q) => q.status !== 'DISMISSED').length})`, show: session.hasQandA },
    { key: 'breakout', label: 'My Room', show: !!myBreakoutRoom },
  ].filter((t) => t.show);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs text-gray-500">{session.courseTitle}</p>
          <h1 className="text-lg font-bold text-gray-900">{session.title}</h1>
          <div className="mt-1 flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                session.status === 'LIVE'
                  ? 'bg-green-100 text-green-800'
                  : session.status === 'COMPLETED'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {session.status}
            </span>
            {session.status === 'LIVE' && session.meetingUrl && (
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Join Live Meeting ↗
              </a>
            )}
            {session.status === 'COMPLETED' && session.recordingUrl && (
              <a
                href={session.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Watch Replay ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-4">
        {/* Tab bar */}
        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? 'border border-b-white border-gray-200 bg-white text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SESSION TAB ── */}
        {activeTab === 'session' && (
          <div className="space-y-4">
            {session.description && (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-700">{session.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Start time</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {new Date(session.startTime).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">End time</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {new Date(session.endTime).toLocaleString()}
                </p>
              </div>
            </div>

            {session.status === 'SCHEDULED' && session.meetingUrl && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  The session hasn't started yet. You'll be able to join at the scheduled time.
                </p>
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-blue-600 underline"
                >
                  Save meeting link for later ↗
                </a>
              </div>
            )}

            {session.status === 'COMPLETED' && !session.recordingUrl && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                The replay will be published by your facilitator shortly.
              </div>
            )}
          </div>
        )}

        {/* ── POLLS TAB ── */}
        {activeTab === 'polls' && (
          <div className="space-y-4">
            {pollMsg && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{pollMsg}</p>
            )}
            {polls.filter((p) => p.status !== 'DRAFT').length === 0 ? (
              <p className="text-sm text-gray-500">No active polls at the moment.</p>
            ) : (
              polls
                .filter((p) => p.status !== 'DRAFT')
                .map((poll) => (
                  <div key={poll.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{poll.question}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          poll.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {poll.status}
                      </span>
                    </div>

                    {poll.status === 'ACTIVE' && !poll.myResponse && (
                      <div className="mb-3 space-y-2">
                        {poll.options.map((opt) => (
                          <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                              type={poll.allowMultiple ? 'checkbox' : 'radio'}
                              name={`poll-${poll.id}`}
                              checked={(selectedOptions[poll.id] ?? []).includes(opt)}
                              onChange={(e) => {
                                if (poll.allowMultiple) {
                                  setSelectedOptions((prev) => {
                                    const current = prev[poll.id] ?? [];
                                    return {
                                      ...prev,
                                      [poll.id]: e.target.checked
                                        ? [...current, opt]
                                        : current.filter((o) => o !== opt),
                                    };
                                  });
                                } else {
                                  setSelectedOptions((prev) => ({ ...prev, [poll.id]: [opt] }));
                                }
                              }}
                            />
                            {opt}
                          </label>
                        ))}
                        <button
                          onClick={() => respondToPoll(poll.id)}
                          disabled={!(selectedOptions[poll.id]?.length)}
                          className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Submit
                        </button>
                      </div>
                    )}

                    {poll.myResponse && (
                      <p className="mb-2 text-xs text-green-700">
                        ✓ You responded: {poll.myResponse.join(', ')}
                      </p>
                    )}

                    {/* Results (visible after responding or when closed) */}
                    {(poll.myResponse || poll.status === 'CLOSED') && (
                      <div className="space-y-1">
                        {poll.options.map((opt) => {
                          const count = poll.tally[opt] ?? 0;
                          const pct = poll.totalResponses > 0
                            ? Math.round((count / poll.totalResponses) * 100)
                            : 0;
                          return (
                            <div key={opt}>
                              <div className="flex justify-between text-xs text-gray-700">
                                <span>{opt}</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-gray-100">
                                <div
                                  className="h-2 rounded-full bg-blue-500 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        <p className="mt-1 text-xs text-gray-500">{poll.totalResponses} total response(s)</p>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}

        {/* ── Q&A TAB ── */}
        {activeTab === 'qa' && (
          <div className="space-y-4">
            {/* Ask a question */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Ask a question</p>
              <textarea
                value={questionDraft}
                onChange={(e) => setQuestionDraft(e.target.value)}
                placeholder="Type your question…"
                className="mb-2 h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  Ask anonymously
                </label>
                <button
                  onClick={submitQuestion}
                  disabled={!questionDraft.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
              {qaMsg && <p className="mt-2 text-xs text-green-700">{qaMsg}</p>}
            </div>

            {/* Question list */}
            {questions.filter((q) => q.status !== 'DISMISSED').length === 0 ? (
              <p className="text-sm text-gray-500">No questions yet. Be the first to ask!</p>
            ) : (
              questions
                .filter((q) => q.status !== 'DISMISSED')
                .map((q) => (
                  <div
                    key={q.id}
                    className={`rounded-lg border bg-white p-4 ${
                      q.isPinned ? 'border-blue-300' : 'border-gray-200'
                    }`}
                  >
                    {q.isPinned && (
                      <span className="mb-1 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                        📌 Pinned
                      </span>
                    )}
                    <p className="text-sm text-gray-900">{q.questionText}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <p className="text-xs text-gray-500">{q.authorLabel}</p>
                      <button
                        onClick={() => upvoteQuestion(q.id)}
                        disabled={q.isMine}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 disabled:cursor-default disabled:opacity-50"
                      >
                        ▲ {q.upvotes}
                      </button>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs ${
                          q.status === 'ANSWERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                    {q.answerText && (
                      <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
                        <span className="font-semibold">Answer:</span> {q.answerText}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}

        {/* ── BREAKOUT ROOM TAB ── */}
        {activeTab === 'breakout' && myBreakoutRoom && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 text-center">
            <p className="text-lg font-bold text-purple-900">{myBreakoutRoom.roomName}</p>
            {myBreakoutRoom.topic && (
              <p className="mt-1 text-sm text-purple-700">Topic: {myBreakoutRoom.topic}</p>
            )}
            <p className="mt-1 text-sm text-purple-600">
              {myBreakoutRoom.memberUserIds.length} participant(s) in this room
            </p>
            {myBreakoutRoom.meetingUrl ? (
              <a
                href={myBreakoutRoom.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Join Breakout Room ↗
              </a>
            ) : (
              <p className="mt-4 text-sm text-purple-600">
                Meeting link will be provided by your facilitator.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
