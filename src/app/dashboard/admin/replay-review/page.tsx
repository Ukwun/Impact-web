"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminReplayReviewQueue } from "@/hooks/useFetchData";

type ReplayQueueResponse = {
  data?: {
    items: Array<{
      id: string;
      title: string;
      message: string;
      resolved: boolean;
      createdAt: string;
      metadata?: {
        sessionTitle?: string;
        courseTitle?: string;
        recordingUrl?: string;
        replayLibraryUrl?: string;
        reviewStatus?: string;
      };
    }>;
    summary: { total: number; pending: number };
  };
};

export default function AdminReplayReviewPage() {
  const [includeResolved, setIncludeResolved] = useState(false);
  const { replayQueue, loading, error, refetch } = useAdminReplayReviewQueue(includeResolved);
  const payload = replayQueue as ReplayQueueResponse | null;
  const items = payload?.data?.items || [];
  const summary = payload?.data?.summary || { total: 0, pending: 0 };

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
          <h1 className="text-4xl font-black text-white">Replay Review Queue</h1>
          <p className="mt-2 text-gray-300">Review newly published class replays before operational sign-off.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIncludeResolved((value) => !value)}>
          {includeResolved ? "Hide Resolved" : "Show Resolved"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-gray-400">Pending Reviews</p>
          <p className="mt-2 text-3xl font-bold text-white">{summary.pending}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-400">Total Replay Alerts</p>
          <p className="mt-2 text-3xl font-bold text-white">{summary.total}</p>
        </Card>
      </div>

      {loading ? <Card className="p-6 text-gray-300">Loading replay review queue...</Card> : null}
      {error ? <Card className="p-6 text-red-300">{error}</Card> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                <p className="text-sm text-gray-300">{item.message}</p>
                <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>Session: {item.metadata?.sessionTitle || "Unknown"}</p>
                  <p>Course: {item.metadata?.courseTitle || "Unknown"}</p>
                  <a className="text-blue-400 underline" href={item.metadata?.recordingUrl || "#"} target="_blank" rel="noreferrer">
                    Open recording
                  </a>
                </div>
              </div>
              {!item.resolved ? (
                <Button size="sm" onClick={() => resolveAlert(item.id)}>
                  Mark Reviewed
                </Button>
              ) : (
                <span className="text-sm text-emerald-300">Reviewed</span>
              )}
            </div>
          </Card>
        ))}

        {!loading && items.length === 0 ? (
          <Card className="p-8 text-center text-gray-300">No replay reviews waiting.</Card>
        ) : null}
      </div>
    </div>
  );
}
