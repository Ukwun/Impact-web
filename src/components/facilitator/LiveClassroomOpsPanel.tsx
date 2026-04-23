"use client";

import { useEffect, useMemo, useState } from "react";

type LiveSessionSummary = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  sessionType: string;
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

  const loadSessions = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/facilitator/live-classroom/sessions?courseId=${classroomId}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to fetch sessions");
      }

      const list: LiveSessionSummary[] = json.data || [];
      setSessions(list);

      if (list.length > 0) {
        setSelectedSessionId((prev) => prev || list[0].id);
      } else {
        setSelectedSessionId("");
        setDetails(null);
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to load sessions";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (sessionId: string) => {
    if (!sessionId) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/facilitator/live-classroom/sessions/${sessionId}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to fetch session details");
      }

      setDetails(json.data);
      setRecordingUrl(json.data?.session?.recordingUrl || "");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to load details";
      setMessage(text);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [classroomId]);

  useEffect(() => {
    if (selectedSessionId) {
      loadDetails(selectedSessionId);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to update session");
      }

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records }),
        }
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to save attendance");
      }

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: newIncident, severity: "MEDIUM" }),
        }
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to save incident");
      }

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordingUrl }),
        }
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to publish replay");
      }

      await loadDetails(selectedSessionId);
      await loadSessions();
      setMessage("Replay published");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Replay publish failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading && sessions.length === 0) {
    return <div className="text-sm text-gray-600">Loading live classroom framework...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Classroom Framework</h3>
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

      {message ? <p className="text-sm text-blue-700">{message}</p> : null}

      {!details ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
          No live session selected or available for this classroom yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Average participation</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{details.summary.averageParticipation}%</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Attendance tracked</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {orderedLearners.filter((learner) => learner.attendance.attended).length}/{orderedLearners.length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Current sequence step</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {details.sequence.find((step) => step.key === details.currentStepKey)?.label || "Not set"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">Session sequence control</p>
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
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 flex items-center justify-between">
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
                <div key={learner.userId} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 p-3 md:grid-cols-4">
                  <p className="text-sm font-medium text-gray-900">{learner.name}</p>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={learner.attendance.attended}
                      onChange={(event) => {
                        if (!details) return;
                        const updated = details.learners.map((item) =>
                          item.userId === learner.userId
                            ? {
                                ...item,
                                attendance: {
                                  ...item.attendance,
                                  attended: event.target.checked,
                                },
                              }
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
                    onChange={(event) => {
                      if (!details) return;
                      const minutes = Math.max(0, Number(event.target.value) || 0);
                      const updated = details.learners.map((item) =>
                        item.userId === learner.userId
                          ? {
                              ...item,
                              attendance: {
                                ...item.attendance,
                                attendanceMinutes: minutes,
                              },
                            }
                          : item
                      );
                      setDetails({ ...details, learners: updated });
                    }}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  />
                  <p className="text-sm font-semibold text-gray-700">Engagement {learner.participationScore}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Incident and safeguarding notes</p>
              <textarea
                value={newIncident}
                onChange={(event) => setNewIncident(event.target.value)}
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
                {details.incidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="rounded border border-amber-100 bg-amber-50 p-2 text-xs text-amber-900">
                    <p className="font-semibold">{incident.severity}</p>
                    <p>{incident.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Replay publishing workflow</p>
              <input
                value={recordingUrl}
                onChange={(event) => setRecordingUrl(event.target.value)}
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
                <p>Facilitator notes and assignment reminders are managed through session updates.</p>
                <p className="mt-1">Use this panel to close sessions and publish replay assets to learners.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
