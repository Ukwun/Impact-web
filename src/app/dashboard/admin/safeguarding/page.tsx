"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminSafeguardingDashboard } from "@/hooks/useFetchData";

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
      };
    }>;
    summary: { total: number; critical: number; warning: number; info: number };
  };
};

export default function AdminSafeguardingPage() {
  const [includeResolved, setIncludeResolved] = useState(false);
  const { safeguardingDashboard, loading, error, refetch } = useAdminSafeguardingDashboard(includeResolved);
  const payload = safeguardingDashboard as SafeguardingResponse | null;
  const items = payload?.data?.items || [];
  const summary = payload?.data?.summary || { total: 0, critical: 0, warning: 0, info: 0 };

  const resolveAlert = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    await fetch(`/api/admin/alerts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resolved: true }),
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
                <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              {!item.resolved ? (
                <Button size="sm" onClick={() => resolveAlert(item.id)}>
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
