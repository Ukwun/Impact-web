"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  Briefcase,
  Users,
  Calendar,
  Loader,
  AlertCircle,
  Target,
  Network,
  Zap,
} from "lucide-react";

interface Peer {
  id: string;
  name: string;
  specialization: string;
  location?: string;
  isConnected: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  attendees: number;
}

interface Opportunity {
  id: string;
  title: string;
  type: "scholarship" | "career" | "internship";
  deadline: string;
}

interface UniMemberDashboardData {
  name: string;
  connections: number;
  recommendations: Peer[];
  eventInvitations: Event[];
  opportunities: Opportunity[];
  network: {
    total: number;
    degree2: number;
  };
}

export default function UniMemberDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UniMemberDashboardData | null>(null);
  const { success, error: errorToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/uni/dashboard", {
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

  const urgentOpportunities = data.opportunities.filter(o => {
    const daysLeft = Math.floor((new Date(o.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header - Networking Focus */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">💼 Professional Network</h1>
          <p className="text-gray-300">Connect with peers, explore opportunities, and grow your network</p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">My Connections</p>
            <p className="text-3xl font-black text-primary-400 mt-2">{data.connections}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Direct Network</p>
            <p className="text-3xl font-black text-blue-400 mt-2">{data.network.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">2nd Degree</p>
            <p className="text-3xl font-black text-green-400 mt-2">{data.network.degree2}</p>
          </Card>
        </div>
      </div>

      {/* Urgent Opportunities */}
      {urgentOpportunities.length > 0 && (
        <Card className="p-6 border-l-4 border-orange-500 bg-orange-500/10">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-400">⏰ Deadline Coming Soon</p>
              <div className="space-y-1 mt-2">
                {urgentOpportunities.slice(0, 3).map((opp, idx) => (
                  <p key={idx} className="text-sm text-gray-300">
                    <span className="font-semibold">{opp.title}</span> closes {new Date(opp.deadline).toLocaleDateString()}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommended Connections */}
      {data.recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Recommended Connections ({data.recommendations.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.map(peer => (
              <Card key={peer.id} className="p-5 hover:border-primary-500 transition-all cursor-pointer">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{peer.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{peer.specialization}</p>
                    {peer.location && <p className="text-xs text-gray-400 mt-1">📍 {peer.location}</p>}
                  </div>

                  {peer.isConnected ? (
                    <Button variant="secondary" className="w-full text-sm">✓ Connected</Button>
                  ) : (
                    <Button className="w-full text-sm">+ Connect</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming University Events */}
      {data.eventInvitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            University Events ({data.eventInvitations.length})
          </h2>

          <div className="space-y-3">
            {data.eventInvitations.map(event => (
              <Card key={event.id} className="p-4 hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-gray-400">📅 {new Date(event.date).toLocaleDateString()}</span>
                      <span className="text-gray-400">👥 {event.attendees} attending</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">RSVP</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Career & Educational Opportunities */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6" />
          Opportunities ({data.opportunities.length})
        </h2>

        <div className="space-y-3">
          {data.opportunities.map(opp => {
            const daysLeft = Math.floor((new Date(opp.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return (
              <Card key={opp.id} className="p-4 hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{opp.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        opp.type === 'scholarship' ? 'bg-blue-500/20 text-blue-400' :
                        opp.type === 'career' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {opp.type === 'scholarship' ? '🎓' : opp.type === 'career' ? '💼' : '🚀'} {opp.type}
                      </span>
                      <span className={`text-xs font-semibold ${
                        daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {daysLeft} days left
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Learn More</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Network Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <Network className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white">Browse All Peers</h3>
            <p className="text-xs text-gray-400 mt-2">Discover professionals in your field</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <Briefcase className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold text-white">My Profile</h3>
            <p className="text-xs text-gray-400 mt-2">Showcase your expertise</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
