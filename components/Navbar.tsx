"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Building2, FolderKanban, CheckSquare,
  Search, Settings, Tag, Menu, X, ChevronDown, Zap,
} from "lucide-react";
import { clsx } from "clsx";

const navLinks = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/search", label: "Search", icon: Search },
];

const manageLinks = [
  { href: "/departments/manage", label: "Departments", icon: Building2 },
  { href: "/projects/manage", label: "Projects", icon: FolderKanban },
  { href: "/tasks/manage", label: "Tasks", icon: CheckSquare },
  { href: "/tags/manage", label: "Tags", icon: Tag },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center
                            group-hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Task<span className="text-indigo-400">Track</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(href)
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                )}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {/* Manage Dropdown */}
            <div className="relative">
              <button onClick={() => setManageOpen(!manageOpen)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname.includes("/manage")
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                )}>
                <Settings className="w-4 h-4" />
                Manage
                <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", manageOpen && "rotate-180")} />
              </button>

              {manageOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setManageOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 glass rounded-xl border border-slate-700/50 shadow-2xl z-20 py-1 modal-content">
                    {manageLinks.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}
                        onClick={() => setManageOpen(false)}
                        className={clsx(
                          "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                          pathname === href
                            ? "text-indigo-300 bg-indigo-600/10"
                            : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                        )}>
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-700/50 py-3 px-4 space-y-1 modal-content">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium",
                isActive(href)
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              )}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
          <div className="border-t border-slate-700/50 pt-2 mt-2">
            <p className="text-xs text-slate-500 px-3 pb-1 uppercase tracking-wider">Manage</p>
            {manageLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50">
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
