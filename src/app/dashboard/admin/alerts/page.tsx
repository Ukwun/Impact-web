"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAdminAlerts } from "@/hooks/useFetchData";
import { useRealtimeAlerts, useAlertPolling } from "@/lib/websocketUtils";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  Bell,
  TrendingDown,
  Activity,
  Radio,
} from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  resolved: boolean;
  category: string;
}

interface AlertsData {
  critical: Alert[];
  warnings: Alert[];
  info: Alert[];
}

export default function AdminAlertsPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState<"all" | "critical" | "warnings" | "info">("all");
  const [enableRealtimeUpdates, setEnableRealtimeUpdates] = useState(true);

  // Use the alerts hook with selected filter
  const { 
    data: alerts, 
    loading, 
    error, 
    refetch 
  } = useAdminAlerts(filter);

  // Use polling for real-time updates (fallback when WebSocket unavailable)
  const { alerts: newAlerts, isLoading: isPolling } = useAlertPolling(
    enableRealtimeUpdates,
    15000 // Poll every 15 seconds for fresher alert data
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getAlertIcon = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
      case "info":
        return "bg-blue-500/20 border-blue-500/50 text-blue-400";
    }
  };

  const dismissAlert = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`/api/admin/alerts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await refetch();
    } catch (err) {
      console.error("Error dismissing alert:", err);
    }
  };

  const allAlerts = alerts
    ? [
        ...alerts.critical,
        ...alerts.warnings,
        ...alerts.info,
      ].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];

  const filteredAlerts =
    filter === "all"
      ? allAlerts
      : allAlerts.filter((a) => a.severity === filter);

  return (
    <div
      className={`space-y-8 pb-12 transition-all duration-700 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
            System Alerts 🚨
          </h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPolling ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-xs text-gray-400">
              {isPolling ? 'Polling for updates' : 'Monitoring'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEnableRealtimeUpdates(!enableRealtimeUpdates)}
              className="ml-4 text-xs"
            >
              <Radio className="w-3 h-3 mr-1" />
              {enableRealtimeUpdates ? 'Live' : 'Off'}
            </Button>
          </div>
        </div>
        <p className="text-base sm:text-lg text-gray-300">
          Monitor critical system issues and notifications
        </p>
      </div>

      {/* Alert Summary Cards */}
      {alerts && !loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Critical Issues</h3>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-white">
                {alerts.critical.filter((a) => !a.resolved).length}
              </p>
              <p className="text-xs text-red-400 mt-2">Requires immediate attention</p>
            </Card>

            <Card className="p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Warnings</h3>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-white">
                {alerts.warnings.filter((a) => !a.resolved).length}
              </p>
              <p className="text-xs text-yellow-400 mt-2">Monitor closely</p>
            </Card>

            <Card className="p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Information</h3>
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white">{alerts.info.length}</p>
              <p className="text-xs text-blue-400 mt-2">System notifications</p>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {["all", "critical", "warnings", "info"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(f as any)}
                className="capitalize"
              >
                {f === "all" ? "All Alerts" : f}
              </Button>
            ))}
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`p-6 border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 mt-1">{getAlertIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{alert.title}</h3>
                          <span className="px-2 py-1 text-xs bg-dark-600 rounded capitalize">
                            {alert.category}
                          </span>
                          {alert.resolved && (
                            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors text-gray-400 hover:text-red-400"
                      title="Dismiss"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-green-500/20 rounded-full">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300">All Clear!</h3>
                  <p className="text-sm text-gray-400">
                    No {filter === "all" ? "alerts" : filter} to display
                  </p>
                </div>
              </Card>
            )}
          </div>
        </>
      ) : loading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading alerts...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400">Error Loading Alerts</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button onClick={() => refetch()} className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
