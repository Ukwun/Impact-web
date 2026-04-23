"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminSafeguardingDashboard, useSafeguardingOfficers } from "@/hooks/useFetchData";

type SafeguardingResponse = {
  data?: {
    items: Array<{
      id: string;
      title: string;
      message: string;
      severity: "critical" | "warning" | "info";
      resolved: boolean;
      createdAt: string;
      metadata?: {
        incidentNote?: string;
        incidentSeverity?: string;
        sessionTitle?: string;
        courseTitle?: string;
        escalationStatus?: string;
        assignedOfficerId?: string;
        assignedOfficerName?: string;
        assignedOfficerRole?: string;
        ownershipStatus?: string;
        auditTrail?: Array<Record<string, unknown>>;
      };
    }>;
    summary: { total: number; critical: number; warning: number; info: number };
  };
};

type OfficersPayload = {
  data?: Array<{ id: string; name: string; email: string; role: string }>;
};

export default function AdminSafeguardingPage() {
  const [includeResolved, setIncludeResolved] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState<Record<string, string>>({});
  const [selectedOfficers, setSelectedOfficers] = useState<Record<string, string>>({});
  const [workingCaseId, setWorkingCaseId] = useState<string | null>(null);
  const { safeguardingDashboard, loading, error, refetch } = useAdminSafeguardingDashboard(includeResolved);
  const { officers } = useSafeguardingOfficers();
  const payload = safeguardingDashboard as SafeguardingResponse | null;
  const officersPayload = officers as OfficersPayload | null;
  const officerList = officersPayload?.data || [];
  const items = payload?.data?.items || [];
  const summary = payload?.data?.summary || { total: 0, critical: 0, warning: 0, info: 0 };

  const patchCase = async (id: string, data: Record<string, unknown>) => {
    setWorkingCaseId(id);
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`/api/admin/live-classroom/safeguarding/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      setWorkingCaseId(null);
      throw new Error(errorPayload.error || "Failed to update case");
    }

    setWorkingCaseId(null);
    refetch();
  };

  const resolveAlert = async (id: string) => {
    await patchCase(id, {
      resolve: true,
      resolutionSummary: assignmentNotes[id] || "Resolved by safeguarding team",
    });
  };

  const assignOfficer = async (id: string) => {
    const assignOfficerId = selectedOfficers[id];
    if (!assignOfficerId) {
      return;
    }

    await patchCase(id, {
      assignOfficerId,
      assignmentNote: assignmentNotes[id] || "Assigned for follow-up",
    });
  };

  const addCaseNote = async (id: string) => {
    const note = assignmentNotes[id];
    if (!note?.trim()) {
      return;
    }

    await patchCase(id, {
      note,
      noteType: "UPDATE",
    });
    refetch();
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Safeguarding Escalation Dashboard</h1>
          <p className="mt-2 text-gray-300">Track incident severity, open escalation status, and resolution actions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIncludeResolved((value) => !value)}>
          {includeResolved ? "Hide Resolved" : "Show Resolved"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-gray-400">Critical</p><p className="mt-2 text-3xl font-bold text-red-300">{summary.critical}</p></Card>
        <Card className="p-5"><p className="text-sm text-gray-400">Warnings</p><p className="mt-2 text-3xl font-bold text-yellow-300">{summary.warning}</p></Card>
        <Card className="p-5"><p className="text-sm text-gray-400">Info</p><p className="mt-2 text-3xl font-bold text-blue-300">{summary.info}</p></Card>
      </div>

      {loading ? <Card className="p-6 text-gray-300">Loading safeguarding cases...</Card> : null}
      {error ? <Card className="p-6 text-red-300">{error}</Card> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                  <span className="rounded bg-slate-700 px-2 py-1 text-xs uppercase text-gray-200">{item.severity}</span>
                </div>
                <p className="text-sm text-gray-300">{item.message}</p>
                <p className="text-sm text-gray-300">Session: {item.metadata?.sessionTitle || "Unknown"}</p>
                <p className="text-sm text-gray-300">Course: {item.metadata?.courseTitle || "Unknown"}</p>
                <p className="text-sm text-amber-200">Incident: {item.metadata?.incidentNote || "No incident note available"}</p>
                <p className="text-sm text-gray-300">
                  Ownership: {item.metadata?.assignedOfficerName || "Unassigned"}
                  {item.metadata?.assignedOfficerRole ? ` (${item.metadata.assignedOfficerRole})` : ""}
                </p>
                <p className="text-sm text-gray-300">Status: {item.metadata?.ownershipStatus || "UNASSIGNED"}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                  <select
                    className="rounded border border-gray-600 bg-slate-900 px-2 py-1 text-sm text-gray-200"
                    value={selectedOfficers[item.id] || ""}
                    onChange={(event) =>
                      setSelectedOfficers((previous) => ({
                        ...previous,
                        [item.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Assign officer...</option>
                    {officerList.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.name} ({officer.role})
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded border border-gray-600 bg-slate-900 px-2 py-1 text-sm text-gray-200"
                    placeholder="Case note or assignment context"
                    value={assignmentNotes[item.id] || ""}
                    onChange={(event) =>
                      setAssignmentNotes((previous) => ({
                        ...previous,
                        [item.id]: event.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => assignOfficer(item.id)} disabled={workingCaseId === item.id}>
                      Assign
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addCaseNote(item.id)} disabled={workingCaseId === item.id}>
                      Add Note
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              {!item.resolved ? (
                <Button size="sm" onClick={() => resolveAlert(item.id)} disabled={workingCaseId === item.id}>
                  Mark Resolved
                </Button>
              ) : (
                <span className="text-sm text-emerald-300">Resolved</span>
              )}
            </div>
          </Card>
        ))}

        {!loading && items.length === 0 ? (
          <Card className="p-8 text-center text-gray-300">No safeguarding escalations waiting.</Card>
        ) : null}
      </div>
    </div>
  );
}
