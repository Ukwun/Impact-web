"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/context/AuthStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import {
  Settings as SettingsIcon,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    courseUpdates: true,
    achievementAlerts: true,
    leaderboardUpdates: false,
    mentorMessages: true,
    eventReminders: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showProgress: true,
    showAchievements: true,
    allowMentoring: true,
    showOnlineStatus: true,
  });

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    email: user?.email || "",
    phone: "",
    timezone: "Africa/Lagos",
    language: "en",
    theme: "dark",
    soundEnabled: true,
  });

  // UI State
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);

  // Load user settings on mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, we'll use localStorage or default values
      const savedSettings = localStorage.getItem(`settings_${user?.id}`);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setNotifications(prev => ({ ...prev, ...parsed.notifications }));
        setPrivacy(prev => ({ ...prev, ...parsed.privacy }));
        setAccountSettings(prev => ({ ...prev, ...parsed.account }));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const saveSettings = async (settingsType: string, data: any) => {
    try {
      setIsLoading(true);

      // Save to localStorage (in real app, this would be an API call)
      const currentSettings = JSON.parse(localStorage.getItem(`settings_${user?.id}`) || "{}");
      const updatedSettings = { ...currentSettings, [settingsType]: data };
      localStorage.setItem(`settings_${user?.id}`, JSON.stringify(updatedSettings));

      success("Settings saved successfully!");
    } catch (err) {
      error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      error("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);

      // In a real app, this would call the API
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        error(data.error || "Failed to change password");
      }
    } catch (err) {
      error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Eye },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-text-500">Settings</h1>
            <p className="text-gray-300 font-medium">Manage your account preferences and privacy</p>
          </div>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {/* Account Settings */}
        {activeTab === "account" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={accountSettings.phone}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full"
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={accountSettings.timezone}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="Africa/Lagos">West Africa Time (WAT)</option>
                    <option value="Africa/Khartoum">East Africa Time (EAT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={accountSettings.language}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => saveSettings("account", accountSettings)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </h2>

            <div className="space-y-6">
              {/* Change Password */}
              <div className="border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className="flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>

              {/* Security Status */}
              <div className="border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Security Status</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-300">Password strength</span>
                    </div>
                    <span className="text-green-400 text-sm">Strong</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-300">Two-factor authentication</span>
                    </div>
                    <span className="text-yellow-400 text-sm">Not enabled</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-300">Login alerts</span>
                    </div>
                    <span className="text-green-400 text-sm">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h2>

            <div className="space-y-6">
              {/* Communication Methods */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Communication Methods</h3>
                <div className="space-y-3">
                  {[
                    { key: "email", label: "Email notifications", icon: Mail },
                    { key: "push", label: "Push notifications", icon: Smartphone },
                    { key: "sms", label: "SMS notifications", icon: Phone },
                  ].map(({ key, label, icon: Icon }) => (
                    <label key={key} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">{label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[key as keyof typeof notifications]}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notification Types</h3>
                <div className="space-y-3">
                  {[
                    { key: "courseUpdates", label: "Course updates and announcements" },
                    { key: "achievementAlerts", label: "Achievement unlocks and badges" },
                    { key: "leaderboardUpdates", label: "Leaderboard rank changes" },
                    { key: "mentorMessages", label: "Mentor messages and sessions" },
                    { key: "eventReminders", label: "Event reminders and invitations" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                      <span className="text-gray-300">{label}</span>
                      <input
                        type="checkbox"
                        checked={notifications[key as keyof typeof notifications]}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => saveSettings("notifications", notifications)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Privacy Settings */}
        {activeTab === "privacy" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacy Settings
            </h2>

            <div className="space-y-6">
              {/* Profile Visibility */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Profile Visibility</h3>
                <div className="space-y-3">
                  {[
                    { key: "profileVisible", label: "Make profile visible to other users" },
                    { key: "showProgress", label: "Show learning progress on profile" },
                    { key: "showAchievements", label: "Display achievements and badges" },
                    { key: "allowMentoring", label: "Allow others to request mentoring" },
                    { key: "showOnlineStatus", label: "Show online status to other users" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                      <span className="text-gray-300">{label}</span>
                      <input
                        type="checkbox"
                        checked={privacy[key as keyof typeof privacy]}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Data & Privacy</h3>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    📥 Download my data
                  </Button>

                  <Button variant="outline" className="w-full justify-start text-red-400 border-red-400 hover:bg-red-400/10">
                    🗑️ Delete my account
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Account deletion is permanent and cannot be undone. All your data will be removed.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => saveSettings("privacy", privacy)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}