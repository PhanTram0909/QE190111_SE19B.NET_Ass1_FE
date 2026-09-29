"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { departmentApi } from "@/lib/api";
import { DepartmentWithProjects } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Building2, ArrowLeft, Calendar, FolderKanban, ArrowRight } from "lucide-react";

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dept, setDept] = useState<DepartmentWithProjects | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentApi.getById(Number(id)).then(setDept).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!dept) return <div className="card text-center py-12 text-slate-400">Department not found.</div>;

  return (
    <div className="animate-fade-in space-y-8">
      <Link href="/departments" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Departments
      </Link>

      {/* Header */}
      <div className="card space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{dept.departmentName}</h1>
            <span className={`text-sm ${dept.isActive ? "text-emerald-400" : "text-slate-500"}`}>
              {dept.isActive ? "● Active" : "● Inactive"}
            </span>
          </div>
        </div>
        {dept.departmentDescription && (
          <p className="text-slate-400 leading-relaxed">{dept.departmentDescription}</p>
        )}
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            Projects ({dept.projects?.length ?? 0})
          </h2>
        </div>

        {!dept.projects?.length ? (
          <div className="card text-center py-10 text-slate-400">No projects in this department.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dept.projects.map((p) => (
              <Link key={p.projectID} href={`/projects/${p.projectID}`}
                className="card group cursor-pointer space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {p.projectName}
                  </h3>
                  <StatusBadge status={p.status} type="project" size="sm" />
                </div>
                {p.description && <p className="text-slate-400 text-sm line-clamp-2">{p.description}</p>}
                {(p.startDate || p.endDate) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {p.startDate?.slice(0, 10)} → {p.endDate?.slice(0, 10) ?? "—"}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-indigo-400 group-hover:gap-2 transition-all">
                  View Tasks <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
