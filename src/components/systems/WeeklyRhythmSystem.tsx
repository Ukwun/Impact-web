/**
 * Weekly Rhythm System Component
 * Structured learning schedule automation with daily guidance
 * ImpactApp Platform - April 23, 2026
 */

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// ========================================================================
// TYPES
// ========================================================================

interface DaySchedule {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  date: string;
  focusArea: string; // e.g., "Mathematics Deep Dive"
  sessions: LearningSession[];
  suggestedDuration: number; // minutes
  completionRate: number; // 0-100
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
}

interface LearningSession {
  id: string;
  sessionType: "CONCEPT_STUDY" | "PRACTICE" | "PROJECT_WORK" | "DISCUSSION" | "REVIEW";
  title: string;
  courseId: string;
  courseName: string;
  duration: number; // minutes
  resources: SessionResource[];
  objectives: string[];
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

interface SessionResource {
  id: string;
  type: "VIDEO" | "ARTICLE" | "INTERACTIVE" | "ASSIGNMENT" | "DISCUSSION";
  title: string;
  duration?: number;
  url: string;
}

interface WeeklyPattern {
  pattern: {
    MON: string; // e.g., "Concept Study + Practice"
    TUE: string; // e.g., "Project Work + Discussion"
    WED: string;
    THU: string;
    FRI: string;
    SAT: string;
    SUN: string;
  };
  totalWeeklyHours: number;
  focusAreas: string[];
  flexibility: "STRICT" | "MODERATE" | "FLEXIBLE";
}

interface RhythmTemplate {
  id: string;
  name: string; // e.g., "Balanced Learner", "Deep Diver", "Quick Learner"
  description: string;
  pattern: WeeklyPattern;
  hoursPerWeek: number;
  sessionCount: number;
  sessionDuration: number;
  targetAudience: string[];
  successRate: number;
}

interface StudentRhythm {
  studentId: string;
  currentTemplate: RhythmTemplate;
  weekStartDate: string;
  weekEndDate: string;
  schedule: DaySchedule[];
  streakDays: number;
  completedSessionsThisWeek: number;
  totalSessionsThisWeek: number;
  adaptations: Adaptation[];
  insights: RhythmInsight[];
}

interface Adaptation {
  timestamp: string;
  type: "PACE_ADJUSTMENT" | "TOPIC_SWAP" | "DURATION_CHANGE" | "TIME_SHIFT";
  reason: string;
  impact: string;
}

interface RhythmInsight {
  id: string;
  type: "PEAK_TIME" | "STRUGGLE_PATTERN" | "STRENGTH_AREA" | "RECOMMENDATION";
  title: string;
  description: string;
  actionable: boolean;
  suggestedAction?: string;
}

interface WeeklyRhythmSystemData {
  rhythm: StudentRhythm;
  templates: RhythmTemplate[];
  userStats: {
    bestDay: string;
    averageSessionDuration: number;
    consistencyScore: number; // 0-100
    weeklyTarget: number;
    weeklyCompleted: number;
  };
}

// ========================================================================
// MAIN COMPONENT
// ========================================================================

export default function WeeklyRhythmSystem() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rhythmData, setRhythmData] = useState<WeeklyRhythmSystemData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeView, setActiveView] = useState<"week" | "insights" | "templates">("week");
  const [sessionInProgress, setSessionInProgress] = useState<LearningSession | null>(null);

  useEffect(() => {
    loadRhythmData();
  }, []);

  const loadRhythmData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/rhythm/weekly");

      if (response.data.success) {
        setRhythmData(response.data.data);
        setSelectedDay(response.data.data.rhythm.schedule[0]?.dayOfWeek || null);
      } else {
        setError("Unable to load weekly rhythm");
      }
    } catch (err) {
      console.error("Error loading rhythm data:", err);
      setError("Failed to load weekly rhythm");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleStartSession = async (session: LearningSession) => {
    try {
      await axios.post(`/api/rhythm/sessions/${session.id}/start`);
      setSessionInProgress(session);
      await loadRhythmData();
    } catch (err) {
      console.error("Error starting session:", err);
      setError("Failed to start session");
    }
  };

  const handleCompleteSession = async (session: LearningSession) => {
    try {
      await axios.post(`/api/rhythm/sessions/${session.id}/complete`);
      setSessionInProgress(null);
      await loadRhythmData();
    } catch (err) {
      console.error("Error completing session:", err);
      setError("Failed to complete session");
    }
  };

  const handleAdaptRhythm = async (templateId: string) => {
    try {
      const response = await axios.post("/api/rhythm/switch-template", {
        templateId,
      });
      if (response.data.success) {
        alert("Rhythm adjusted to your preference!");
        await loadRhythmData();
        setShowTemplates(false);
      }
    } catch (err) {
      console.error("Error adapting rhythm:", err);
      setError("Failed to switch template");
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading your weekly rhythm...</p>
        </div>
      </div>
    );
  }

  if (!rhythmData) {
    return null;
  }

  const { rhythm, templates, userStats } = rhythmData;
  const activeSchedule = rhythm.schedule.find((d) => d.dayOfWeek === selectedDay);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📅 Weekly Learning Rhythm</h1>
              <p className="text-gray-600 mt-1">Your personalized learning schedule for optimal success</p>
            </div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              data-button="customize-rhythm"
            >
              ⚙️ Customize
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Streak" value={`${rhythm.streakDays} days`} icon="🔥" />
            <StatCard label="This Week" value={`${rhythm.completedSessionsThisWeek}/${rhythm.totalSessionsThisWeek}`} icon="✅" />
            <StatCard label="Consistency" value={`${userStats.consistencyScore}%`} icon="📈" />
            <StatCard label="Best Time" value={userStats.bestDay} icon="⏰" />
          </div>

          {/* View Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("week")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeView === "week"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-button="tab-week"
            >
              📅 This Week
            </button>
            <button
              onClick={() => setActiveView("insights")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeView === "insights"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-button="tab-insights"
            >
              💡 Insights
            </button>
            <button
              onClick={() => setActiveView("templates")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeView === "templates"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-button="tab-templates"
            >
              🎨 Templates
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* WEEKLY VIEW */}
        {activeView === "week" && (
          <div className="space-y-8">
            {/* Current Session */}
            {sessionInProgress && (
              <SessionInProgressCard
                session={sessionInProgress}
                onComplete={() => handleCompleteSession(sessionInProgress)}
              />
            )}

            {/* Week Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">This Week's Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {rhythm.schedule.map((day) => (
                  <DayCard
                    key={day.dayOfWeek}
                    day={day}
                    isSelected={selectedDay === day.dayOfWeek}
                    onSelect={() => setSelectedDay(day.dayOfWeek)}
                  />
                ))}
              </div>
            </section>

            {/* Selected Day Detail */}
            {activeSchedule && (
              <section className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      📆 {activeSchedule.dayOfWeek} - {new Date(activeSchedule.date).toLocaleDateString()}
                    </h2>
                    <p className="text-gray-600 mt-1">Focus: {activeSchedule.focusArea}</p>
                  </div>
                  <ProgressIndicator value={activeSchedule.completionRate} />
                </div>

                {/* Sessions */}
                <div className="space-y-4">
                  {activeSchedule.sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 text-lg">😊 You're all caught up for today!</p>
                    </div>
                  ) : (
                    activeSchedule.sessions.map((session, idx) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        sessionNumber={idx + 1}
                        totalSessions={activeSchedule.sessions.length}
                        onStart={() => handleStartSession(session)}
                      />
                    ))
                  )}
                </div>

                {/* Day Summary */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
                  <h3 className="font-bold text-gray-900 mb-3">📋 Today's Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Summary label="Total Time" value={`${activeSchedule.suggestedDuration} min`} />
                    <Summary label="Sessions" value={activeSchedule.sessions.length} />
                    <Summary label="Estimated Completion" value={new Date(Date.now() + activeSchedule.suggestedDuration * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* INSIGHTS VIEW */}
        {activeView === "insights" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Insights</h2>
            <div className="space-y-4">
              {rhythm.insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>

            {/* Adaptation History */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Recent Adaptations</h3>
              <div className="space-y-3">
                {rhythm.adaptations.slice(0, 5).map((adaptation, idx) => (
                  <AdaptationCard key={idx} adaptation={adaptation} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TEMPLATES VIEW */}
        {activeView === "templates" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Templates</h2>
            <p className="text-gray-600 mb-6">
              Choose a template that matches your learning style. Your current template is{" "}
              <strong>{rhythm.currentTemplate.name}</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isCurrent={template.id === rhythm.currentTemplate.id}
                  onSelect={() => handleAdaptRhythm(template.id)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ========================================================================
// SUB-COMPONENTS
// ========================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border-b-2 border-amber-600 shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface DayCardProps {
  day: DaySchedule;
  isSelected: boolean;
  onSelect: () => void;
}

function DayCard({ day, isSelected, onSelect }: DayCardProps) {
  const statusIcon = {
    PLANNED: "📅",
    IN_PROGRESS: "⏳",
    COMPLETED: "✅",
    SKIPPED: "⏭️",
  }[day.status];

  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-lg transition text-center ${
        isSelected
          ? "bg-amber-600 text-white shadow-lg"
          : "bg-white text-gray-900 border-2 border-gray-200 hover:border-amber-300"
      }`}
      data-button={`day-${day.dayOfWeek}`}
    >
      <p className="text-lg font-bold mb-2">{day.dayOfWeek}</p>
      <p className="text-2xl mb-2">{statusIcon}</p>
      <p className="text-xs opacity-75">
        {day.completionRate}% done
      </p>
      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 relative">
        <div
          className={`h-1 rounded-full transition-all ${
            isSelected ? "bg-white" : "bg-amber-600"
          }`}
          style={{ width: `${day.completionRate}%` }}
        ></div>
      </div>
    </button>
  );
}

interface SessionInProgressCardProps {
  session: LearningSession;
  onComplete: () => void;
}

function SessionInProgressCard({ session, onComplete }: SessionInProgressCardProps) {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">🚀 Session in Progress</h2>
          <p className="text-green-100 mb-3">{session.title}</p>
          <p className="text-green-100">
            Estimated time remaining: {session.duration} minutes
          </p>
        </div>
        <button
          onClick={onComplete}
          className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition"
          data-button="complete-session"
        >
          ✓ Mark Complete
        </button>
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: LearningSession;
  sessionNumber: number;
  totalSessions: number;
  onStart: () => void;
}

function SessionCard({ session, sessionNumber, totalSessions, onStart }: SessionCardProps) {
  const sessionIcon = {
    CONCEPT_STUDY: "📖",
    PRACTICE: "✏️",
    PROJECT_WORK: "🚀",
    DISCUSSION: "💬",
    REVIEW: "🔍",
  }[session.sessionType];

  const statusColor = {
    NOT_STARTED: "border-gray-300 bg-gray-50",
    IN_PROGRESS: "border-blue-300 bg-blue-50",
    COMPLETED: "border-green-300 bg-green-50",
  }[session.status];

  return (
    <div className={`border-l-4 rounded-lg p-4 ${statusColor}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{sessionIcon}</span>
          <div>
            <h4 className="font-bold text-gray-900">
              Session {sessionNumber}/{totalSessions}: {session.title}
            </h4>
            <p className="text-sm text-gray-600">{session.courseName}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-600">⏱️ {session.duration} min</span>
      </div>

      {/* Objectives */}
      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-700 mb-2">Learning Objectives:</p>
        <ul className="list-disc list-inside space-y-1">
          {session.objectives.map((obj, idx) => (
            <li key={idx} className="text-sm text-gray-700">
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* Resources */}
      {session.resources.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700">Resources:</p>
          {session.resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              className="block text-sm text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {resource.type} - {resource.title}
            </a>
          ))}
        </div>
      )}

      {/* Action Button */}
      {session.status !== "COMPLETED" && (
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 rounded-lg hover:from-amber-600 hover:to-orange-700 font-semibold transition"
          data-button="start-session"
        >
          ▶ Start Session
        </button>
      )}
      {session.status === "COMPLETED" && (
        <div className="text-center py-2 bg-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">✅ Completed</p>
        </div>
      )}
    </div>
  );
}

interface ProgressIndicatorProps {
  value: number;
}

function ProgressIndicator({ value }: ProgressIndicatorProps) {
  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-amber-600 mb-2">{value}%</div>
      <p className="text-gray-600">Complete</p>
    </div>
  );
}

interface SummaryProps {
  label: string;
  value: string | number;
}

function Summary({ label, value }: SummaryProps) {
  return (
    <div className="text-center">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface InsightCardProps {
  insight: RhythmInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  const typeIcon = {
    PEAK_TIME: "⏰",
    STRUGGLE_PATTERN: "⚠️",
    STRENGTH_AREA: "💪",
    RECOMMENDATION: "💡",
  }[insight.type];

  const typeName = insight.type.replace(/_/g, " ");

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-600">
      <div className="flex items-start gap-4">
        <span className="text-3xl">{typeIcon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2">{insight.title}</h3>
          <p className="text-gray-700 mb-3">{insight.description}</p>
          {insight.suggestedAction && (
            <div className="bg-blue-50 rounded p-3">
              <p className="text-sm text-blue-900">
                <strong>Suggested Action:</strong> {insight.suggestedAction}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AdaptationCardProps {
  adaptation: Adaptation;
}

function AdaptationCard({ adaptation }: AdaptationCardProps) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-semibold text-gray-900">{adaptation.type.replace(/_/g, " ")}</p>
        <p className="text-sm text-gray-600">{adaptation.reason}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">
          {new Date(adaptation.timestamp).toLocaleDateString()}
        </p>
        <p className="text-sm text-green-600 font-semibold">{adaptation.impact}</p>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: RhythmTemplate;
  isCurrent: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isCurrent, onSelect }: TemplateCardProps) {
  return (
    <div
      className={`rounded-lg shadow-lg p-6 transition border-2 ${
        isCurrent
          ? "bg-amber-50 border-amber-600"
          : "bg-white border-gray-200 hover:border-amber-300"
      }`}
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
        <p className="text-gray-600">{template.description}</p>
      </div>

      <div className="space-y-2 mb-6 pb-6 border-b">
        <TemplateStat label="Hours/Week" value={template.hoursPerWeek} />
        <TemplateStat label="Sessions" value={template.sessionCount} />
        <TemplateStat label="Avg Duration" value={`${template.sessionDuration} min`} />
        <TemplateStat label="Success Rate" value={`${template.successRate}%`} />
      </div>

      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          isCurrent
            ? "bg-green-600 text-white cursor-default"
            : "bg-amber-600 text-white hover:bg-amber-700"
        }`}
        data-button={`select-template-${template.id}`}
      >
        {isCurrent ? "✓ Current Template" : "Choose This"}
      </button>
    </div>
  );
}

interface TemplateStatProps {
  label: string;
  value: string | number;
}

function TemplateStat({ label, value }: TemplateStatProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
