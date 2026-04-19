"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useMentorData } from "@/hooks/useRoleDashboards";
import {
  Users,
  Calendar,
  MessageSquare,
  Target,
  CheckCircle,
  Plus,
  TrendingUp,
  BookOpen,
  Award,
  Loader,
  AlertCircle,
} from "lucide-react";
import {
  KPICard,
  ActionCard,
  InsightCard,
} from "@/components/dashboard/cards";

export default function MentorDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: mentorData, loading, error } = useMentorData();
  const { success } = useToast();

  // Animation trigger
  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-12 flex flex-col items-center gap-4 animate-fade-in">
          <Loader className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-gray-300 text-lg">Loading your mentor dashboard...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-l-4 border-danger-500 bg-danger-50 animate-fade-in">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-7 h-7 text-danger-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-danger-700 text-lg">Error Loading Mentor Dashboard</h3>
            <p className="text-danger-600 mt-2">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div
        className={`flex items-start justify-between transition-all duration-700 transform ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div>
          <h1 className="text-5xl font-black text-white mb-2">
            Mentor Dashboard 🎯
          </h1>
          <p className="text-lg text-gray-300">Guide and support your mentees to reach their full potential</p>
        </div>
        <Button variant="primary" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Add Mentee
        </Button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Mentees */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-xl transition-all duration-300 border border-primary-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Active Mentees</p>
            <p className="text-3xl font-black">{mentorStats.totalMentees}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Upcoming Meetings */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:shadow-xl transition-all duration-300 border border-secondary-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Upcoming</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Meetings</p>
            <p className="text-3xl font-black">{mentorStats.upcomingMeetings}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Completed Sessions */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 border border-green-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Sessions Done</p>
            <p className="text-3xl font-black">{mentorStats.completedSessions}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>

        {/* Active Sessions */}
        <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 border border-blue-400 border-opacity-50 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 opacity-90" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-sm opacity-90 mb-2 font-medium">Sessions Now</p>
            <p className="text-3xl font-black">{mentorStats.activeSessions}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
        </div>
      </div>

      {/* Upcoming Sessions and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "500ms" }}>
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Upcoming Sessions</h2>
            <p className="text-gray-300">Your scheduled mentoring meetings</p>
          </div>

          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <div
                key={session.id}
                className="group rounded-xl bg-dark-700/50 border-l-4 border-l-primary-500 hover:border-l-secondary-500 p-5 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${550 + idx * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-text-500">{session.mentee}</p>
                    <p className="text-sm text-gray-300">Topic: {session.topic}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full whitespace-nowrap">
                    {session.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4" />
                    {session.date}
                  </div>
                  <Button variant="primary" size="sm">
                    Join Session
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "700ms" }}>
          <div>
            <h2 className="text-3xl font-black text-text-500 mb-1">Quick Actions</h2>
            <p className="text-gray-300">Get things done quickly</p>
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" className="w-full justify-center gap-2 animate-fade-in" style={{ animationDelay: "750ms" }}>
              <Calendar className="w-5 h-5" />
              Schedule Meeting
            </Button>
            <Button variant="secondary" size="lg" className="w-full justify-center gap-2 animate-fade-in" style={{ animationDelay: "850ms" }}>
              <MessageSquare className="w-5 h-5" />
              Send Message
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center gap-2 animate-fade-in" style={{ animationDelay: "950ms" }}>
              <Target className="w-5 h-5" />
              Set Goals
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center gap-2 animate-fade-in" style={{ animationDelay: "1050ms" }}>
              <BookOpen className="w-5 h-5" />
              Share Resource
            </Button>
          </div>
        </div>
      </div>

      {/* Mentees Progress */}
      <div className="space-y-6 animate-fade-in" style={{ animationDelay: "1100ms" }}>
        <div>
          <h2 className="text-3xl font-black text-text-500 mb-1">Mentee Progress</h2>
          <p className="text-gray-300">Track your mentees' development and achievements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mentees.map((mentee, idx) => (
            <div
              key={mentee.id}
              className="group relative overflow-hidden rounded-2xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${1150 + idx * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>

              <div className="relative p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-text-500 mb-1">{mentee.name}</h3>
                    <p className="text-sm text-gray-300">{mentee.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                      mentee.status === "Exceeding Goals"
                        ? "bg-green-100 text-green-700"
                        : mentee.status === "On Track"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {mentee.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</span>
                    <span className="text-sm font-bold text-primary-600">{mentee.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${mentee.progress}%` }}
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>

                {/* Meeting Info */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <p className="text-xs text-gray-300">
                    <span className="font-bold">Last Meeting:</span> {mentee.lastMeeting}
                  </p>
                  <p className="text-xs font-bold text-primary-600">{mentee.nextMeeting}</p>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentoring Guidelines */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-8 border-2 border-primary-400 border-opacity-50">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black mb-4">Effective Mentoring Strategies</h3>
            <ul className="text-primary-50 space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-white opacity-80"></span>
                Listen actively and ask meaningful questions
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-white opacity-80"></span>
                Set clear, achievable goals with your mentees
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-white opacity-80"></span>
                Provide constructive feedback and encouragement
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-white opacity-80"></span>
                Track progress and celebrate milestones together
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
