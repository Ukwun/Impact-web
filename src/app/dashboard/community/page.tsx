"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  MessageCircle,
  Users,
  Share2,
  Heart,
  Search,
  TrendingUp,
  Zap,
  UserPlus,
} from "lucide-react";

interface Group {
  id: number;
  name: string;
  members: number;
  description: string;
  icon: string;
  color: "primary" | "secondary" | "pink" | "purple" | "blue";
  joined: boolean;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  role: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  liked: boolean;
}

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 1,
      name: "Student Entrepreneurs",
      members: 2543,
      description: "Connect with fellow student entrepreneurs and share ideas",
      icon: "🚀",
      color: "primary",
      joined: true,
    },
    {
      id: 2,
      name: "Financial Literacy Network",
      members: 1823,
      description: "Discuss personal finance, budgeting, and wealth building",
      icon: "💰",
      color: "secondary",
      joined: true,
    },
    {
      id: 3,
      name: "Mentorship Circle",
      members: 892,
      description: "Find mentors and share valuable insights from industry experts",
      icon: "👨‍🏫",
      color: "pink",
      joined: false,
    },
    {
      id: 4,
      name: "Climate Action Advocates",
      members: 1456,
      description: "Drive sustainable change and environmental awareness",
      icon: "🌱",
      color: "purple",
      joined: false,
    },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Sarah Okonkwo",
      avatar: "SO",
      role: "Student Entrepreneur",
      content:
        "Just launched my first side hustle! Excited to share my journey with this amazing community. The support from everyone here has been incredible! 🎉",
      likes: 234,
      comments: 45,
      timestamp: "2 hours ago",
      liked: false,
    },
    {
      id: 2,
      author: "Chukwu Adeyemi",
      role: "Campus Lead",
      avatar: "CA",
      content:
        "Reminder: Financial literacy workshop this Saturday at 2 PM. We'll be covering budgeting strategies and investment basics. Don't miss out!",
      likes: 521,
      comments: 89,
      timestamp: "4 hours ago",
      liked: false,
    },
    {
      id: 3,
      author: "Aisha Mohammed",
      role: "Mentor",
      avatar: "AM",
      content:
        "Mentorship takes time and effort but the impact on young lives is immeasurable. If you want to make a difference, join our mentorship circle!",
      likes: 315,
      comments: 67,
      timestamp: "6 hours ago",
      liked: false,
    },
  ]);

  const toggleJoinGroup = (id: number) => {
    setGroups(
      groups.map((g) => (g.id === id ? { ...g, joined: !g.joined } : g))
    );
  };

  const toggleLikePost = (id: number) => {
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const getGroupColors = (color: string) => {
    switch (color) {
      case "primary":
        return { bg: "bg-dark-700/50", border: "border-primary-500/50", badge: "bg-primary-500/30" };
      case "secondary":
        return { bg: "bg-dark-700/50", border: "border-secondary-500/50", badge: "bg-secondary-500/30" };
      case "pink":
        return { bg: "bg-pink-50", border: "border-pink-200", badge: "bg-pink-100" };
      case "purple":
        return { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100" };
      default:
        return { bg: "bg-dark-700/50", border: "border-blue-500/50", badge: "bg-blue-500/30" };
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const joinedCount = groups.filter(g => g.joined).length;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Community</h1>
            <p className="text-gray-300 font-medium">Connect with impact-driven learners</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-dark-700/50 border border-primary-500/50">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-primary-700 font-semibold">Groups Joined</p>
              <p className="text-2xl font-black text-primary-600">{joinedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-dark-700/50 border border-secondary-500/50">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-secondary-600" />
            <div>
              <p className="text-xs text-secondary-700 font-semibold">Active Posts</p>
              <p className="text-2xl font-black text-secondary-600">{posts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-dark-700/50 border border-blue-500/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-700 font-semibold">Community Members</p>
              <p className="text-2xl font-black text-blue-600">28.5k</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Groups */}
      <div>
        <label className="block text-sm font-bold text-text-500 mb-3">
          Discover Groups
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12"
          />
        </div>
      </div>

      {/* Featured Groups */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-text-500">Featured Groups</h2>
          <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-bold">
            {filteredGroups.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGroups.map((group) => {
            const colors = getGroupColors(group.color as any);
            return (
              <Card
                key={group.id}
                className={`p-6 ${colors.bg} border-2 ${colors.border} hover:shadow-lg transition-all group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{group.icon}</div>
                  {group.joined && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-primary-500 text-white rounded-full">
                      Joined
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-text-500 mb-2 line-clamp-2">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-200 mb-4 line-clamp-2">
                  {group.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-4">
                  <Users className="w-4 h-4" />
                  {group.members.toLocaleString()} members
                </div>
                <Button
                  variant={group.joined ? "outline" : "primary"}
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => toggleJoinGroup(group.id)}
                >
                  {group.joined ? (
                    <>
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      View Group
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1.5" />
                      Join Now
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Community Feed */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-text-500">Community Feed</h2>
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
            Latest
          </span>
        </div>
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-all">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {post.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-500">{post.author}</h4>
                    <p className="text-xs text-gray-300">
                      {post.role} • {post.timestamp}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-800 mb-6 leading-relaxed text-sm">
                {post.content}
              </p>

              {/* Post Actions */}
              <div className="flex items-center gap-6 text-gray-300 text-sm border-t border-gray-200 pt-4">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-2 font-semibold transition-colors ${
                    post.liked
                      ? "text-primary-600"
                      : "hover:text-primary-600"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`}
                  />
                  {post.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-primary-600 transition-colors font-semibold">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments}
                </button>
                <button className="flex items-center gap-2 hover:text-primary-600 transition-colors font-semibold">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
