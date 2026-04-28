"use client";

import { useEffect, useMemo, useState } from "react";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";

type LiveSessionSummary = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  sessionType: string;
  hasPolls: boolean;
  hasQandA: boolean;
  breakoutGroups: number;
  meetingUrl?: string;
  attendanceSummary: {
    totalTracked: number;
    attended: number;
    attendanceRate: number;
  };
};

type LiveSessionDetails = {
  session: {
    id: string;
    title: string;
    status: string;
    meetingUrl?: string;
    recordingUrl?: string;
    hasPolls: boolean;
    hasQandA: boolean;
    breakoutGroups: number;
  };
  sequence: Array<{ key: string; label: string }>;
  currentStepKey: string;
  facilitatorNotes: string;
  assignmentReminder: string;
  incidents: Array<{ id: string; note: string; severity: "LOW" | "MEDIUM" | "HIGH"; createdAt: string }>;
  learners: Array<{
    userId: string;
    name: string;
    participationScore: number;
    attendance: { attended: boolean; attendanceMinutes: number };
  }>;
  summary: { averageParticipation: number };
};

type Poll = {
  id: string;
  question: string;
  options: string[];
  status: string;
  allowMultiple: boolean;
  totalResponses: number;
  tally: Record<string, number>;
};

type QaQuestion = {
  id: string;
  questionText: string;
  authorLabel: string;
  status: string;
  isPinned: boolean;
  answerText: string | null;
  upvotes: number;
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

type PanelTab = "sequence" | "attendance" | "polls" | "qa" | "breakouts" | "incidents" | "replay";

interface Props {
  classroomId: string;
}

export default function LiveClassroomOpsPanel({ classroomId }: Props) {
  const [sessions, setSessions] = useState<LiveSessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [details, setDetails] = useState<LiveSessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newIncident, setNewIncident] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>("sequence");

  // Polls state
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState("Option A\nOption B");
  const [newPollMultiple, setNewPollMultiple] = useState(false);

  // Q&A state
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});

  // Breakout state
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
  const [breakoutDraft, setBreakoutDraft] = useState<
    Array<{ roomName: string; topic: string; memberUserIds: string[] }>
  >([{ roomName: "Room 1", topic: "", memberUserIds: [] }]);

  const authHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadSessions = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/facilitator/live-classroom/sessions?courseId=${classroomId}`, {
        headers: authHeader(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to fetch sessions");

      const list: LiveSessionSummary[] = json.data || [];
      setSessions(list);
      if (list.length > 0) {
        setSelectedSessionId((prev) => prev || list[0].id);
      } else {
        setSelectedSessionId("");
        setDetails(null);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (sessionId: string) => {
    if (!sessionId) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/facilitator/live-classroom/sessions/${sessionId}`, {
        headers: authHeader(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to fetch session details");
      setDetails(json.data);
      setRecordingUrl(json.data?.session?.recordingUrl || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load details");
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPolls = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/facilitator/live-classroom/sessions/${sessionId}/polls`, {
        headers: authHeader(),
      });
      const json = await res.json();
      if (res.ok) setPolls(json.data || []);
    } catch {}
  };

  const loadQuestions = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/facilitator/live-classroom/sessions/${sessionId}/questions`, {
        headers: authHeader(),
      });
      const json = await res.json();
      if (res.ok) setQuestions(json.data || []);
    } catch {}
  };

  const loadBreakouts = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/facilitator/live-classroom/sessions/${sessionId}/breakouts`, {
        headers: authHeader(),
      });
      const json = await res.json();
      if (res.ok) setBreakoutRooms(json.data || []);
    } catch {}
  };

  useEffect(() => {
    loadSessions();
  }, [classroomId]);

  useEffect(() => {
    if (selectedSessionId) {
      loadDetails(selectedSessionId);
      loadPolls(selectedSessionId);
      loadQuestions(selectedSessionId);
      loadBreakouts(selectedSessionId);
    }
  }, [selectedSessionId]);

  const orderedLearners = useMemo(() => {
    return [...(details?.learners || [])].sort((a, b) => b.participationScore - a.participationScore);
  }, [details]);

  const updateSession = async (payload: Record<string, unknown>) => {
    if (!selectedSessionId) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/facilitator/live-classroom/sessions/${selectedSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to update session");
      await loadDetails(selectedSessionId);
      await loadSessions();
      setMessage("Session updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const saveAttendance = async () => {
    if (!selectedSessionId || !details) return;
    setSaving(true);
    setMessage(null);
    try {
      const records = details.learners.map((learner) => ({
        userId: learner.userId,
        attended: learner.attendance.attended,
        attendanceMinutes: learner.attendance.attendanceMinutes,
      }));
      const response = await fetch(
        `/api/facilitator/live-classroom/sessions/${selectedSessionId}/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ records }),
        }
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to save attendance");
      await loadDetails(selectedSessionId);
      await loadSessions();
      setMessage("Attendance saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Attendance update failed");
    } finally {
      setSaving(false);
    }
  };

  const addIncident = async () => {
    if (!selectedSessionId || !newIncident.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/facilitator/live-classroom/sessions/${selectedSessionId}/incident`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ note: newIncident, severity: "MEDIUM" }),
        }
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to save incident");
      setNewIncident("");
      await loadDetails(selectedSessionId);
      setMessage("Incident note logged");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Incident save failed");
    } finally {
      setSaving(false);
    }
  };

  const publishReplay = async () => {
    if (!selectedSessionId || !recordingUrl.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/facilitator/live-classroom/sessions/${selectedSessionId}/replay/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ recordingUrl }),
        }
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to publish replay");
      await loadDetails(selectedSessionId);
      await loadSessions();
      setMessage("Replay published");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Replay publish failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Polls ──────────────────────────────────────────────────────────────

  const createPoll = async () => {
    if (!selectedSessionId || !newPollQuestion.trim()) return;
    const options = newPollOptions.split("\n").map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) {
      setMessage("Provide at least 2 options (one per line)");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/facilitator/live-classroom/sessions/${selectedSessionId}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ question: newPollQuestion, options, allowMultiple: newPollMultiple }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create poll");
      setNewPollQuestion("");
      setNewPollOptions("Option A\nOption B");
      setNewPollMultiple(false);
      await loadPolls(selectedSessionId);
      setMessage("Poll created");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create poll");
    } finally {
      setSaving(false);
    }
  };

  const pollAction = async (pollId: string, action: "LAUNCH" | "CLOSE") => {
    if (!selectedSessionId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/facilitator/live-classroom/sessions/${selectedSessionId}/polls/${pollId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ action }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await loadPolls(selectedSessionId);
      setMessage(`Poll ${action === "LAUNCH" ? "launched" : "closed"}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Q&A ──────────────────────────────────────────────────────────────

  const questionAction = async (questionId: string, action: string, extra?: Record<string, unknown>) => {
    if (!selectedSessionId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/facilitator/live-classroom/sessions/${selectedSessionId}/questions/${questionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ action, ...extra }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await loadQuestions(selectedSessionId);
      setMessage("Q&A updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Breakouts ──────────────────────────────────────────────────────────

  const createBreakouts = async () => {
    if (!selectedSessionId) return;
    const validRooms = breakoutDraft.filter((r) => r.roomName.trim());
    if (validRooms.length === 0) {
      setMessage("Add at least one room");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/facilitator/live-classroom/sessions/${selectedSessionId}/breakouts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ rooms: validRooms }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await loadBreakouts(selectedSessionId);
      setMessage(`${json.data?.length} breakout room(s) created`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Breakout creation failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Rendering ──────────────────────────────────────────────────────────

  const TABS: { key: PanelTab; label: string }[] = [
    { key: "sequence", label: "Sequence" },
    { key: "attendance", label: "Attendance" },
    { key: "polls", label: "Polls" },
    { key: "qa", label: "Q&A" },
    { key: "breakouts", label: "Breakouts" },
    { key: "incidents", label: "Incidents" },
    { key: "replay", label: "Replay" },
  ];

  if (loading && sessions.length === 0) {
    return <div className="text-sm text-gray-600">Loading live classroom framework...</div>;
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Classroom Framework</h3>
        <div className="flex items-center gap-2">
          {selectedSession?.meetingUrl && (
            <a
              href={selectedSession.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Join Meeting ↗
            </a>
          )}
          <select
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {sessions.map((session) => (
              <option value={session.id} key={session.id}>
                {session.title} ({session.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message ? <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p> : null}

      {!details ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
          No live session selected or available for this classroom yet.
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500">Avg. participation</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{details.summary.averageParticipation}%</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500">Attendance</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {orderedLearners.filter((l) => l.attendance.attended).length}/{orderedLearners.length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500">Polls</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{polls.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500">Questions</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {questions.filter((q) => q.status === "OPEN").length} open
              </p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-1 border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                  activeTab === tab.key
                    ? "border border-b-white border-gray-200 bg-white text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── SEQUENCE TAB ── */}
          {activeTab === "sequence" && (
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">Session sequence control</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {details.sequence.map((step) => (
                  <button
                    key={step.key}
                    onClick={() => updateSession({ currentStepKey: step.key })}
                    disabled={saving}
                    className={`rounded-lg border px-3 py-2 text-left text-sm ${
                      step.key === details.currentStepKey
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Current step:{" "}
                <span className="font-semibold">
                  {details.sequence.find((s) => s.key === details.currentStepKey)?.label || "Not set"}
                </span>
              </p>
            </div>
          )}

          {/* ── ATTENDANCE TAB ── */}
          {activeTab === "attendance" && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Attendance tracker</p>
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Save attendance
                </button>
              </div>
              <div className="space-y-2">
                {orderedLearners.map((learner) => (
                  <div
                    key={learner.userId}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 p-3 md:grid-cols-4"
                  >
                    <p className="text-sm font-medium text-gray-900">{learner.name}</p>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={learner.attendance.attended}
                        onChange={(e) => {
                          if (!details) return;
                          const updated = details.learners.map((item) =>
                            item.userId === learner.userId
                              ? { ...item, attendance: { ...item.attendance, attended: e.target.checked } }
                              : item
                          );
                          setDetails({ ...details, learners: updated });
                        }}
                      />
                      Present
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={learner.attendance.attendanceMinutes}
                      onChange={(e) => {
                        if (!details) return;
                        const minutes = Math.max(0, Number(e.target.value) || 0);
                        const updated = details.learners.map((item) =>
                          item.userId === learner.userId
                            ? { ...item, attendance: { ...item.attendance, attendanceMinutes: minutes } }
                            : item
                        );
                        setDetails({ ...details, learners: updated });
                      }}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                      placeholder="Minutes"
                    />
                    <p className="text-sm font-semibold text-gray-700">
                      Engagement {learner.participationScore}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── POLLS TAB ── */}
          {activeTab === "polls" && (
            <div className="space-y-4">
              {/* Create poll */}
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-900">Create a poll</p>
                <input
                  value={newPollQuestion}
                  onChange={(e) => setNewPollQuestion(e.target.value)}
                  placeholder="Poll question"
                  className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <textarea
                  value={newPollOptions}
                  onChange={(e) => setNewPollOptions(e.target.value)}
                  placeholder="One option per line"
                  className="mb-2 h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={newPollMultiple}
                    onChange={(e) => setNewPollMultiple(e.target.checked)}
                  />
                  Allow multiple selections
                </label>
                <button
                  onClick={createPoll}
                  disabled={saving || !newPollQuestion.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Create poll
                </button>
              </div>

              {/* Existing polls */}
              {polls.length === 0 ? (
                <p className="text-sm text-gray-500">No polls created yet.</p>
              ) : (
                <div className="space-y-3">
                  {polls.map((poll) => (
                    <div key={poll.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{poll.question}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            poll.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : poll.status === "CLOSED"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {poll.status}
                        </span>
                      </div>
                      <p className="mb-2 text-xs text-gray-500">{poll.totalResponses} responses</p>
                      {/* Results */}
                      <div className="mb-3 space-y-1">
                        {poll.options.map((opt) => {
                          const count = poll.tally[opt] ?? 0;
                          const pct =
                            poll.totalResponses > 0
                              ? Math.round((count / poll.totalResponses) * 100)
                              : 0;
                          return (
                            <div key={opt}>
                              <div className="flex justify-between text-xs text-gray-700">
                                <span>{opt}</span>
                                <span>{count} ({pct}%)</span>
                              </div>
                              <div className="mt-0.5 h-2 w-full rounded-full bg-gray-100">
                                <div
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        {poll.status === "DRAFT" && (
                          <button
                            onClick={() => pollAction(poll.id, "LAUNCH")}
                            disabled={saving}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                          >
                            Launch
                          </button>
                        )}
                        {poll.status === "ACTIVE" && (
                          <button
                            onClick={() => pollAction(poll.id, "CLOSE")}
                            disabled={saving}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                          >
                            Close poll
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Q&A TAB ── */}
          {activeTab === "qa" && (
            <div className="space-y-3">
              {questions.length === 0 ? (
                <p className="text-sm text-gray-500">No questions submitted yet.</p>
              ) : (
                questions.map((q) => (
                  <div
                    key={q.id}
                    className={`rounded-lg border p-4 ${
                      q.isPinned ? "border-blue-300 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div>
                        {q.isPinned && (
                          <span className="mb-1 mr-2 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                            Pinned
                          </span>
                        )}
                        <p className="text-sm text-gray-900">{q.questionText}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {q.authorLabel} · {q.upvotes} upvote{q.upvotes !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          q.status === "ANSWERED"
                            ? "bg-green-100 text-green-800"
                            : q.status === "DISMISSED"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-yellow-100 text-yellow-800"
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

                    {q.status === "OPEN" && (
                      <div className="mt-2">
                        <textarea
                          value={answerDraft[q.id] ?? ""}
                          onChange={(e) =>
                            setAnswerDraft((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder="Type your answer…"
                          className="mb-1 h-16 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              questionAction(q.id, "ANSWER", { answerText: answerDraft[q.id] })
                            }
                            disabled={saving || !answerDraft[q.id]?.trim()}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                          >
                            Answer
                          </button>
                          <button
                            onClick={() => questionAction(q.id, q.isPinned ? "UNPIN" : "PIN")}
                            disabled={saving}
                            className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-700"
                          >
                            {q.isPinned ? "Unpin" : "Pin"}
                          </button>
                          <button
                            onClick={() => questionAction(q.id, "DISMISS")}
                            disabled={saving}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── BREAKOUTS TAB ── */}
          {activeTab === "breakouts" && (
            <div className="space-y-4">
              {/* Existing rooms */}
              {breakoutRooms.length > 0 && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-900">Active breakout rooms</p>
                  <div className="space-y-2">
                    {breakoutRooms.filter((r) => r.isActive).map((room) => (
                      <div key={room.id} className="rounded-lg border border-gray-100 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{room.roomName}</p>
                          {room.meetingUrl && (
                            <a
                              href={room.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 underline"
                            >
                              Join ↗
                            </a>
                          )}
                        </div>
                        {room.topic && (
                          <p className="mt-0.5 text-xs text-gray-500">Topic: {room.topic}</p>
                        )}
                        <p className="mt-0.5 text-xs text-gray-500">
                          {room.memberUserIds.length} member(s) assigned
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create / update rooms */}
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-900">
                  {breakoutRooms.length > 0 ? "Reconfigure breakout rooms" : "Create breakout rooms"}
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  Defining rooms will deactivate existing rooms and create new ones. Zoom sub-meetings
                  are created automatically when Zoom is configured.
                </p>

                <div className="space-y-2">
                  {breakoutDraft.map((room, idx) => (
                    <div key={idx} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 p-3 md:grid-cols-2">
                      <input
                        value={room.roomName}
                        onChange={(e) => {
                          const updated = [...breakoutDraft];
                          updated[idx] = { ...room, roomName: e.target.value };
                          setBreakoutDraft(updated);
                        }}
                        placeholder="Room name"
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      />
                      <input
                        value={room.topic}
                        onChange={(e) => {
                          const updated = [...breakoutDraft];
                          updated[idx] = { ...room, topic: e.target.value };
                          setBreakoutDraft(updated);
                        }}
                        placeholder="Topic (optional)"
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() =>
                      setBreakoutDraft((prev) => [
                        ...prev,
                        { roomName: `Room ${prev.length + 1}`, topic: "", memberUserIds: [] },
                      ])
                    }
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                  >
                    + Add room
                  </button>
                  {breakoutDraft.length > 1 && (
                    <button
                      onClick={() => setBreakoutDraft((prev) => prev.slice(0, -1))}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600"
                    >
                      Remove last
                    </button>
                  )}
                  <button
                    onClick={createBreakouts}
                    disabled={saving}
                    className="ml-auto rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {saving ? "Creating…" : "Create rooms"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── INCIDENTS TAB ── */}
          {activeTab === "incidents" && (
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Incident and safeguarding notes</p>
              <textarea
                value={newIncident}
                onChange={(e) => setNewIncident(e.target.value)}
                placeholder="Capture incident, safeguarding concern, or escalation note"
                className="h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={addIncident}
                disabled={saving || !newIncident.trim()}
                className="mt-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Save incident note
              </button>
              <div className="mt-3 space-y-2">
                {details.incidents.slice(0, 10).map((incident) => (
                  <div
                    key={incident.id}
                    className="rounded border border-amber-100 bg-amber-50 p-2 text-xs text-amber-900"
                  >
                    <p className="font-semibold">{incident.severity}</p>
                    <p>{incident.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REPLAY TAB ── */}
          {activeTab === "replay" && (
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Replay publishing workflow</p>
              <input
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                placeholder="https://replay-url"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={publishReplay}
                disabled={saving || !recordingUrl.trim()}
                className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Publish replay
              </button>
              <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
                <p>Paste the Zoom, YouTube, or Loom recording URL above and click Publish.</p>
                <p className="mt-1">
                  Students will see the replay link on their course dashboard after publishing.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
