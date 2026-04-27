import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, Users, MessageSquare, Loader } from 'lucide-react';
import CircleDiscoveryModal from '@/components/CircleDiscoveryModal';
import CircleDiscussionModal from '@/components/CircleDiscussionModal';
import CircleMembersModal from '@/components/CircleMembersModal';

interface Metrics {
  joinedCircles: number;
  activeDiscussions: number;
  myContributions: number;
  messagesCount: number;
  recentActivity: string;
}

interface Circle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  focusAreas: string[];
  recentActivity: string;
  joined: boolean;
}

interface Discussion {
  id: string;
  author: string;
  authorRole?: string;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
  isLiked: boolean;
  tags: string[];
}

interface CircleMember {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  contributions: number;
  discussions: number;
  joinedDate: string;
  bio: string;
}

export default function CircleMemberDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Load dashboard metrics
      const metricsRes = await fetch('/api/circle/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!metricsRes.ok) throw new Error('Failed to load metrics');
      const metricsData = await metricsRes.json();
      const dashboardData = metricsData?.data ?? {};
      setMetrics({
        joinedCircles: dashboardData?.communityCount?.joined ?? dashboardData?.joinedCommunities?.length ?? 0,
        activeDiscussions: dashboardData?.recentDiscussions?.length ?? 0,
        myContributions: dashboardData?.contributionScore ?? 0,
        messagesCount: dashboardData?.unreadMessages ?? 0,
        recentActivity: dashboardData?.recentDiscussions?.[0]?.createdAt
          ? new Date(dashboardData.recentDiscussions[0].createdAt).toLocaleDateString()
          : 'No recent activity',
      });

      const joinedCommunityIds = new Set<string>(
        (dashboardData?.joinedCommunities ?? []).map((community: any) => community.id)
      );

      // Load circles
      const circlesRes = await fetch('/api/circle/networks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!circlesRes.ok) throw new Error('Failed to load circles');
      const circlesData = await circlesRes.json();
      const mappedCircles: Circle[] = (circlesData?.data ?? []).map((circle: any) => ({
        id: circle.id,
        name: circle.name,
        description: circle.description,
        memberCount: circle.memberCount ?? 0,
        category: circle.focusArea || 'General',
        focusAreas: circle.focusArea ? [circle.focusArea] : ['General'],
        recentActivity: 'Recently active',
        joined: joinedCommunityIds.has(circle.id),
      }));
      setCircles(mappedCircles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circleId: string) => {
    if (!token) return;

    try {
      const res = await fetch('/api/circle/networks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ communityId: circleId, action: 'join' }),
      });

      if (!res.ok) throw new Error('Failed to join circle');
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join circle');
    }
  };

  const handleViewDiscussions = async (circle: Circle) => {
    setSelectedCircle(circle);
    if (!token) return;

    try {
      const res = await fetch('/api/circle/discussions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load discussions');
      const discussionsData = await res.json();
      const mappedDiscussions: Discussion[] = (discussionsData?.data ?? []).map((discussion: any) => ({
        id: discussion.id,
        author: discussion.author?.name || 'Unknown Member',
        authorRole: discussion.author?.role,
        title: discussion.title,
        content: discussion.content,
        createdAt: discussion.createdAt,
        likes: discussion.likes ?? 0,
        replies: discussion.replies ?? 0,
        isLiked: false,
        tags: [],
      }));

      const filtered = mappedDiscussions.filter((discussion: any) => {
        const communityName = (discussionsData?.data ?? []).find((d: any) => d.id === discussion.id)?.communityName;
        return communityName ? communityName === circle.name : true;
      });

      setDiscussions(filtered.length > 0 ? filtered : mappedDiscussions);
      setShowDiscussionModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load discussions');
    }
  };

  const handleViewMembers = async (circle: Circle) => {
    setSelectedCircle(circle);
    if (!token) return;

    try {
      const res = await fetch('/api/circle-member', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load members');
      const membersData = await res.json();
      const mappedMembers: CircleMember[] = (membersData?.data?.connections ?? []).map((member: any) => ({
        id: member.id,
        name: member.name,
        title: member.title || 'Professional',
        expertise: member.company ? [member.company] : ['Professional Growth'],
        contributions: member.mutualConnections ?? 0,
        discussions: member.connected ? 1 : 0,
        joinedDate: new Date().toISOString(),
        bio: `${member.name} is active in the ${circle.name} network.`,
      }));
      setMembers(mappedMembers);
      setShowMembersModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    }
  };

  const handlePostDiscussion = async (title: string, content: string, tags: string[]) => {
    if (!token || !selectedCircle) return;

    try {
      const res = await fetch('/api/circle/discussions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId: selectedCircle.id,
          title,
          content,
          tags,
        }),
      });

      if (!res.ok) throw new Error('Failed to post discussion');
      await handleViewDiscussions(selectedCircle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post discussion');
    }
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    setDiscussions((prev) =>
      prev.map((discussion) => {
        if (discussion.id !== discussionId) return discussion;

        const nextLiked = !discussion.isLiked;
        return {
          ...discussion,
          isLiked: nextLiked,
          likes: nextLiked ? discussion.likes + 1 : Math.max(discussion.likes - 1, 0),
        };
      })
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Professional Circles</h1>
          <p className="text-gray-600">
            Join professional communities, engage in discussions, and grow your network
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Circles Joined</h3>
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.joinedCircles}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Active Discussions</h3>
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeDiscussions}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">My Contributions</h3>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.myContributions}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Messages Sent</h3>
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.messagesCount}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Recent Activity</h3>
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">{metrics.recentActivity}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowDiscoveryModal(true)}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 rounded-lg p-6 transition-all text-left"
          >
            <Zap className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Explore Circles</h3>
            <p className="text-sm text-gray-600">Find and join new professional circles</p>
          </button>

          <button
            onClick={() => {
              const joinedCircles = circles.filter(c => c.joined);
              if (joinedCircles.length > 0) {
                handleViewDiscussions(joinedCircles[0]);
              } else {
                setError('Join a circle first to start discussions');
              }
            }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 rounded-lg p-6 transition-all text-left"
          >
            <MessageSquare className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Discussions</h3>
            <p className="text-sm text-gray-600">Participate in circle discussions</p>
          </button>

          <button
            onClick={() => {
              const joinedCircles = circles.filter(c => c.joined);
              if (joinedCircles.length > 0) {
                handleViewMembers(joinedCircles[0]);
              } else {
                setError('Join a circle first to view members');
              }
            }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg p-6 transition-all text-left"
          >
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Members</h3>
            <p className="text-sm text-gray-600">Connect with other circle members</p>
          </button>
        </div>

        {/* My Circles */}
        {circles.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">My Professional Circles</h2>
            </div>

            <div className="divide-y">
              {circles.filter(c => c.joined).length > 0 ? (
                circles
                  .filter(c => c.joined)
                  .map(circle => (
                    <div key={circle.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{circle.name}</h3>
                          <p className="text-gray-600 text-sm">{circle.description}</p>
                        </div>
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {circle.category}
                        </span>
                      </div>

                      <div className="flex gap-2 mb-4 flex-wrap">
                        {circle.focusAreas.slice(0, 3).map((area, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
                          >
                            {area}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewDiscussions(circle)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                          View Discussions
                        </button>
                        <button
                          onClick={() => handleViewMembers(circle)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                          View Members ({circle.memberCount})
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-4">You haven't joined any circles yet</p>
                  <button
                    onClick={() => setShowDiscoveryModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Join Your First Circle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CircleDiscoveryModal
        isOpen={showDiscoveryModal}
        circles={circles}
        onClose={() => setShowDiscoveryModal(false)}
        onJoinCircle={handleJoinCircle}
      />

      <CircleDiscussionModal
        isOpen={showDiscussionModal}
        circleName={selectedCircle?.name}
        discussions={discussions}
        onClose={() => setShowDiscussionModal(false)}
        onPostDiscussion={handlePostDiscussion}
        onLikeDiscussion={handleLikeDiscussion}
      />

      <CircleMembersModal
        isOpen={showMembersModal}
        circleName={selectedCircle?.name}
        members={members}
        onClose={() => setShowMembersModal(false)}
      />
    </div>
  );
}
