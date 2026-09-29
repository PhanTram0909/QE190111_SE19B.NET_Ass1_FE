"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { taskApi, projectApi, tagApi } from "@/lib/api";
import { TaskDetail, Project, Tag, TaskStatusEnum, TaskPriority } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import TagBadge from "@/components/TagBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal, Calendar } from "lucide-react";

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "To Do", value: "0" }, { label: "In Progress", value: "1" },
  { label: "Done", value: "2" }, { label: "Cancelled", value: "3" },
];
const priorityOptions = [
  { label: "All Priority", value: "" },
  { label: "Low", value: "0" }, { label: "Medium", value: "1" },
  { label: "High", value: "2" }, { label: "Critical", value: "3" },
];

export default function SearchPage() {
  const [results, setResults] = useState<TaskDetail[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ title: "", status: "", priority: "", projectId: "", tagId: "" });

  useEffect(() => {
    Promise.all([projectApi.getAll(), tagApi.getAll()]).then(([p, t]) => { setProjects(p); setTags(t); });
  }, []);

  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters.title) params.title = filters.title;
      if (filters.status !== "") params.status = Number(filters.status);
      if (filters.priority !== "") params.priority = Number(filters.priority);
      if (filters.projectId) params.projectId = Number(filters.projectId);
      if (filters.tagId) params.tagId = Number(filters.tagId);
      const data = await taskApi.search(params);
      setResults(data);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(doSearch, 300);
    return () => clearTimeout(t);
  }, [doSearch]);

  const setFilter = (key: string, val: string) => setFilters((f) => ({ ...f, [key]: val }));

  return (
    <div className="animate-fade-in space-y-8">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><Search className="w-7 h-7 text-indigo-400" /> Search Tasks</h1>
        <p className="page-subtitle">Filter tasks dynamically — results update automatically</p>
      </div>

      {/* Filter Panel */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input className="input pl-9" placeholder="Search by title..." value={filters.title}
              onChange={(e) => setFilter("title", e.target.value)} />
          </div>
          <select className="select" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="select" value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
            {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="select" value={filters.projectId} onChange={(e) => setFilter("projectId", e.target.value)}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p.projectID} value={p.projectID}>{p.projectName}</option>)}
          </select>
        </div>
        <select className="select max-w-xs" value={filters.tagId} onChange={(e) => setFilter("tagId", e.target.value)}>
          <option value="">All Tags</option>
          {tags.map((t) => <option key={t.tagID} value={t.tagID}>{t.tagName}</option>)}
        </select>
      </div>

      {/* Results */}
      <div>
        <p className="text-slate-400 text-sm mb-4">{loading ? "Searching..." : `${results.length} result(s)`}</p>
        {loading ? <LoadingSpinner text="Searching..." /> : results.length === 0 ? (
          <div className="card text-center py-12 text-slate-400">No tasks match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((t) => (
              <Link key={t.taskID} href={`/tasks/${t.taskID}`} className="card group cursor-pointer space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{t.title}</h3>
                  <StatusBadge status={t.status} type="task" size="sm" />
                </div>
                {t.description && <p className="text-slate-400 text-sm line-clamp-2">{t.description}</p>}
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={t.priority} size="sm" />
                  {t.dueDate && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{t.dueDate.slice(0, 10)}
                    </span>
                  )}
                </div>
                {t.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-700/40">
                    {t.tags.map((tag) => <TagBadge key={tag.tagID} tag={tag} size="sm" />)}
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
