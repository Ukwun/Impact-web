"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  Child,
  TrendingUp,
  AlertCircle,
  Loader,
  Eye,
  MessageSquare,
  BarChart3,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

interface ChildProgress {
  id: string;
  name: string;
  age?: number;
  enrolledCourses: number;
  averageGrade: number;
  completionRate: number;
}

interface PerformanceAlert {
  childId: string;
  childName: string;
  message: string;
  type: "success" | "warning" | "danger";
}

interface ParentDashboardData {
  children: ChildProgress[];
  alerts: PerformanceAlert[];
  lastUpdated: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const { success, error: errorToast } = useToast();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/parent/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          router.push("/auth/login?error=invalid_token");
          return;
        }
        throw new Error("Failed to load dashboard");
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        success("Dashboard loaded");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      errorToast("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 border-l-4 border-danger-500 bg-danger-500/10">
        <AlertCircle className="w-6 h-6 text-danger-400 mb-2" />
        <p className="text-danger-400">Failed to load dashboard</p>
        <Button onClick={loadDashboardData} className="mt-4">Try Again</Button>
      </Card>
    );
  }

  const criticalAlerts = data.alerts.filter(a => a.type === 'danger');
  const warningAlerts = data.alerts.filter(a => a.type === 'warning');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">👨‍👩‍👧 My Children</h1>
          <p className="text-gray-300">Monitor your children's learning progress and performance</p>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="p-4 border-l-4 border-red-500 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-400">⚠️ Attention Needed</p>
              <div className="space-y-1 mt-2">
                {criticalAlerts.map((alert, idx) => (
                  <p key={idx} className="text-sm text-gray-300">
                    <span className="font-semibold text-red-300">{alert.childName}:</span> {alert.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-400">📢 Performance Notes</p>
              <div className="space-y-1 mt-2">
                {warningAlerts.map((alert, idx) => (
                  <p key={idx} className="text-sm text-gray-300">
                    <span className="font-semibold">{alert.childName}:</span> {alert.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Children Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Child className="w-6 h-6" />
          Your Children ({data.children.length})
        </h2>

        {data.children.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">No children linked to your account yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.children.map(child => (
              <Card
                key={child.id}
                className={`p-6 cursor-pointer transition-all ${selectedChild === child.id ? 'border-primary-500 ring-2 ring-primary-500/30' : 'hover:border-primary-500'}`}
                onClick={() => setSelectedChild(selectedChild === child.id ? null : child.id)}
              >
                <div className="space-y-4">
                  {/* Child Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{child.name}</h3>
                      {child.age && <p className="text-xs text-gray-400 mt-1">Age {child.age}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Current Grade</p>
                      <p className="text-3xl font-black text-primary-400">{child.averageGrade}%</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-dark-700 p-3 rounded text-center">
                      <BookOpen className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                      <p className="text-xs text-gray-400">Courses</p>
                      <p className="font-bold text-white">{child.enrolledCourses}</p>
                    </div>
                    <div className="bg-dark-700 p-3 rounded text-center">
                      <TrendingUp className="w-4 h-4 mx-auto text-green-400 mb-1" />
                      <p className="text-xs text-gray-400">Average</p>
                      <p className="font-bold text-white">{child.averageGrade}%</p>
                    </div>
                    <div className="bg-dark-700 p-3 rounded text-center">
                      <CheckCircle2 className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                      <p className="text-xs text-gray-400">Complete</p>
                      <p className="font-bold text-white">{child.completionRate}%</p>
                    </div>
                  </div>

                  {/* Completion Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-300">Overall Progress</span>
                      <span className="text-sm font-bold text-primary-400">{child.completionRate}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${child.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded View */}
                  {selectedChild === child.id && (
                    <div className="mt-4 pt-4 border-t border-dark-600 space-y-3">
                      <Button variant="secondary" className="w-full flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Detailed Progress
                      </Button>
                      <Button variant="secondary" className="w-full flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message Facilitator
                      </Button>
                      <Button variant="secondary" className="w-full flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Performance Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Information Section */}
      <Card className="p-6 bg-dark-700/30">
        <h3 className="font-bold text-white mb-3">💡 How to Use the Parent Dashboard</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Click on a child's card to see detailed learning progress</li>
          <li>✓ Performance alerts notify you of concerns or achievements</li>
          <li>✓ Message facilitators directly about your child's progress</li>
          <li>✓ Track completion rates and help set realistic learning goals</li>
        </ul>
      </Card>
    </div>
  );
}
