"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { taskApi } from "@/lib/api";
import { TaskDetail } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import TagBadge from "@/components/TagBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CheckSquare, ArrowLeft, Calendar, FolderKanban, Clock } from "lucide-react";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskApi.getById(Number(id)).then(setTask).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!task) return <div className="card text-center py-12 text-slate-400">Task not found.</div>;

  const fields = [
    { label: "Status", value: <StatusBadge status={task.status} type="task" /> },
    { label: "Priority", value: <PriorityBadge priority={task.priority} /> },
    { label: "Project ID", value: <Link href={`/projects/${task.projectID}`} className="text-indigo-400 hover:underline flex items-center gap-1"><FolderKanban className="w-3.5 h-3.5" />Project #{task.projectID}</Link> },
    { label: "Due Date", value: task.dueDate ? <span className="flex items-center gap-1.5 text-slate-300"><Calendar className="w-4 h-4 text-slate-500" />{task.dueDate.slice(0, 10)}</span> : <span className="text-slate-500">No due date</span> },
    { label: "Created", value: <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" />{new Date(task.createdDate).toLocaleDateString()}</span> },
    { label: "Modified", value: task.modifiedDate ? <span className="text-slate-400">{new Date(task.modifiedDate).toLocaleDateString()}</span> : <span className="text-slate-500">Never</span> },
    { label: "Active", value: <span className={task.isActive ? "text-emerald-400" : "text-red-400"}>{task.isActive ? "● Active" : "● Deleted"}</span> },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-3xl">
      <Link href={`/projects/${task.projectID}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>

      {/* Header */}
      <div className="card space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{task.title}</h1>
            {task.description && <p className="text-slate-400 mt-2 leading-relaxed">{task.description}</p>}
          </div>
        </div>

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
            {task.tags.map((tag) => <TagBadge key={tag.tagID} tag={tag} />)}
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
              <div className="text-sm">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
