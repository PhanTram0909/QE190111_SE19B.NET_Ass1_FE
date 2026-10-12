"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { departmentApi, projectApi, taskApi, tagApi, authStorage } from "@/lib/api";
import { SystemAccount } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Building2, FolderKanban, CheckSquare, Tag, Users,
  ArrowRight, ShieldCheck, Sparkles, Layers, Lock, User
} from "lucide-react";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<SystemAccount | null>(null);
  const [deptCount, setDeptCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [tagCount, setTagCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authStorage.getUser());

    Promise.all([
      departmentApi.getAll(),
      projectApi.getAll(),
      taskApi.getAll(),
      tagApi.getAll(),
    ])
      .then(([depts, projects, tasks, tags]) => {
        setDeptCount(depts.length);
        setProjectCount(projects.length);
        setTaskCount(tasks.length);
        setTagCount(tags.length);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const sections = [
    {
      title: "Departments",
      desc: "Manage company departments, units, and active statuses",
      count: deptCount,
      href: "/admin/departments",
      icon: Building2,
      gradient: "from-blue-500 to-cyan-500",
      colorText: "text-blue-400",
    },
    {
      title: "Projects",
      desc: "Create and update projects, deadlines, and department assignments",
      count: projectCount,
      href: "/admin/projects",
      icon: FolderKanban,
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      colorText: "text-indigo-400",
    },
    {
      title: "Tasks",
      desc: "Manage task priorities, statuses, due dates, and tag associations",
      count: taskCount,
      href: "/admin/tasks",
      icon: CheckSquare,
      gradient: "from-emerald-500 to-teal-500",
      colorText: "text-emerald-400",
    },
    {
      title: "Tags",
      desc: "Organize tasks with customizable category tags and badge colors",
      count: tagCount,
      href: "/admin/tags",
      icon: Tag,
      gradient: "from-amber-500 to-orange-500",
      colorText: "text-amber-400",
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-8 animate-fade-in pb-12">
        {/* User Welcome Banner */}
        <div className="card p-8 md:p-10 relative overflow-hidden backdrop-blur-3xl border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-xs font-semibold text-blue-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Authenticated Management Console
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.fullName || "Operator"}!
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                You have write privileges to create, modify, and delete resources across all operational modules.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] p-4 rounded-2xl">
              <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Current Role</div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  {user?.role === 1 ? (
                    <span className="text-purple-300 font-extrabold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Administrator
                    </span>
                  ) : (
                    <span className="text-blue-300 font-extrabold">Staff Member</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner text="Retrieving operational statistics..." />
        ) : (
          <>
            {/* Quick Overview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Management Modules
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {sections.map(({ title, desc, count, href, icon: Icon, gradient, colorText }) => (
                  <Link
                    key={title}
                    href={href}
                    className="card group relative flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          {count}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-blue-400">
                      <span>Open Console</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Admin-only Accounts Card Banner */}
            {user?.role === 1 && (
              <div className="card p-6 md:p-8 bg-gradient-to-r from-purple-900/30 via-slate-900/40 to-indigo-900/30 border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                    <Lock className="w-3 h-3" /> Admin Exclusive Privilege
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    System Account Management
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    View registered staff accounts, update roles between Staff and Admin, and manage account lifecycles.
                  </p>
                </div>

                <Link
                  href="/admin/accounts"
                  className="btn bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-lg shadow-purple-600/30 flex items-center gap-2 whitespace-nowrap active:scale-95 transition-all"
                >
                  <Users className="w-4 h-4" /> Manage Accounts
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
