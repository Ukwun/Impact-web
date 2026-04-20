"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  Users,
  Calendar,
  TrendingUp,
  Loader,
  AlertCircle,
  MessageSquare,
  Clock,
  Target,
} from "lucide-react";

interface Mentee {
  id: string;
  name: string;
  focusArea: string;
  progression: number; // 0-100% in their journey
  nextSession?: string;
}

interface MentorshipSession {
  id: string;
  menteeName: string;
  scheduledFor: string;
  topic: string;
}

interface MentorDashboardData {
  activeMentees: Mentee[];
  upcomingSessions: MentorshipSession[];
  totalMentees: number;
  mentorshipHoursThisMonth: number;
}

export default function MentorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MentorDashboardData | null>(null);
  const { success, error: errorToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/mentor/dashboard", {
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

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">🎯 Mentorship Dashboard</h1>
          <p className="text-gray-300">Guide and support your mentees' personal and professional growth</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Active Mentees</p>
            <p className="text-3xl font-black text-primary-400 mt-2">{data.activeMentees.length}</p>
            <p className="text-xs text-gray-400 mt-1">{data.totalMentees} total</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Next Session</p>
            <p className="text-lg font-bold text-white mt-2">
              {data.upcomingSessions.length > 0 ? new Date(data.upcomingSessions[0].scheduledFor).toLocaleDateString() : "None"}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Hours This Month</p>
            <p className="text-3xl font-black text-green-400 mt-2">{data.mentorshipHoursThisMonth}</p>
          </Card>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {data.upcomingSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Upcoming Sessions ({data.upcomingSessions.length})
          </h2>
          
          <div className="space-y-3">
            {data.upcomingSessions.map(session => (
              <Card key={session.id} className="p-4 hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{session.menteeName}</h3>
                    <p className="text-sm text-gray-400 mt-1">Topic: {session.topic}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(session.scheduledFor).toLocaleDateString()} at {new Date(session.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Button variant="secondary" className="whitespace-nowrap">Prepare</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Your Mentees - Individual Coaching Relationships */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6" />
          Your Mentees ({data.activeMentees.length})
        </h2>

        {data.activeMentees.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">No mentees yet</p>
            <Button className="mt-4">Find Someone to Mentor</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activeMentees.map(mentee => (
              <Card key={mentee.id} className="p-5 hover:border-primary-500 transition-all cursor-pointer">
                <div className="space-y-4">
                  {/* Mentee Header */}
                  <div>
                    <h3 className="font-bold text-white text-lg">{mentee.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {mentee.focusArea}
                    </p>
                  </div>

                  {/* Progress/Progression */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-300">Journey Progress</span>
                      <span className="text-sm font-bold text-primary-400">{mentee.progression}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${mentee.progression}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 text-sm flex items-center justify-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Message
                    </Button>
                    <Button variant="secondary" className="flex-1 text-sm">View Progress</Button>
                  </div>

                  {/* Next Session Info */}
                  {mentee.nextSession && (
                    <div className="text-xs bg-dark-700 p-3 rounded">
                      <p className="text-gray-400">Next session:</p>
                      <p className="text-white font-semibold mt-1">{mentee.nextSession}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <MessageSquare className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white">Send Feedback</h3>
            <p className="text-xs text-gray-400 mt-2">Provide guidance to your mentees</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-semibold text-white">Mentee Growth</h3>
            <p className="text-xs text-gray-400 mt-2">Track their development</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
