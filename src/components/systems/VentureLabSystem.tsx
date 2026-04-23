"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BarChart3, Briefcase, CheckCircle2, Clock3, Rocket, ShieldCheck } from "lucide-react";

type VentureArtifact = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  activityType: string;
  dueDate: string | null;
  maxPoints: number;
  rubricCriteria: Array<{ criterion: string; points: number; description: string }>;
  level: string | null;
  frameworkName: string | null;
  moduleTitle: string | null;
  lessonTitle: string | null;
  workflowUrl: string;
  shortDescription: string | null;
  submission: {
    id: string;
    isSubmitted: boolean;
    submittedAt: string | null;
    score: number | null;
    feedback: string | null;
    response: Record<string, unknown>;
  } | null;
};

type VentureResponse = {
  success: boolean;
  data: {
    artifacts: VentureArtifact[];
    summary: {
      total: number;
      submitted: number;
      pending: number;
      levels: string[];
    };
  };
};

const fieldConfig: Record<string, Array<{ key: string; label: string; multiline?: boolean; placeholder: string }>> = {
  BUSINESS_PLAN: [
    { key: "ventureName", label: "Venture Name", placeholder: "Name the business or initiative" },
    { key: "problem", label: "Problem", multiline: true, placeholder: "Describe the problem you are solving" },
    { key: "customer", label: "Customer", multiline: true, placeholder: "Who has this problem and why does it matter to them?" },
    { key: "valueProposition", label: "Value Proposition", multiline: true, placeholder: "What makes your solution useful or distinct?" },
    { key: "revenueModel", label: "Revenue Model", multiline: true, placeholder: "How will the venture earn or sustain value?" },
    { key: "operations", label: "Operations Plan", multiline: true, placeholder: "What are the key delivery steps, resources, and first milestones?" },
  ],
  PROJECTION_WORKSHEET: [
    { key: "startupCosts", label: "Startup Costs", multiline: true, placeholder: "List setup costs and one-time requirements" },
    { key: "pricing", label: "Pricing Logic", multiline: true, placeholder: "Explain price point, margin, and break-even assumptions" },
    { key: "monthlyRevenue", label: "Monthly Revenue Estimate", placeholder: "Enter an estimated monthly revenue figure" },
    { key: "monthlyCosts", label: "Monthly Costs Estimate", placeholder: "Enter an estimated monthly cost figure" },
    { key: "cashFlow", label: "Cash Flow Notes", multiline: true, placeholder: "Explain how cash comes in and goes out over the first quarter" },
    { key: "trackingPlan", label: "Performance Tracking Plan", multiline: true, placeholder: "What will you monitor weekly to know if the plan is working?" },
  ],
  INVESTOR_SIMULATION: [
    { key: "capitalType", label: "Chosen Capital Type", placeholder: "Grant, debt, equity, or bootstrapping" },
    { key: "scenario", label: "Scenario Summary", multiline: true, placeholder: "Describe the venture context and funding need" },
    { key: "riskLevel", label: "Risk Level", placeholder: "Low, medium, or high" },
    { key: "expectedReturn", label: "Expected Return or Trade-off", multiline: true, placeholder: "Explain what the backer or founder gains or gives up" },
    { key: "decisionRationale", label: "Decision Rationale", multiline: true, placeholder: "Why is this the best funding choice for this case?" },
  ],
  CAPSTONE_PITCH: [
    { key: "pitchTitle", label: "Pitch Title", placeholder: "Name the capstone pitch" },
    { key: "opportunity", label: "Opportunity", multiline: true, placeholder: "Summarize the problem, audience, and why this matters now" },
    { key: "traction", label: "Traction or Proof", multiline: true, placeholder: "What evidence, milestones, or validation already exist?" },
    { key: "ask", label: "Capital or Partnership Ask", multiline: true, placeholder: "What are you asking for, and how will it be used?" },
    { key: "next90Days", label: "Next 90 Days", multiline: true, placeholder: "What are the top execution priorities over the next 90 days?" },
    { key: "confidence", label: "Presenter Confidence Plan", multiline: true, placeholder: "How will you strengthen delivery, presence, and Q&A readiness?" },
  ],
};

const typeAccent: Record<string, { icon: typeof Briefcase; bg: string; border: string; chip: string }> = {
  BUSINESS_PLAN: { icon: Briefcase, bg: "from-sky-50 via-white to-blue-50", border: "border-sky-200", chip: "bg-sky-100 text-sky-700" },
  PROJECTION_WORKSHEET: { icon: BarChart3, bg: "from-emerald-50 via-white to-green-50", border: "border-emerald-200", chip: "bg-emerald-100 text-emerald-700" },
  INVESTOR_SIMULATION: { icon: ShieldCheck, bg: "from-amber-50 via-white to-yellow-50", border: "border-amber-200", chip: "bg-amber-100 text-amber-700" },
  CAPSTONE_PITCH: { icon: Rocket, bg: "from-rose-50 via-white to-orange-50", border: "border-rose-200", chip: "bg-rose-100 text-rose-700" },
};

function toInputState(artifact: VentureArtifact | null): Record<string, string> {
  if (!artifact?.submission?.response) {
    return {};
  }

  return Object.entries(artifact.submission.response).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = typeof value === "string" ? value : JSON.stringify(value);
    return acc;
  }, {});
}

export default function VentureLabSystem() {
  const searchParams = useSearchParams();
  const [artifacts, setArtifacts] = useState<VentureArtifact[]>([]);
  const [summary, setSummary] = useState<VentureResponse["data"]["summary"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const artifactSlug = searchParams.get("artifact");

  const selectedArtifact = useMemo(
    () => artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? null,
    [artifacts, selectedArtifactId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/venture-lab", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load venture lab artefacts");
        }

        const result = (await response.json()) as VentureResponse;
        setArtifacts(result.data.artifacts);
        setSummary(result.data.summary);

        const matching = artifactSlug
          ? result.data.artifacts.find((artifact) => artifact.workflowUrl.includes(`artifact=${artifactSlug}`))
          : result.data.artifacts.find((artifact) => !artifact.submission?.isSubmitted) ?? result.data.artifacts[0];

        if (matching) {
          setSelectedArtifactId(matching.id);
          setDraft(toInputState(matching));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [artifactSlug]);

  useEffect(() => {
    if (selectedArtifact) {
      setDraft(toInputState(selectedArtifact));
    }
  }, [selectedArtifactId]);

  const handleSubmit = async () => {
    if (!selectedArtifact) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`/api/venture-lab/${selectedArtifact.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: draft }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit venture artefact");
      }

      const refreshed = await fetch("/api/venture-lab", { cache: "no-store" });
      const refreshedResult = (await refreshed.json()) as VentureResponse;
      setArtifacts(refreshedResult.data.artifacts);
      setSummary(refreshedResult.data.summary);

      const updated = refreshedResult.data.artifacts.find((artifact) => artifact.id === selectedArtifact.id);
      if (updated) {
        setSelectedArtifactId(updated.id);
        setDraft(toInputState(updated));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eff6ff,_#fff7ed_45%,_#ffffff)] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading venture lab workflows...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedArtifact) {
    return (
      <div className="min-h-screen p-6 bg-[radial-gradient(circle_at_top_left,_#eff6ff,_#fff7ed_45%,_#ffffff)]">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Venture Lab</h1>
          <p className="mt-3 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eff6ff,_#fff7ed_45%,_#ffffff)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Learner Workflow</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Venture Lab</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Work through the real artefacts that make Senior Secondary and ImpactUni feel credible: business plan drafting, projection modelling,
                investment reasoning, and capstone pitch preparation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Artefacts</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{summary?.total ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">{summary?.submitted ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pending</p>
                <p className="mt-1 text-2xl font-black text-amber-700">{summary?.pending ?? 0}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-4">
            {artifacts.map((artifact) => {
              const accent = typeAccent[artifact.activityType] ?? typeAccent.BUSINESS_PLAN;
              const Icon = accent.icon;
              const isSelected = artifact.id === selectedArtifactId;
              return (
                <button
                  type="button"
                  key={artifact.id}
                  onClick={() => setSelectedArtifactId(artifact.id)}
                  className={`w-full rounded-[1.5rem] border bg-gradient-to-br p-5 text-left transition ${accent.bg} ${accent.border} ${isSelected ? "ring-2 ring-slate-900/10 shadow-lg" : "hover:shadow-md"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`inline-flex rounded-xl p-3 ${accent.chip}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${artifact.submission?.isSubmitted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {artifact.submission?.isSubmitted ? "Submitted" : "In Progress"}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-black text-slate-900">{artifact.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{artifact.shortDescription ?? artifact.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white/80 px-3 py-1">{artifact.level?.replaceAll("_", " ")}</span>
                    <span className="rounded-full bg-white/80 px-3 py-1">{artifact.moduleTitle}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedArtifact && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>{selectedArtifact.frameworkName}</span>
                    <span>•</span>
                    <span>{selectedArtifact.moduleTitle}</span>
                    <span>•</span>
                    <span>{selectedArtifact.lessonTitle}</span>
                  </div>
                  <h2 className="mt-3 text-3xl font-black text-slate-950">{selectedArtifact.title}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">{selectedArtifact.instructions}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> Due {selectedArtifact.dueDate ? new Date(selectedArtifact.dueDate).toLocaleDateString() : "TBD"}</div>
                  <div className="mt-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {selectedArtifact.maxPoints} points</div>
                  {selectedArtifact.submission?.submittedAt && (
                    <div className="mt-2 text-emerald-700">Submitted {new Date(selectedArtifact.submission.submittedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>

              {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                  {(fieldConfig[selectedArtifact.activityType] ?? []).map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span>
                      {field.multiline ? (
                        <textarea
                          value={draft[field.key] ?? ""}
                          onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                          placeholder={field.placeholder}
                          rows={5}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                      ) : (
                        <input
                          value={draft[field.key] ?? ""}
                          onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                      )}
                    </label>
                  ))}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {saving ? "Submitting..." : "Submit Artefact"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <a href={selectedArtifact.workflowUrl} className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline">
                      Open workflow link
                    </a>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Review Rubric</h3>
                    <div className="mt-4 space-y-3">
                      {selectedArtifact.rubricCriteria.map((criterion) => (
                        <div key={criterion.criterion} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">{criterion.criterion}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{criterion.points} pts</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-600">{criterion.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Why This Matters</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      These artefacts are the practical evidence layer of the curriculum. They give facilitators something concrete to review and give learners a realistic path from class content to venture execution.
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}