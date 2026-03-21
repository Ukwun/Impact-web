'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { getMenuConfigForRole, UserRole } from '@/lib/menuConfig';
import {
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Star,
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyVisited, setRecentlyVisited] = useState<{ href: string; label: string; timestamp: number }[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Load recently visited items from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentlyVisited');
    if (stored) {
      try {
        setRecentlyVisited(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently visited items:', e);
      }
    }
    
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem('favoritedMenuItems');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  // Track current page in recently visited
  useEffect(() => {
    if (!pathname || pathname.includes('login') || pathname.includes('auth')) return;

    // Find matching menu item
    const allItems = menuConfig.menuItems.flatMap((item) => [
      { href: item.href, label: item.label },
      ...(item.subItems?.map((sub) => ({ href: sub.href, label: sub.label })) || []),
    ]);

    const matchingItem = allItems.find(
      (item) => item.href && pathname === item.href || pathname.startsWith(item.href + '/')
    );

    if (matchingItem) {
      setRecentlyVisited((prev) => {
        // Remove if already exists
        const filtered = prev.filter((item) => item.href !== matchingItem.href);
        // Add to top with current timestamp
        const updated = [
          { href: matchingItem.href || '', label: matchingItem.label, timestamp: Date.now() },
          ...filtered,
        ].slice(0, 5); // Keep only 5 most recent

        // Save to localStorage
        localStorage.setItem('recentlyVisited', JSON.stringify(updated));
        return updated;
      });
    }
  }, [pathname]);

  const toggleSubmenu = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem('favoritedMenuItems', JSON.stringify(updated));
      return updated;
    });
  };

  // Get role-specific menu config
  const userRole = (user?.role as UserRole) || 'student';
  const menuConfig = getMenuConfigForRole(userRole);

  // Filter menu items based on search query
  const filteredItems = searchQuery.trim() 
    ? menuConfig.menuItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subItems?.some((sub) =>
          sub.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : menuConfig.menuItems;

  // Check if a path is active
  const isPathActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

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
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-dark-600 to-dark-700 text-white shadow-xl transition-all duration-300 z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
        style={{
          paddingTop: `max(1.5rem, env(safe-area-inset-top))`,
          paddingBottom: `max(1.5rem, env(safe-area-inset-bottom))`,
        }}
      >
        {/* Logo & Collapse Button */}
        <div className={`${isCollapsed ? 'flex flex-col items-center gap-2' : 'mb-8'} pt-4`}>
          <div className="flex items-center gap-3">
            <Logo size={isCollapsed ? "sm" : "md"} href="/" />
            {!isCollapsed && (
              <div>
                <p className="font-black text-lg">ImpactEdu</p>
                <p className="text-xs text-gray-400">Learning Platform</p>
              </div>
            )}
          </div>
          
          {/* Collapse button - hidden on mobile */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 hover:bg-dark-500 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Info - hidden when collapsed */}
        {user && !isCollapsed && (
          <div className="mb-8 p-4 bg-dark-500 rounded-lg">
            <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}

        {/* Search input - hidden when collapsed */}
        {!isCollapsed && (
          <div className="mb-6 px-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Expand all items when searching
                  if (e.target.value.trim()) {
                    setExpandedItems(menuConfig.menuItems.map(item => item.id));
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-dark-500 border border-dark-400 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Recently Visited - hidden when collapsed or searching */}
        {!isCollapsed && !searchQuery && recentlyVisited.length > 0 && (
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                Recently Visited
              </div>
            </h3>
            <div className="space-y-1 px-3">
              {recentlyVisited.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-500'
                  }`}
                >
                  <Clock size={14} className="flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="border-b border-gray-700 mt-4"></div>
          </div>
        )}

        {/* Favorites - hidden when collapsed or searching */}
        {!isCollapsed && !searchQuery && favorites.length > 0 && (
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-2">
                <Star size={14} />
                Favorites
              </div>
            </h3>
            <div className="space-y-1 px-3">
              {menuConfig.menuItems
                .filter((item) => favorites.includes(item.id))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href || '#'}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 group ${
                        pathname === item.href || pathname?.startsWith(item.href + '/')
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-dark-500'
                      }`}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
            </div>
            <div className="border-b border-gray-700 mt-4"></div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`${isCollapsed ? 'space-y-2' : 'space-y-1'} mb-12 px-3`}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedItems.includes(item.id);
              const isActive = isPathActive(item.href);
              const hasSubmenu = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.id}>
                  <div className="relative group">
                    <button
                      onClick={() => {
                        if (hasSubmenu) {
                          if (!isCollapsed) toggleSubmenu(item.id);
                        } else if (item.href) {
                          router.push(item.href);
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between ${isCollapsed ? 'px-2' : 'px-4'} py-3 rounded-lg transition-all duration-300 group ${
                        isActive
                          ? 'bg-primary-600 text-white border-l-4 border-primary-400'
                          : 'text-gray-300 hover:bg-dark-500 hover:text-white'
                      } ${item.isPrimary ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-dark-700 animate-cta-pulse' : ''}`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {!isCollapsed && !hasSubmenu && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all"
                            title={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star 
                              size={16}
                              className={favorites.includes(item.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
                            />
                          </button>
                        )}
                        {!isCollapsed && hasSubmenu && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all"
                              title={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Star 
                                size={16}
                                className={favorites.includes(item.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
                              />
                            </button>
                            <ChevronDown
                              size={18}
                              className={`transition-transform duration-300 flex-shrink-0 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </>
                        )}
                      </div>
                    </button>
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="hidden group-hover:block absolute left-20 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </div>

                  {/* Submenu Items - hidden when collapsed, and matches search query */}
                  {!isCollapsed && hasSubmenu && isExpanded && (
                    <div className="space-y-1 mt-1 pl-4 border-l-2 border-dark-500">
                      {item.subItems!.map((subItem) => {
                        const isSubActive = isPathActive(subItem.href);
                        const matchesSearch = !searchQuery.trim() || 
                          subItem.label.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        if (!matchesSearch) return null;
                        
                        return (
                          <Link
                            key={subItem.id}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              isSubActive
                                ? 'bg-primary-600 text-white font-semibold'
                                : 'text-gray-400 hover:text-white hover:bg-dark-500'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No menu items found
            </div>
          )}
        </nav>

        {/* Logout - with tooltip support for collapsed state */}
        <div className="relative group">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-all duration-300 mt-auto`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
          
          {isCollapsed && (
            <div className="hidden group-hover:block absolute left-20 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none z-50">
              Logout
            </div>
          )}
        </div>

        {/* Footer - hidden when collapsed */}
        {!isCollapsed && (
          <div className="mt-8 pt-6 border-t border-gray-700 text-xs text-gray-500">
            <p>© 2026 ImpactEdu</p>
            <p>Version 1.0</p>
          </div>
        )}
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
