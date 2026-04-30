"use client";
import React, { useEffect, useState } from "react";

// Placeholder for admin dashboard
export default function AdminDashboard() {

  const [activities, setActivities] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiptsLoading, setReceiptsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then((res) => res.json())
      .then((data) => {
        setActivities(data.activities || []);
        setLoading(false);
      });
    fetch("/api/payments/receipts/admin")
      .then((res) => res.json())
      .then((data) => {
        setReceipts(data.receipts || []);
        setReceiptsLoading(false);
      });
  }, []);

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Monitor user activity, system health, and all payment receipts here.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded p-4 bg-white shadow">
          <h2 className="font-semibold mb-2">Recent User Activities</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : activities.length === 0 ? (
            <div className="text-gray-500">No activity yet.</div>
          ) : (
            <ul className="divide-y">
              {activities.map((a, i) => (
                <li key={i} className="py-2 text-sm">
                  <span className="font-mono text-xs text-blue-700">{a.userId || 'anon'}</span> —
                  <span className="ml-2">{a.path}</span>
                  <span className="ml-2 text-gray-400">{a.userAgent?.slice(0, 30)}</span>
                  <span className="ml-2 text-gray-400">{new Date(a.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border rounded p-4 bg-white shadow overflow-x-auto">
          <h2 className="font-semibold mb-2">All Payment Receipts</h2>
          {receiptsLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : receipts.length === 0 ? (
            <div className="text-gray-500">No receipts yet.</div>
          ) : (
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Student</th>
                  <th className="p-2 text-left">Course</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Gateway</th>
                  <th className="p-2 text-left">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r: any) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">{r.user?.firstName} {r.user?.lastName}<br /><span className="text-gray-400">{r.user?.email}</span></td>
                    <td className="p-2">{r.course?.title || '-'}</td>
                    <td className="p-2">{r.amount} {r.currency}</td>
                    <td className="p-2">{r.status}</td>
                    <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="p-2">{r.gateway || '-'}</td>
                    <td className="p-2">
                      <a
                        href={`/api/payments/receipts/pdf?id=${r.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}