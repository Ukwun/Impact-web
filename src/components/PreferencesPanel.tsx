'use client';

import { useState } from 'react';
import { Bell, Lock, Moon, Languages, Save, Loader, Check, AlertCircle } from 'lucide-react';
import { useUserPreferences, useProfileMutations } from '@/hooks/useProfile';
import { useNotifications } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';
import {
  NotificationPreference,
  PrivacyLevel,
  LANGUAGES,
  type UserPreferences,
} from '@/types/userProfile';

interface PreferencesPanelProps {
  userId: string;
  onSave?: () => void;
}

const NOTIFICATION_OPTIONS: Array<{ value: NotificationPreference; label: string; desc: string }> =
  [
    {
      value: 'ALL',
      label: 'All Notifications',
      desc: 'Receive all notifications including updates and announcements',
    },
    {
      value: 'IMPORTANT',
      label: 'Important Only',
      desc: 'Only receive critical notifications and action required items',
    },
    {
      value: 'NONE',
      label: 'None',
      desc: 'Disable all notifications',
    },
  ];

const PRIVACY_OPTIONS: Array<{ value: PrivacyLevel; label: string; desc: string }> = [
  {
    value: 'PUBLIC',
    label: 'Public',
    desc: 'Anyone can view your profile and activity',
  },
  {
    value: 'FRIENDS',
    label: 'Friends Only',
    desc: 'Only your connections can view your profile',
  },
  {
    value: 'PRIVATE',
    label: 'Private',
    desc: 'Only you can view your profile',
  },
];

export function PreferencesPanel({ userId, onSave }: PreferencesPanelProps) {
  const { preferences, isLoading: isLoadingPreferences } = useUserPreferences(userId);
  const { updatePreferences, isLoading } = useProfileMutations();
  const { addNotification } = useNotifications();

  // Form state
  const [notifications, setNotifications] = useState<NotificationPreference>('IMPORTANT');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [courseNotifications, setCourseNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('PUBLIC');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState('en');
  const [isDirty, setIsDirty] = useState(false);

  // Initialize when preferences load
  if (preferences && !isDirty) {
    setNotifications(preferences.notifications || 'IMPORTANT');
    setEmailNotifications(preferences.emailNotifications ?? true);
    setCourseNotifications(preferences.courseNotifications ?? true);
    setEventNotifications(preferences.eventNotifications ?? true);
    setWeeklyDigest(preferences.weeklyDigest ?? true);
    setPrivacyLevel(preferences.privacyLevel || 'PUBLIC');
    setTheme(preferences.theme || 'dark');
    setLanguage(preferences.language || 'en');
  }

  const handleSave = async () => {
    try {
      const updatedPreferences: Partial<UserPreferences> = {
        notifications,
        emailNotifications,
        courseNotifications,
        eventNotifications,
        weeklyDigest,
        privacyLevel,
        theme,
        language,
      };

      await updatePreferences(userId, updatedPreferences);

      setIsDirty(false);

      addNotification(
        createNotification(
          'Preferences Updated',
          'Your settings have been saved successfully',
          'success',
          { priority: 'low', duration: 4000 }
        )
      );

      onSave?.();
    } catch (err) {
      addNotification(
        createNotification('Save Failed', 'Could not save preferences', 'error', {
          priority: 'high',
        })
      );
    }
  };

  if (isLoadingPreferences) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" />
          Notification Preferences
        </h3>

        {/* Notification Level */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Notification Level</p>
          <div className="space-y-2">
            {NOTIFICATION_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-start gap-3 cursor-pointer p-3 rounded hover:bg-dark-800 transition">
                <input
                  type="radio"
                  name="notifications"
                  value={option.value}
                  checked={notifications === option.value}
                  onChange={(e) => {
                    setNotifications(e.target.value as NotificationPreference);
                    setIsDirty(true);
                  }}
                  className="mt-1 w-4 h-4 text-primary-500 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-white">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Toggle Notifications */}
        <div className="space-y-3 border-t border-dark-600 pt-6">
          <Toggle
            label="Email Notifications"
            value={emailNotifications}
            onChange={(v) => {
              setEmailNotifications(v);
              setIsDirty(true);
            }}
          />
          <Toggle
            label="Course Notifications"
            value={courseNotifications}
            onChange={(v) => {
              setCourseNotifications(v);
              setIsDirty(true);
            }}
          />
          <Toggle
            label="Event Notifications"
            value={eventNotifications}
            onChange={(v) => {
              setEventNotifications(v);
              setIsDirty(true);
            }}
          />
          <Toggle
            label="Weekly Digest"
            value={weeklyDigest}
            onChange={(v) => {
              setWeeklyDigest(v);
              setIsDirty(true);
            }}
            description="Receive a summary of activity and recommendations once per week"
          />
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-500" />
          Privacy & Security
        </h3>

        <p className="text-sm text-gray-400 mb-3">Profile Visibility</p>
        <div className="space-y-2">
          {PRIVACY_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-start gap-3 cursor-pointer p-3 rounded hover:bg-dark-800 transition">
              <input
                type="radio"
                name="privacy"
                value={option.value}
                checked={privacyLevel === option.value}
                onChange={(e) => {
                  setPrivacyLevel(e.target.value as PrivacyLevel);
                  setIsDirty(true);
                }}
                className="mt-1 w-4 h-4 text-primary-500 cursor-pointer"
              />
              <div>
                <p className="font-medium text-white">{option.label}</p>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Display & Language */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary-500" />
          Display & Language
        </h3>

        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value as 'light' | 'dark');
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-2">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">
          Some changes may take effect after you refresh the page or log in again.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isLoading || !isDirty}
          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>

        {isDirty && (
          <button
            onClick={() => {
              if (preferences) {
                setNotifications(preferences.notifications || 'IMPORTANT');
                setEmailNotifications(preferences.emailNotifications ?? true);
                setCourseNotifications(preferences.courseNotifications ?? true);
                setEventNotifications(preferences.eventNotifications ?? true);
                setWeeklyDigest(preferences.weeklyDigest ?? true);
                setPrivacyLevel(preferences.privacyLevel || 'PUBLIC');
                setTheme(preferences.theme || 'dark');
                setLanguage(preferences.language || 'en');
                setIsDirty(false);
              }
            }}
            className="px-4 py-2 bg-dark-600 text-white rounded-lg font-medium hover:bg-dark-500 transition"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Toggle Component
 */
interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

function Toggle({ label, value, onChange, description }: ToggleProps) {
  return (
    <div className="flex items-start justify-between p-3 rounded hover:bg-dark-800 transition gap-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition ${
          value ? 'bg-primary-500' : 'bg-dark-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
          style={{ marginTop: '2px' }}
        />
      </button>
    </div>
  );
}
