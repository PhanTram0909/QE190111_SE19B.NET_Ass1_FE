"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Building2, FolderKanban, CheckSquare,
  Search, Settings, Tag, Menu, X, ChevronDown, Sparkles,
  LogIn, UserPlus, LogOut, Shield, User, Lock
} from "lucide-react";
import { clsx } from "clsx";
import { authApi, authStorage } from "@/lib/api";
import { SystemAccount } from "@/lib/types";

const publicNavLinks = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/search", label: "Search", icon: Search },
];

const manageLinks = [
  { href: "/admin/departments", label: "Departments", icon: Building2, desc: "Manage company units" },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, desc: "Assign & track projects" },
  { href: "/admin/tasks", label: "Tasks", icon: CheckSquare, desc: "Update tasks & priorities" },
  { href: "/admin/tags", label: "Tags", icon: Tag, desc: "Labels & custom colors" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [user, setUser] = useState<SystemAccount | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setManageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authApi.logout();
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-5xl rounded-full bg-[#12141f]/75 backdrop-blur-2xl border border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.45)] px-4 py-2 flex items-center justify-between transition-all">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group pl-1">
          <div className="w-8 h-8 rounded-[11px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white flex items-center gap-1">
            Task<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Track</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.06]">
          {publicNavLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                isActive(href)
                  ? "bg-white/[0.14] text-white shadow-sm border border-white/[0.14] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}

          {user && (
            <Link
              href="/admin"
              className={clsx(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                pathname === "/admin"
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold"
                  : "text-blue-400 hover:text-blue-300 hover:bg-white/[0.06]"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              Console
            </Link>
          )}
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Manage Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setManageOpen(!manageOpen)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    manageOpen || pathname.includes("/admin/")
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                      : "bg-white/[0.06] text-slate-300 border-white/[0.1] hover:bg-white/[0.1] hover:text-white"
                  )}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage
                  <ChevronDown className={clsx("w-3 h-3 transition-transform duration-200", manageOpen && "rotate-180")} />
                </button>

                {/* Dropdown Menu */}
                {manageOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-[22px] bg-[#141624]/90 backdrop-blur-3xl border border-white/[0.14] shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-2 animate-fade-in z-50">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Operations
                    </div>
                    <div className="space-y-1">
                      {manageLinks.map(({ href, label, icon: Icon, desc }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setManageOpen(false)}
                          className={clsx(
                            "flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs transition-all duration-150 group",
                            pathname === href
                              ? "bg-blue-600/25 text-blue-300 border border-blue-500/30 font-medium"
                              : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                          )}
                        >
                          <div className="w-7 h-7 rounded-[10px] bg-white/[0.06] flex items-center justify-center text-slate-300 group-hover:text-blue-400 group-hover:scale-105 transition-all">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-100">{label}</div>
                            <div className="text-[10px] text-slate-400">{desc}</div>
                          </div>
                        </Link>
                      ))}

                      {/* Accounts Link (Admin only) */}
                      {user.role === 1 && (
                        <Link
                          href="/admin/accounts"
                          onClick={() => setManageOpen(false)}
                          className={clsx(
                            "flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs transition-all duration-150 border-t border-white/[0.06] group",
                            pathname === "/admin/accounts"
                              ? "bg-purple-600/25 text-purple-300 border border-purple-500/30 font-medium"
                              : "text-purple-300 hover:bg-purple-500/10 hover:text-purple-200"
                          )}
                        >
                          <div className="w-7 h-7 rounded-[10px] bg-purple-500/15 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-all">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-purple-200">System Accounts</div>
                            <div className="text-[10px] text-purple-400/80">Admin only control</div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Pill & Logout */}
              <div className="flex items-center gap-2 pl-1 border-l border-white/[0.1]">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="font-medium text-slate-200 max-w-[120px] truncate">{user.fullName}</span>
                  <span className={clsx(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-semibold border",
                    user.role === 1
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  )}>
                    {user.role === 1 ? "Admin" : "Staff"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-full bg-white/[0.06] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.08] transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-full bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.1]"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-4 top-20 pointer-events-auto md:hidden rounded-[26px] bg-[#12141f]/95 backdrop-blur-3xl border border-white/[0.14] shadow-2xl p-4 animate-fade-in z-50 space-y-3">
          <div className="space-y-1">
            {publicNavLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all",
                  isActive(href)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-white/[0.06]"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {user && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all",
                  pathname === "/admin"
                    ? "bg-blue-600 text-white"
                    : "text-blue-300 hover:bg-white/[0.06]"
                )}
              >
                <Shield className="w-4 h-4" />
                Admin Console
              </Link>
            )}
          </div>

          {user ? (
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between px-2 text-xs">
                <span className="text-slate-300 font-medium truncate">{user.fullName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300">
                  {user.roleLabel || (user.role === 1 ? "Admin" : "Staff")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {manageLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] text-xs text-slate-200 border border-white/[0.06]"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    {label}
                  </Link>
                ))}
                {user.role === 1 && (
                  <Link
                    href="/admin/accounts"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 text-xs text-purple-200 border border-purple-500/20 col-span-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    System Accounts (Admin)
                  </Link>
                )}
              </div>
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full mt-2 py-2 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 rounded-xl bg-white/[0.06] text-center text-xs font-medium text-slate-200 border border-white/[0.1]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 rounded-xl bg-blue-600 text-center text-xs font-medium text-white shadow-md shadow-blue-500/25"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
