import { ProjectStatus, TaskStatusEnum } from "@/lib/types";
import { clsx } from "clsx";

const projectStatusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  [ProjectStatus.NotStarted]: { label: "Not Started", className: "bg-slate-700/60 text-slate-300 border-slate-600/50" },
  [ProjectStatus.InProgress]: { label: "In Progress", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  [ProjectStatus.Completed]:  { label: "Completed",   className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  [ProjectStatus.OnHold]:     { label: "On Hold",     className: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
};

const taskStatusConfig: Record<TaskStatusEnum, { label: string; className: string }> = {
  [TaskStatusEnum.ToDo]:      { label: "To Do",      className: "bg-slate-700/60 text-slate-300 border-slate-600/50" },
  [TaskStatusEnum.InProgress]:{ label: "In Progress",className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  [TaskStatusEnum.Done]:      { label: "Done",       className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  [TaskStatusEnum.Cancelled]: { label: "Cancelled",  className: "bg-red-500/20 text-red-300 border-red-500/30" },
};

interface Props {
  status: ProjectStatus | TaskStatusEnum;
  type: "project" | "task";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, type, size = "md" }: Props) {
  const config =
    type === "project"
      ? projectStatusConfig[status as ProjectStatus]
      : taskStatusConfig[status as TaskStatusEnum];

  if (!config) return null;

  return (
    <span className={clsx(
      "inline-flex items-center rounded-full border font-medium",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      config.className
    )}>
      <span className={clsx(
        "w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0",
        config.className.includes("blue") ? "bg-blue-400" :
        config.className.includes("emerald") ? "bg-emerald-400" :
        config.className.includes("amber") ? "bg-amber-400" :
        config.className.includes("red") ? "bg-red-400" : "bg-slate-400"
      )} />
      {config.label}
    </span>
  );
}
