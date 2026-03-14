'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Users, BookOpen, Calendar, Award, TrendingUp, MessageSquare } from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Active Mentees', value: '12', color: 'primary' },
    { icon: BookOpen, label: 'Sessions Held', value: '24', color: 'secondary' },
    { icon: Calendar, label: 'Upcoming Sessions', value: '3', color: 'green' },
    { icon: TrendingUp, label: 'Impact Score', value: '8.7/10', color: 'blue' },
  ];

  const mentees = [
    {
      id: 1,
      name: 'Adebayo Okonkwo',
      focus: 'Entrepreneurship',
      sessions: 5,
      progress: 75,
    },
    {
      id: 2,
      name: 'Chioma Adeyemi',
      focus: 'Tech Skills',
      sessions: 3,
      progress: 60,
    },
    {
      id: 3,
      name: 'Emeka Nwosu',
      focus: 'Leadership',
      sessions: 7,
      progress: 85,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Welcome back, Mentor {user?.firstName}! 👨‍🏫
        </h1>
        <p className="text-gray-400">
          Track your mentees' progress and manage mentoring sessions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            primary: 'from-primary-500 to-primary-600',
            secondary: 'from-secondary-500 to-secondary-600',
            green: 'from-green-500 to-green-600',
            blue: 'from-blue-500 to-blue-600',
          };

          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-dark-500 to-dark-600 rounded-2xl p-6 border-2 border-dark-400 hover:border-primary-500 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[stat.color]} flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mentees */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">Your Mentees</h2>
            <button className="text-primary-400 hover:text-primary-300 font-semibold text-sm">
              + Add Mentee
            </button>
          </div>

          <div className="space-y-4">
            {mentees.map((mentee) => (
              <div
                key={mentee.id}
                className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg p-6 border-2 border-dark-400 hover:border-primary-500 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{mentee.name}</h3>
                    <p className="text-sm text-gray-400">{mentee.focus}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                    {mentee.sessions} sessions
                  </span>
                </div>

                <div className="w-full bg-dark-400 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                    style={{ width: `${mentee.progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Progress: {mentee.progress}%</span>
                  <button className="text-primary-400 hover:text-primary-300 font-semibold text-sm">
                    Schedule Session →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white mb-6">Quick Actions</h2>

          <div className="space-y-3">
            <button className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold transition-all duration-300 flex items-center gap-3 justify-center">
              <Calendar size={20} />
              Schedule Session
            </button>

            <button className="w-full px-6 py-4 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white rounded-lg font-bold transition-all duration-300 flex items-center gap-3 justify-center">
              <MessageSquare size={20} />
              Send Message
            </button>

            <button className="w-full px-6 py-4 bg-dark-500 hover:bg-dark-400 text-white rounded-lg font-bold transition-all duration-300 border-2 border-dark-400 flex items-center gap-3 justify-center">
              <BookOpen size={20} />
              Share Resource
            </button>
          </div>

          {/* Upcoming Sessions */}
          <div className="mt-8 bg-gradient-to-br from-dark-500 to-dark-600 rounded-lg p-6 border-2 border-dark-400">
            <h3 className="font-bold text-white mb-4">Upcoming Sessions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-dark-400">
                <div>
                  <p className="text-sm font-semibold text-white">Adebayo - Pitch Prep</p>
                  <p className="text-xs text-gray-400">Today at 3:00 PM</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-400">
                <div>
                  <p className="text-sm font-semibold text-white">Chioma - Tech Coaching</p>
                  <p className="text-xs text-gray-400">Tomorrow at 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-white">Emeka - Leadership Dev</p>
                  <p className="text-xs text-gray-400">Thursday at 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
