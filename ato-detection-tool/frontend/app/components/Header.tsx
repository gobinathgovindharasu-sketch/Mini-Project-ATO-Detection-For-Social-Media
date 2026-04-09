"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Shield,
  Search,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ato-border bg-ato-black/95 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Shield className="w-6 h-6 text-ato-cyan" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-ato-red rounded-full" />
          </div>
          <span className="text-white font-bold text-sm hidden sm:block">
            ATO Detection
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/explore", label: "Explore" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/monitor", label: "Monitor" },
            { href: "/reports", label: "Reports" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-ato-cyan transition-colors rounded"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search usernames, IPs, locations..."
              className="w-full bg-ato-dark border border-ato-border rounded-l px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-ato-cyan/50"
            />
            <button
              type="submit"
              className="bg-ato-red hover:bg-red-700 px-3 py-1.5 rounded-r text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {user.email}
              </span>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-ato-dark border border-ato-border text-gray-400 hover:text-ato-red rounded transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 text-xs bg-ato-green/90 hover:bg-ato-green text-black font-semibold rounded transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ato-border bg-ato-black px-4 py-3 space-y-2">
          {["Explore", "Dashboard", "Monitor", "Reports"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-xs text-gray-400 hover:text-ato-cyan"
            >
              {label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => {
                logout();
                router.push("/");
                setMobileOpen(false);
              }}
              className="block py-2 text-xs text-ato-red"
            >
              Logout ({user.email})
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-xs text-ato-green"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
