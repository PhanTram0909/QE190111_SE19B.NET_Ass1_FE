"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { departmentApi } from "@/lib/api";
import { Department } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Building2, Search, ArrowRight, FolderKanban } from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Department[]>([]);

  useEffect(() => {
    departmentApi.getAll().then((d) => { setDepartments(d); setFiltered(d); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(departments.filter((d) => d.departmentName.toLowerCase().includes(q)));
  }, [search, departments]);

  if (loading) return <LoadingSpinner text="Loading departments..." />;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">{departments.length} departments total</p>
        </div>
        <Link href="/departments/manage" className="btn-primary">
          Manage <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input className="input pl-9" placeholder="Search departments..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">No departments found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <Link key={d.departmentID} href={`/departments/${d.departmentID}`}
              className="card group cursor-pointer space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {d.departmentName}
                  </h3>
                  <span className={`text-xs ${d.isActive ? "text-emerald-400" : "text-slate-500"}`}>
                    {d.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              {d.departmentDescription && (
                <p className="text-slate-400 text-sm line-clamp-2">{d.departmentDescription}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 group-hover:gap-2.5 transition-all">
                <FolderKanban className="w-3.5 h-3.5" /> View Projects <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
