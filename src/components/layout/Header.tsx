"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/context/AuthStore";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const navigationLinks = [
    { label: "Programmes", href: "/programmes" },
    { label: "Learning", href: "/learning" },
    { label: "Events", href: "/events" },
    { label: "Community", href: "/community" },
    { label: "Membership", href: "/membership" },
    { label: "About", href: "/about" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 w-full z-50 bg-dark-900/95 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black text-base group-hover:scale-110 transition-transform duration-300 shadow-lg">
              IE
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-black text-white leading-tight">ImpactEdu</span>
              <span className="text-xs text-gray-400 font-semibold leading-tight">
                Learn. Build. Lead.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative group ${
                  isActive(link.href)
                    ? "text-primary-400 bg-primary-500/10"
                    : "text-gray-300 hover:text-primary-400 hover:bg-dark-800/50"
                }`}
              >
                {link.label}
                {!isActive(link.href) && (
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-primary-400 hover:bg-dark-800/50 transition-all"
                  onClick={() => router.push("/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10 hover:border-white/60"
                  onClick={async () => {
                    setIsLoggingOut(true);
                    await logout();
                    setIsLoggingOut(false);
                    router.push("/auth/register");
                  }}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging out..." : "Switch account"}
                  <LogOut className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-primary-400 hover:bg-dark-800/50 transition-all"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm" className="shadow-lg shadow-primary-500/20">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:bg-dark-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 space-y-2 animate-fade-in border-t border-dark-700/30 pt-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-semibold ${
                  isActive(link.href)
                    ? "text-primary-400 bg-primary-500/10"
                    : "text-gray-300 hover:bg-dark-800/50 hover:text-primary-400"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-dark-700/30 pt-4 mt-4 space-y-2 flex flex-col">
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-300 hover:text-primary-400 hover:bg-dark-800/50 justify-center"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
