"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUserProgress } from "@/hooks/useLMS";
import {
  Users,
  Network,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Share2,
  Award,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Plus,
  Heart,
  MessageCircle,
} from "lucide-react";

export default function CircleMemberDashboard() {
  const profileStats = {
    connections: 127,
    followers: 342,
    posts: 24,
    engagementRate: 8.5,
    profileViews: 1203,
  };

  const connections = [
    {
      id: "conn_1",
      name: "Adekunle Okonkwo",
      title: "Fintech Founder",
      company: "PayStack Nigeria",
      location: "Lagos, Nigeria",
      mutualConnections: 12,
      connected: true,
    },
    {
      id: "conn_2",
      name: "Ngozi Adeyemi",
      title: "Tech Lead",
      company: "Google Africa",
      location: "Abuja, Nigeria",
      mutualConnections: 8,
      connected: true,
    },
    {
      id: "conn_3",
      name: "Chidi Obi",
      title: "Product Manager",
      company: "Flutterwave",
      location: "Lagos, Nigeria",
      mutualConnections: 15,
      connected: false,
    },
  ];

  const posts = [
    {
      id: 1,
      author: "You",
      content: "Just completed the Financial Literacy course! So grateful for the insights on business financing. Ready to scale! 🚀",
      likes: 24,
      comments: 5,
      shares: 3,
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      author: "Adekunle Okonkwo",
      content: "The future of African tech is now. Let's build solutions that matter.",
      likes: 342,
      comments: 28,
      shares: 45,
      timestamp: "5 hours ago",
    },
  ];

  const opportunities = [
    {
      id: "opp_1",
      title: "Co-Founder Needed - EdTech Startup",
      company: "TechStart Nigeria",
      type: "Co-founder",
      location: "Remote",
      posted: "2 days ago",
    },
    {
      id: "opp_2",
      title: "Senior Developer - Fin-tech",
      company: "FinanceX Africa",
      type: "Job",
      location: "Lagos, Nigeria",
      posted: "3 days ago",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in" style={{ animationDelay: "0ms" }}>
        <div>
          <h1 className="text-5xl font-black text-white mb-2">
            ImpactCircle Professional Network 📋
          </h1>
          <p className="text-lg text-gray-300">Connect, collaborate, and grow with industry leaders</p>
        </div>
        <Button variant="primary" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create Post
        </Button>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Connections Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-xl transition-all duration-300 border border-primary-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Network className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Connections</p>
            <p className="text-3xl font-black">{profileStats.connections}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Followers Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:shadow-xl transition-all duration-300 border border-secondary-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Followers</p>
            <p className="text-3xl font-black">{profileStats.followers}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Posts Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 border border-green-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <MessageSquare className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Posts</p>
            <p className="text-3xl font-black">{profileStats.posts}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Engagement Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 border border-blue-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Rate</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Engagement</p>
            <p className="text-3xl font-black">{profileStats.engagementRate}%</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Profile Views Card */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 border border-purple-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Profile Views</p>
            <p className="text-3xl font-black">{profileStats.profileViews}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>
      </div>

      {/* Social Feed and Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "600ms" }}>
        {/* Social Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Network Feed</h2>
            <p className="text-gray-300">See what your network is sharing</p>
          </div>

          <div className="space-y-4">
            {posts.map((post, idx) => (
              <div
                key={post.id}
                className="group rounded-xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-lg transition-all duration-300 p-6 animate-fade-in"
                style={{ animationDelay: `${650 + idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-lg text-text-500">{post.author}</p>
                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-5 leading-relaxed text-base">{post.content}</p>

                <div className="flex items-center gap-8 text-sm text-gray-300">
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors font-semibold">
                    <Heart className="w-5 h-5" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-primary-600 transition-colors font-semibold">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-secondary-600 transition-colors font-semibold">
                    <Share2 className="w-5 h-5" />
                    <span>{post.shares}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Networking Tools</h2>
            <p className="text-gray-300">Get things done quickly</p>
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" className="w-full justify-center gap-2">
              <Network className="w-5 h-5" />
              Find Connections
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-center gap-2">
              <Briefcase className="w-5 h-5" />
              Browse Jobs
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Networking Events
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Connections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Your Network</h2>
            <p className="text-gray-300">Professional connections and collaborators</p>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="group relative overflow-hidden rounded-2xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>

              <div className="relative p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-black text-text-500 mb-1">{conn.name}</h3>
                  <p className="text-sm font-bold text-primary-600">{conn.title}</p>
                  <p className="text-xs text-gray-300">{conn.company}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <MapPin className="w-4 h-4" />
                    {conn.location}
                  </div>
                  <p className="text-xs text-gray-300">
                    <span className="font-semibold">{conn.mutualConnections}</span> mutual connections
                  </p>
                </div>

                <Button
                  variant={conn.connected ? "outline" : "primary"}
                  size="sm"
                  className="w-full"
                >
                  {conn.connected ? "✓ Connected" : "Connect"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Opportunities</h2>
            <p className="text-gray-300">Jobs, partnerships, and collaborations</p>
          </div>
          <Button variant="outline" size="sm">See All</Button>
        </div>

        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="group rounded-xl bg-dark-700/50 border-l-4 border-l-primary-500 hover:border-l-secondary-500 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-black text-text-500 mb-1">{opp.title}</h3>
                  <p className="text-sm text-gray-300">{opp.company}</p>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full whitespace-nowrap">
                  {opp.type}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  {opp.location}
                </div>
                <span className="text-xs text-gray-500">{opp.posted}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
