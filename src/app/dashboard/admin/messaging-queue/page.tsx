"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminMessagingQueue } from "@/hooks/useFetchData";

type QueuePayload = {
  data?: {
    items: Array<{
      id: string;
      title: string;
      message: string;
      resolved: boolean;
      createdAt: string;
      metadata?: {
        eventType?: string;
        lastProcessedAt?: string;
        queueStatus?: string;
        queuedCount?: number;
        deliveryCounts?: {
          delivered?: number;
          failed?: number;
          total?: number;
        };
      };
    }>;
    summary: {
      total: number;
      pending: number;
    };
  };
};

export default function AdminMessagingQueuePage() {
  const [includeResolved, setIncludeResolved] = useState(false);
  const [runningWorker, setRunningWorker] = useState(false);
  const [workerMessage, setWorkerMessage] = useState<string | null>(null);

  const { messagingQueue, loading, error, refetch } = useAdminMessagingQueue(includeResolved);
  const payload = messagingQueue as QueuePayload | null;
  const items = payload?.data?.items || [];
  const summary = payload?.data?.summary || { total: 0, pending: 0 };

  const runProcessor = async () => {
    setRunningWorker(true);
    setWorkerMessage(null);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/internal/messaging/process-queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ limitAlerts: 25, limitJobs: 250 }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to run queue processor");
      }

      setWorkerMessage(
        `Processed ${json.data.jobsProcessed} jobs, delivered ${json.data.delivered}, failed ${json.data.failed}.`
      );
      refetch();
    } catch (err) {
      setWorkerMessage(err instanceof Error ? err.message : "Queue processor failed");
    } finally {
      setRunningWorker(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white">Messaging Queue Operations</h1>
          <p className="mt-2 text-gray-300">
            Process WhatsApp and SMS jobs generated from live classroom lifecycle events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIncludeResolved((v) => !v)}>
            {includeResolved ? "Hide Completed" : "Show Completed"}
          </Button>
          <Button size="sm" onClick={runProcessor} disabled={runningWorker}>
            {runningWorker ? "Processing..." : "Run Processor"}
          </Button>
        </div>
      </div>

      {workerMessage ? <Card className="p-4 text-sm text-blue-200">{workerMessage}</Card> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-gray-400">Pending Queue Alerts</p>
          <p className="mt-2 text-3xl font-bold text-white">{summary.pending}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-400">Total Queue Alerts</p>
          <p className="mt-2 text-3xl font-bold text-white">{summary.total}</p>
        </Card>
      </div>

      {loading ? <Card className="p-6 text-gray-300">Loading queue...</Card> : null}
      {error ? <Card className="p-6 text-red-300">{error}</Card> : null}

      <div className="space-y-4">
        {items.map((item) => {
          const counts = item.metadata?.deliveryCounts || {};
          return (
            <Card key={item.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                  <p className="text-sm text-gray-300">{item.message}</p>
                  <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right text-sm text-gray-300">
                  <p>Status: {item.metadata?.queueStatus || (item.resolved ? "COMPLETED" : "PENDING")}</p>
                  <p>Delivered: {counts.delivered || 0}</p>
                  <p>Failed: {counts.failed || 0}</p>
                  <p>Total: {counts.total || item.metadata?.queuedCount || 0}</p>
                </div>
              </div>
            </Card>
          );
        })}

        {!loading && items.length === 0 ? (
          <Card className="p-8 text-center text-gray-300">No messaging queue items.</Card>
        ) : null}
      </div>
    </div>
  );
}
