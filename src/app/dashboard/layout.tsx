'use client';

import { useAuthStore } from '@/context/AuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import NetworkStatus from '@/components/NetworkStatus';
import { SkipLink } from '@/components/ui/Accessibility';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, hasHydrated } = useAuthStore();

  // Protect dashboard from unauthenticated users
  useEffect(() => {
    if (!hasHydrated) return; // Wait for hydration to complete before redirecting

    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, hasHydrated, router]);

  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-6 text-white font-semibold text-lg">Loading your dashboard...</p>
          <p className="mt-2 text-gray-400 text-sm">Preparing your personalized experience</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-white font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-600">
      <SkipLink />
      <NetworkStatus />
      <DashboardSidebar />
      <main id="main-content" className="lg:ml-64 transition-all duration-300">
        <div 
          className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          style={{
            paddingTop: `max(1.5rem, calc(1.5rem + env(safe-area-inset-top)))`,
            paddingRight: `max(1rem, env(safe-area-inset-right))`,
            paddingLeft: `max(1rem, env(safe-area-inset-left))`,
            paddingBottom: `max(1.5rem, env(safe-area-inset-bottom))`,
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

