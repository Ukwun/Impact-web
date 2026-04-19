'use client';

import { useState, useEffect } from 'react';
import { User, Settings } from 'lucide-react';
import { ProfileEditor } from '@/components/ProfileEditor';
import { PreferencesPanel } from '@/components/PreferencesPanel';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

type TabType = 'profile' | 'preferences';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render after client-side hydration
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-dark-800 to-dark-900 border-b border-dark-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-dark-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id
                  ? 'text-primary-500 border-primary-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && <ProfileEditor userId={user.uid} />}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && <PreferencesPanel userId={user.uid} />}
      </div>

      {/* Footer */}
      <div className="bg-dark-800 border-t border-dark-700 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-gray-500">
          <p>
            Need help?{' '}
            <a href="/help" className="text-primary-500 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
