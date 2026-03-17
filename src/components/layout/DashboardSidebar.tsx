'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  BarChart3,
  MessageSquare,
  Target,
  Network,
} from 'lucide-react';

export default function DashboardSidebar() {
  const router = useRouter();
  const { user, logout } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Dynamic navigation items based on permissions
  const getNavItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ];

    const permissionBasedItems = [];

    // Events - all authenticated users can view
    permissionBasedItems.push({ icon: Calendar, label: 'Events', href: '/dashboard/events' });

    // Leaderboard - all users
    permissionBasedItems.push({ icon: BarChart3, label: 'Leaderboard', href: '/leaderboard' });

    // Achievements - all users
    permissionBasedItems.push({ icon: Award, label: 'Achievements', href: '/achievements' });

    // Courses - LMS access
    if (checkPermission('lms.view_courses')) {
      permissionBasedItems.push({ icon: BookOpen, label: 'My Courses', href: '/dashboard/courses' });
    }

    // Certificates - certification access
    if (checkPermission('certification.view')) {
      permissionBasedItems.push({ icon: Award, label: 'Certificates', href: '/dashboard/certificates' });
    }

    // User management - admin/facilitator/school_admin
    if (checkPermission('auth.approve_users_school') || checkPermission('auth.approve_users_all')) {
      permissionBasedItems.push({ icon: Users, label: 'Manage Users', href: '/dashboard/users' });
    }

    // Analytics - various admin roles
    if (checkPermission('analytics.view') || checkPermission('analytics.export')) {
      permissionBasedItems.push({ icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' });
    }

    // Parent specific
    if (user?.role === 'parent') {
      permissionBasedItems.push({ icon: Users, label: 'My Children', href: '/dashboard/children' });
      permissionBasedItems.push({ icon: BarChart3, label: 'Progress', href: '/dashboard/progress' });
    }

    // Mentor specific
    if (user?.role === 'mentor') {
      permissionBasedItems.push({ icon: Users, label: 'My Mentees', href: '/dashboard/mentees' });
      permissionBasedItems.push({ icon: Target, label: 'Goals', href: '/dashboard/goals' });
      permissionBasedItems.push({ icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' });
    }

    // Circle member specific
    if (user?.role === 'circle_member') {
      permissionBasedItems.push({ icon: Network, label: 'My Network', href: '/dashboard/network' });
      permissionBasedItems.push({ icon: MessageSquare, label: 'Connections', href: '/dashboard/connections' });
    }

    // Payments - payment access
    if (checkPermission('payments.make') || checkPermission('payments.view_own')) {
      permissionBasedItems.push({ icon: Network, label: 'Payments', href: '/payments' });
    }

    // Settings - all users
    permissionBasedItems.push({ icon: Settings, label: 'Settings', href: '/dashboard/settings' });

    return [...baseItems, ...permissionBasedItems];
  };

  const { checkPermission } = usePermissions();
  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors active:scale-95"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-dark-600 to-dark-700 text-white w-64 p-6 shadow-xl transition-all duration-300 z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          paddingTop: `max(1.5rem, env(safe-area-inset-top))`,
          paddingBottom: `max(1.5rem, env(safe-area-inset-bottom))`,
        }}
      >
        {/* Logo */}
        <div className="mb-8 pt-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center font-black text-white">
              IE
            </div>
            <div>
              <p className="font-black text-lg">ImpactEdu</p>
              <p className="text-xs text-gray-400">Learning Platform</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-8 p-4 bg-dark-500 rounded-lg">
            <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2 mb-12">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-primary-600 hover:text-white transition-all duration-300 group"
              >
                <Icon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-all duration-300 mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-xs text-gray-500">
          <p>© 2026 ImpactEdu</p>
          <p>Version 1.0</p>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
