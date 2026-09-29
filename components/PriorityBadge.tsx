import { TaskPriority } from "@/lib/types";
import { clsx } from "clsx";

const priorityConfig: Record<TaskPriority, { label: string; className: string; dot: string }> = {
  [TaskPriority.Low]: {
    label: "Low",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  [TaskPriority.Medium]: {
    label: "Medium",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
  },
  [TaskPriority.High]: {
    label: "High",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
  },
  [TaskPriority.Critical]: {
    label: "Critical",
    className: "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_12px_rgba(255,69,58,0.2)]",
    dot: "bg-rose-400 animate-ping",
  },
};

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = priorityConfig[priority] || priorityConfig[TaskPriority.Medium];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border tracking-wide",
        cfg.className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
