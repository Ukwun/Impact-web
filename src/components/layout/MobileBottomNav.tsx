'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { getMenuConfigForRole, UserRole } from '@/lib/menuConfig';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = usePermissions();

  // Get role-specific menu config
  const userRole = (user?.role as UserRole) || 'student';
  const menuConfig = getMenuConfigForRole(userRole);
  const mobileBottomTabs = menuConfig.mobileBottomTabs;

  // Check if a tab is active
  const isActive = (href: string) => {
    return (
      pathname === href ||
      pathname.startsWith(href + '/') ||
      (href === '/dashboard' && pathname.startsWith('/dashboard'))
    );
  };

  return (
    <>
      {/* Mobile Bottom Navigation - Hidden on Desktop (lg screen and up) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-dark-700 to-dark-600 border-t border-dark-500 z-40 px-2 py-2 shadow-2xl lg:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mobileBottomTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg transition-all duration-300 group ${
                  active
                    ? 'text-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className={`relative ${active ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>
                  <Icon
                    size={24}
                    className={`${
                      active
                        ? 'fill-primary-500'
                        : ''
                    }`}
                  />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                  )}
                </div>
                <span className={`text-xs mt-1 font-semibold ${active ? 'text-primary-500' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile to account for bottom nav */}
      <div className="h-20 lg:hidden"></div>
    </>
  );
}
