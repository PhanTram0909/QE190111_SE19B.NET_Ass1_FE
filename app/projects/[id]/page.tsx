"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { projectApi } from "@/lib/api";
import { ProjectDetail } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import TagBadge from "@/components/TagBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FolderKanban, ArrowLeft, Calendar, Building2, CheckSquare } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getById(Number(id)).then(setProject).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="card text-center py-12 text-slate-400">Project not found.</div>;

  return (
    <div className="animate-fade-in space-y-8">
      <Link href="/departments" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Project Header */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.projectName}</h1>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-0.5">
                <Building2 className="w-3.5 h-3.5" /> {project.departmentName}
              </div>
            </div>
          </div>
          <StatusBadge status={project.status} type="project" />
        </div>
        {project.description && <p className="text-slate-400 leading-relaxed">{project.description}</p>}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            {project.startDate?.slice(0, 10) ?? "—"} → {project.endDate?.slice(0, 10) ?? "No end date"}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-emerald-400" />
          Tasks ({project.tasks?.length ?? 0})
        </h2>

        {!project.tasks?.length ? (
          <div className="card text-center py-10 text-slate-400">No tasks in this project.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks.map((t) => (
                  <tr key={t.taskID} className="cursor-pointer" onClick={() => window.location.href = `/tasks/${t.taskID}`}>
                    <td>
                      <Link href={`/tasks/${t.taskID}`} className="font-medium text-white hover:text-indigo-300 transition-colors">
                        {t.title}
                      </Link>
                      {t.description && <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{t.description}</p>}
                    </td>
                    <td><StatusBadge status={t.status} type="task" size="sm" /></td>
                    <td><PriorityBadge priority={t.priority} size="sm" /></td>
                    <td className="text-slate-400 text-xs">{t.dueDate?.slice(0, 10) ?? "—"}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(t as any).tags?.map((tag: any) => <TagBadge key={tag.tagID} tag={tag} size="sm" />)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
