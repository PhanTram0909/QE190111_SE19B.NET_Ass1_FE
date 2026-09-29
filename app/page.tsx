"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { departmentApi, projectApi, taskApi } from "@/lib/api";
import { Department, Project } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Building2, FolderKanban, CheckSquare, ArrowRight, Calendar, Sparkles, Layers, ArrowUpRight } from "lucide-react";

export default function HomePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([departmentApi.getAll(), projectApi.getAll(), taskApi.getAll()])
      .then(([d, p, t]) => {
        setDepartments(d);
        setProjects(p);
        setTaskCount(t.length);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Connecting to TaskTrack cloud..." />;

  const stats = [
    {
      label: "Departments",
      value: departments.length,
      icon: Building2,
      gradient: "from-blue-500 to-cyan-400",
      glow: "shadow-blue-500/20",
      href: "/departments",
      desc: "Organizational units",
    },
    {
      label: "Active Projects",
      value: projects.length,
      icon: FolderKanban,
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      glow: "shadow-purple-500/20",
      href: "/projects/manage",
      desc: "Cross-functional teams",
    },
    {
      label: "Tracked Tasks",
      value: taskCount,
      icon: CheckSquare,
      gradient: "from-emerald-400 to-teal-500",
      glow: "shadow-emerald-500/20",
      href: "/tasks/manage",
      desc: "Total assignments",
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* iOS Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.12] p-8 md:p-14 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* Subtle interior lighting */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.15] backdrop-blur-xl rounded-full px-4 py-1.5 text-blue-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Designed for Speed & Simplicity
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Empower your team. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Deliver without friction.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            TaskTrack brings departments, roadmaps, and priorities into one fluid, unified workspace built with precision.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/departments" className="btn-primary flex items-center gap-2">
              Explore Departments <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/search" className="btn-secondary flex items-center gap-2">
              Search Tasks
            </Link>
          </div>
        </div>
      </section>

      {/* iOS Widget-Style Stats Cards */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            System Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map(({ label, value, icon: Icon, gradient, glow, href, desc }) => (
            <Link
              key={label}
              href={href}
              className="card group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg ${glow} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/[0.1] transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-8 space-y-1">
                <div className="text-4xl font-extrabold text-white tracking-tight">
                  {value}
                </div>
                <div className="text-sm font-semibold text-slate-200">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Active Projects (iOS App Tiles) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Projects</h2>
            <p className="text-xs text-slate-400">Current initiatives across departments</p>
          </div>
          <Link
            href="/projects/manage"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card text-center py-16 text-slate-400 space-y-2">
            <FolderKanban className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <div className="text-base font-medium text-slate-300">No active projects found</div>
            <p className="text-xs text-slate-500">Create your first project in the management console.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Link
                key={project.projectID}
                href={`/projects/${project.projectID}`}
                className="card group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.06] text-blue-300 border border-white/[0.08]">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      {project.departmentName || `Dept #${project.departmentID}`}
                    </span>
                    <StatusBadge projectStatus={project.status} />
                  </div>

                  <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {project.projectName}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Ongoing"}
                  </span>
                  <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                    View tasks <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
