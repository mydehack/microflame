"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Compass,
  UsersRound,
  MessageCircle,
  Bell,
  Sparkles,
  BookOpenCheck,
  FolderGit2,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  Search,
  ExternalLink,
} from "lucide-react";
import { ConEdLogo } from "@/components/coned-logo";
import { RadialMenu } from "@/components/radial-menu";
import { type StudentProfile, ConEdStore } from "@/lib/coned-store";

interface AppShellProps {
  profile?: Partial<StudentProfile>;
  children: React.ReactNode;
}

const mainNavItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/messages", label: "Messages & Hubs", icon: MessageCircle, badgeKey: "messages" },
  { href: "/notifications", label: "Notifications", icon: Bell, badgeKey: "notifications" },
];

const intelligenceNavItems = [
  { href: "/mentors", label: "AI Mentor", icon: Sparkles, highlight: true },
  { href: "/goals", label: "Goals & Progress", icon: BookOpenCheck },
  { href: "/projects", label: "Project Showcase", icon: FolderGit2 },
];

const accountNavItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin Portal", icon: ShieldCheck },
];

export function AppShell({ profile, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = profile?.id ? (profile as StudentProfile) : ConEdStore.getCurrentUser();

  const handleLogout = async () => {
    // Set explicit logout cookie and redirect
    document.cookie = "coned_logged_out=true; path=/; max-age=86400";
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  };

  return (
    <div className="app-frame min-h-screen bg-[#050908] text-[#F4FFF9]">
      {/* DESKTOP FIXED SIDEBAR (~220px) */}
      <aside
        className="sidebar bg-[#070D0B] border-r border-[#23372D] flex flex-col justify-between"
        aria-label="CON-ED Primary Navigation"
      >
        <div className="flex flex-col">
          {/* Top Brand Logo */}
          <div className="px-2 pt-2 pb-5 border-b border-[#23372D]/60 mb-4">
            <ConEdLogo size="md" showTagline={true} linkToHome={true} />
          </div>

          {/* Main Navigation Group */}
          <div className="flex flex-col gap-1 mb-5">
            <span className="px-3 text-[10px] font-bold text-[#71857A] tracking-wider uppercase mb-1.5">
              Connect & Feed
            </span>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <Icon />
                  <span className="truncate">{item.label}</span>
                  {item.badgeKey === "messages" && (
                    <span className="nav-badge">1</span>
                  )}
                  {item.badgeKey === "notifications" && (
                    <span className="nav-badge">2</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Intelligence & Growth Group */}
          <div className="flex flex-col gap-1 mb-5">
            <span className="px-3 text-[10px] font-bold text-[#71857A] tracking-wider uppercase mb-1.5">
              Intelligence & Growth
            </span>
            {intelligenceNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <Icon className={item.highlight ? "text-[#00E69A]" : ""} />
                  <span className="truncate">{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#00E69A]/20 text-[#00E69A] border border-[#00E69A]/30">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Account & Administration Group */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-bold text-[#71857A] tracking-wider uppercase mb-1.5">
              Account & Security
            </span>
            {accountNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <Icon />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom: Student Mini Card & Sign Out */}
        <div className="pt-4 border-t border-[#23372D] flex flex-col gap-3">
          <div className="p-2.5 rounded-xl bg-[#101916] border border-[#23372D] flex items-center justify-between">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#00E69A]/50 shrink-0">
                <img
                  src={
                    currentUser.avatarUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
                  }
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#F4FFF9] truncate leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-[#A6B8AE] truncate leading-tight">
                  @{currentUser.username}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#71857A] hover:text-[#FF5364] hover:bg-[#18251F] transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-area flex flex-col min-h-screen">
        {/* TOPBAR HEADER */}
        <header className="topbar">
          {/* Global Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl relative flex items-center"
          >
            <Search
              size={16}
              className="absolute left-3.5 text-[#71857A] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, skills, topics, projects or #tags..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#101916] border border-[#23372D] text-sm text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A] focus:shadow-[0_0_15px_rgba(0,230,154,0.15)] transition-all"
            />
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick AI Mentor Button */}
            <Link
              href="/mentors"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E69A]/10 border border-[#00E69A]/30 text-xs font-bold text-[#00E69A] hover:bg-[#00E69A]/20 transition-all"
            >
              <Sparkles size={13} />
              <span>AI Mentor</span>
            </Link>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl bg-[#101916] border border-[#23372D] hover:border-[#00E69A]/40 text-[#A6B8AE] hover:text-[#F4FFF9] transition-all"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00E69A] shadow-[0_0_6px_#00E69A]" />
            </Link>

            {/* Avatar Profile Link */}
            <Link
              href="/profile"
              className="w-9 h-9 rounded-xl overflow-hidden border border-[#00E69A]/50 shrink-0 hover:scale-105 transition-transform"
            >
              <img
                src={
                  currentUser.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
                }
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* UNIQUE CON-ED CIRCULAR RADIAL MENU (Bottom-Left Corner) */}
      <RadialMenu />

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-[#070D0B]/95 backdrop-blur-md border-t border-[#23372D] flex items-center justify-around px-2"
        aria-label="Mobile Navigation"
      >
        {[
          { href: "/home", label: "Home", icon: Home },
          { href: "/messages", label: "Messages", icon: MessageCircle },
          { href: "/notifications", label: "Alerts", icon: Bell },
          { href: "/mentors", label: "AI Mentor", icon: Sparkles, highlight: true },
          { href: "/profile", label: "Profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
                active ? "text-[#00E69A]" : "text-[#71857A] hover:text-[#A6B8AE]"
              }`}
            >
              <Icon size={19} className={item.highlight && active ? "text-[#00E69A]" : ""} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
