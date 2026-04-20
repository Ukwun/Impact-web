"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/authStorage";
import {
  Users,
  MessageSquare,
  Loader,
  AlertCircle,
  Zap,
  Search,
  Heart,
  Share2,
} from "lucide-react";

interface Community {
  id: string;
  name: string;
  members: number;
  isMember: boolean;
  focusArea?: string;
}

interface Discussion {
  id: string;
  communityName: string;
  title: string;
  author: string;
  replies: number;
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  expertise: string[];
  isMutualsConnection: boolean;
}

interface CircleMemberDashboardData {
  joinedCommunities: Community[];
  recentDiscussions: Discussion[];
  suggestedMembers: Member[];
  unreadMessages: number;
  contributionScore: number;
  communityCount: {
    joined: number;
    suggested: number;
  };
}

export default function CircleMemberDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CircleMemberDashboardData | null>(null);
  const { success, error: errorToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/circle/dashboard", {
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
      {/* Header - Community Focus */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">🤝 Community Hub</h1>
          <p className="text-gray-300">Connect, collaborate, and share knowledge with communities</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Communities Joined</p>
            <p className="text-3xl font-black text-primary-400 mt-2">{data.communityCount.joined}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Contribution Score</p>
            <p className="text-3xl font-black text-green-400 mt-2">{data.contributionScore}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-400 text-xs font-semibold">Unread Messages</p>
            <p className="text-3xl font-black text-blue-400 mt-2">{data.unreadMessages}</p>
          </Card>
        </div>
      </div>

      {/* Unread Messages Notification */}
      {data.unreadMessages > 0 && (
        <Card className="p-4 border-l-4 border-blue-500 bg-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <p className="text-blue-400 font-semibold">You have {data.unreadMessages} new message{data.unreadMessages !== 1 ? 's' : ''}</p>
            </div>
            <Button variant="secondary" size="sm">View</Button>
          </div>
        </Card>
      )}

      {/* Your Communities */}
      {data.joinedCommunities.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            My Communities ({data.joinedCommunities.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.joinedCommunities.map(community => (
              <Card key={community.id} className="p-5 hover:border-primary-500 transition-all cursor-pointer">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{community.name}</h3>
                    {community.focusArea && (
                      <p className="text-sm text-gray-400 mt-1">{community.focusArea}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <p className="text-gray-400">Members</p>
                      <p className="font-bold text-white text-lg">{community.members}</p>
                    </div>
                    <Button variant="secondary" size="sm">
                      {community.isMember ? '✓ Joined' : 'Join'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Discussions/Conversations */}
      {data.recentDiscussions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Recent Discussions ({data.recentDiscussions.length})
          </h2>

          <div className="space-y-3">
            {data.recentDiscussions.map(discussion => (
              <Card key={discussion.id} className="p-4 hover:border-primary-500 transition-colors cursor-pointer">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">{discussion.communityName}</p>
                    <h3 className="font-semibold text-white mt-1">{discussion.title}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>by {discussion.author}</span>
                    <span>{discussion.replies} replies</span>
                  </div>

                  <p className="text-xs text-gray-500">{new Date(discussion.createdAt).toRelativeTime?.() || new Date(discussion.createdAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Members to Connect With */}
      {data.suggestedMembers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Suggested Connections ({data.suggestedMembers.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.suggestedMembers.map(member => (
              <Card key={member.id} className="p-5 hover:border-primary-500 transition-all cursor-pointer">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-white">{member.name}</h3>
                    {member.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.expertise.slice(0, 2).map((exp, idx) => (
                          <span key={idx} className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded">
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {member.isMutualsConnection && (
                    <p className="text-xs text-primary-400">🔗 Mutual connection</p>
                  )}

                  <Button className="w-full text-sm">+ Connect</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Community Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Community Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <Search className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white">Browse Communities</h3>
            <p className="text-xs text-gray-400 mt-2">Discover new communities</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <Share2 className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-semibold text-white">Start Discussion</h3>
            <p className="text-xs text-gray-400 mt-2">Share knowledge & insights</p>
          </Card>
          <Card className="p-6 hover:border-primary-500 transition-colors cursor-pointer">
            <Heart className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold text-white">My Profile</h3>
            <p className="text-xs text-gray-400 mt-2">Edit community profile</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
