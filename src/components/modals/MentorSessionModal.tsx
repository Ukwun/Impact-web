"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X, Calendar, Clock, Users, CheckCircle } from "lucide-react";

interface MentorSession {
  id: string;
  menteeId: string;
  menteeName: string;
  sessionDate: string;
  duration: number;
  topic: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
  attendance: "present" | "absent" | "excused" | null;
  feedbackProvided: boolean;
}

interface Props {
  isOpen: boolean;
  sessions: MentorSession[];
  selectedMenteeId?: string;
  onClose: () => void;
  onScheduleSession: (
    menteeId: string,
    sessionDate: string,
    duration: number,
    topic: string
  ) => Promise<void>;
  onCompleteSession: (sessionId: string, notes: string, attendance: string) => Promise<void>;
}

export function MentorSessionModal({
  isOpen,
  sessions,
  selectedMenteeId,
  onClose,
  onScheduleSession,
  onCompleteSession,
}: Props) {
  const [view, setView] = useState<"schedule" | "upcoming" | "completed">("upcoming");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Scheduling form state
  const [formData, setFormData] = useState({
    sessionDate: "",
    duration: 60,
    topic: "",
  });

  // Completion form state
  const [completionData, setCompletionData] = useState({
    notes: "",
    attendance: "present" as "present" | "absent" | "excused",
  });

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenteeId || !formData.sessionDate || !formData.topic) return;

    setIsProcessing(true);
    try {
      await onScheduleSession(
        selectedMenteeId,
        formData.sessionDate,
        formData.duration,
        formData.topic
      );
      setFormData({ sessionDate: "", duration: 60, topic: "" });
      setIsScheduling(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    setIsProcessing(true);
    try {
      await onCompleteSession(sessionId, completionData.notes, completionData.attendance);
      setSelectedSession(null);
      setCompletionData({ notes: "", attendance: "present" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (view === "upcoming") return s.status === "scheduled";
    if (view === "completed") return s.status === "completed";
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-screen overflow-hidden bg-dark-800 border-dark-600 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">Mentoring Sessions</h3>
            <p className="text-sm text-gray-400">{filteredSessions.length} sessions</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-4 border-b border-dark-600 bg-dark-700/30 flex-shrink-0">
          {["upcoming", "completed", "schedule"].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab as any)}
              className={`px-4 py-2 rounded font-medium text-sm transition ${
                view === tab
                  ? "bg-primary-500 text-white"
                  : "bg-dark-700 text-gray-400 hover:text-white"
              }`}
            >
              {tab === "schedule" ? "Schedule New" : tab === "upcoming" ? "Upcoming" : "Completed"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === "schedule" ? (
            // Schedule Form
            <form onSubmit={handleScheduleSubmit} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 text-white rounded focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 text-white rounded focus:outline-none focus:border-primary-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g., Course planning, Career guidance, Academic support"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 text-white rounded focus:outline-none focus:border-primary-500 placeholder-gray-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="primary" disabled={isProcessing}>
                  {isProcessing ? "Scheduling..." : "Schedule Session"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setView("upcoming")}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            // Sessions List
            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <Card className="p-6 border-dark-600 bg-dark-700">
                  <p className="text-gray-400 text-center">
                    {view === "completed" ? "No completed sessions yet" : "No upcoming sessions scheduled"}
                  </p>
                </Card>
              ) : (
                filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="p-4 bg-dark-700 border-dark-600 hover:border-primary-500 cursor-pointer transition"
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {session.menteeName}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">{session.topic}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-400 mb-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(session.sessionDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            {session.duration} min
                          </div>
                        </div>
                        {session.status === "completed" && (
                          <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Session Details */}
                    {selectedSession === session.id && (
                      <div className="mt-4 pt-4 border-t border-dark-600 space-y-3">
                        {session.status === "scheduled" && (
                          <Button
                            variant="primary"
                            className="w-full text-sm"
                            disabled={isProcessing}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteSession(session.id);
                            }}
                          >
                            Mark as Completed
                          </Button>
                        )}

                        {session.notes && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Session Notes:</p>
                            <p className="text-sm text-gray-300">{session.notes}</p>
                          </div>
                        )}

                        {session.attendance && (
                          <div>
                            <p className="text-xs text-gray-400">
                              Attendance: <span className="text-white capitalize">{session.attendance}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
