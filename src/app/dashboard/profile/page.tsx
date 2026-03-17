"use client";

import { useAuthStore } from "@/context/AuthStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
  Settings,
  Edit2,
  Lock,
  Shield,
  LogOut,
  Star,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  const achievements = [
    { icon: "🏆", title: "Early Adopter", desc: "Joined ImpactApp in Month 1" },
    { icon: "📚", title: "Course Master", desc: "Completed 2 Courses" },
    { icon: "🔥", title: "7 Day Streak", desc: "Active every day this week" },
    { icon: "⭐", title: "5 Star Rated", desc: "Received great feedback" },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">My Profile</h1>
            <p className="text-gray-300 font-medium">Manage your account information</p>
          </div>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Avatar Section */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-5xl font-black mb-4 shadow-lg">
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-text-500 text-center mb-2">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm font-bold px-4 py-1.5 bg-primary-500 text-white rounded-full mb-4 capitalize">
              {user?.role.replace("_", " ")}
            </p>
            <Button variant="outline" size="sm" className="w-full justify-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>

          {/* Information Section */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-bold text-text-500 mb-6">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase">Email Address</label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold text-text-500">{user?.email}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase">Phone Number</label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold text-text-500">{user?.phone}</span>
                </div>
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase">State</label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold text-text-500">{user?.state}</span>
                </div>
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase">Institution</label>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <Building className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold text-text-500">{user?.institution || "Not specified"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-dark-700/50 border border-primary-500/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-primary-700 font-semibold">Courses Completed</p>
              <p className="text-2xl font-black text-primary-600">2</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-secondary-50 border border-secondary-200">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-secondary-600" />
            <div>
              <p className="text-xs text-secondary-700 font-semibold">Total Points</p>
              <p className="text-2xl font-black text-secondary-600">450</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-700 font-semibold">Current Streak</p>
              <p className="text-2xl font-black text-blue-600">7 days</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-purple-50 border border-purple-200">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-purple-700 font-semibold">Achievements</p>
              <p className="text-2xl font-black text-purple-600">4</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-secondary-600" />
          <h3 className="text-2xl font-bold text-text-500">Achievements</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, idx) => (
            <Card key={idx} className="p-6 text-center hover:shadow-lg transition-all group">
              <div className="text-4xl mb-3">{achievement.icon}</div>
              <h4 className="font-bold text-text-500 mb-1">{achievement.title}</h4>
              <p className="text-xs text-gray-300">{achievement.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Settings Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-bold text-text-500">Security & Privacy</h3>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Lock className="w-4 h-4" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Shield className="w-4 h-4" />
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Settings className="w-4 h-4" />
              Privacy Settings
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Mail className="w-4 h-4" />
              Email Preferences
            </Button>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-6 h-6 text-secondary-600" />
            <h3 className="text-xl font-bold text-text-500">Account Settings</h3>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Edit2 className="w-4 h-4" />
              Edit Profile Information
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Calendar className="w-4 h-4" />
              Download Your Data
            </Button>
            <Button variant="light" className="w-full justify-start gap-2" size="sm">
              <Mail className="w-4 h-4" />
              Request Email Verification
            </Button>
            <Button variant="danger" className="w-full justify-start gap-2" size="sm">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="p-6 border-2 border-danger-200 bg-danger-50">
        <h3 className="text-lg font-bold text-danger-700 mb-4">Danger Zone</h3>
        <p className="text-sm text-gray-700 mb-4">
          These actions cannot be undone. Please proceed with caution.
        </p>
        <Button variant="danger" className="w-full justify-center">
          Delete Account Permanently
        </Button>
      </Card>
    </div>
  );
}
