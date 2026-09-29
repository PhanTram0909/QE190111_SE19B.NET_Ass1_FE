import { ProjectStatus, TaskStatusEnum } from "@/lib/types";
import { clsx } from "clsx";

const projectStatusConfig: Record<ProjectStatus, { label: string; className: string; dot: string }> = {
  [ProjectStatus.NotStarted]: {
    label: "Not Started",
    className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    dot: "bg-slate-400",
  },
  [ProjectStatus.InProgress]: {
    label: "In Progress",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-[0_0_12px_rgba(10,132,255,0.15)]",
    dot: "bg-blue-400 animate-pulse",
  },
  [ProjectStatus.Completed]: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(48,209,88,0.15)]",
    dot: "bg-emerald-400",
  },
  [ProjectStatus.OnHold]: {
    label: "On Hold",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(255,159,10,0.15)]",
    dot: "bg-amber-400",
  },
};

const taskStatusConfig: Record<TaskStatusEnum, { label: string; className: string; dot: string }> = {
  [TaskStatusEnum.ToDo]: {
    label: "To Do",
    className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    dot: "bg-slate-400",
  },
  [TaskStatusEnum.InProgress]: {
    label: "In Progress",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-[0_0_12px_rgba(10,132,255,0.15)]",
    dot: "bg-blue-400 animate-pulse",
  },
  [TaskStatusEnum.Done]: {
    label: "Done",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(48,209,88,0.15)]",
    dot: "bg-emerald-400",
  },
  [TaskStatusEnum.Cancelled]: {
    label: "Cancelled",
    className: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
  },
};

interface Props {
  projectStatus?: ProjectStatus;
  taskStatus?: TaskStatusEnum;
}

export default function StatusBadge({ projectStatus, taskStatus }: Props) {
  const cfg = projectStatus !== undefined
    ? projectStatusConfig[projectStatus]
    : taskStatus !== undefined
    ? taskStatusConfig[taskStatus]
    : null;

  if (!cfg) return null;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border tracking-wide transition-all",
        cfg.className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
