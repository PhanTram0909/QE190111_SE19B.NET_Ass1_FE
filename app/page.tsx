"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { departmentApi, projectApi, taskApi } from "@/lib/api";
import { Department, Project } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Building2, FolderKanban, CheckSquare, ArrowRight, Calendar, Zap } from "lucide-react";

export default function HomePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([departmentApi.getAll(), projectApi.getAll(), taskApi.getAll()])
      .then(([d, p, t]) => { setDepartments(d); setProjects(p); setTaskCount(t.length); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const stats = [
    { label: "Departments", value: departments.length, icon: Building2, color: "from-indigo-600 to-indigo-400", bg: "bg-indigo-500/10", href: "/departments" },
    { label: "Projects", value: projects.length, icon: FolderKanban, color: "from-violet-600 to-violet-400", bg: "bg-violet-500/10", href: "/projects/manage" },
    { label: "Active Tasks", value: taskCount, icon: CheckSquare, color: "from-emerald-600 to-emerald-400", bg: "bg-emerald-500/10", href: "/tasks/manage" },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-slate-800/60 to-violet-900/60 border border-indigo-500/20 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3 py-1 text-indigo-300 text-xs font-medium mb-4">
            <Zap className="w-3 h-3" /> Task & Team Management
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">TaskTrack</span>
          </h1>
          <p className="text-slate-300 text-lg mb-6 leading-relaxed">
            Manage your departments, projects, and tasks in one beautiful place.
          </p>
          <div className="flex gap-3">
            <Link href="/departments" className="btn-primary">
              Explore Departments <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/search" className="btn-secondary">Search Tasks</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="card group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`stat-icon ${bg}`}>
                <Icon className={`w-6 h-6 bg-gradient-to-br ${color} bg-clip-text`} style={{ color: "transparent", backgroundClip: "text", WebkitBackgroundClip: "text" }} />
              </div>
              <div>
                <div className="text-3xl font-bold text-white group-hover:text-indigo-300 transition-colors">{value}</div>
                <div className="text-slate-400 text-sm">{label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Active Projects</h2>
            <p className="text-slate-400 text-sm">Latest projects across all departments</p>
          </div>
          <Link href="/projects/manage" className="btn-ghost text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card text-center py-12 text-slate-400">No active projects yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 9).map((p) => (
              <Link key={p.projectID} href={`/projects/${p.projectID}`}
                className="card cursor-pointer group space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {p.projectName}
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">{p.departmentName}</p>
                  </div>
                  <StatusBadge status={p.status} type="project" size="sm" />
                </div>
                {p.description && (
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{p.description}</p>
                )}
                {(p.startDate || p.endDate) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {p.startDate ? p.startDate.slice(0, 10) : "—"} → {p.endDate ? p.endDate.slice(0, 10) : "—"}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
