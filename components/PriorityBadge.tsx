import { TaskPriority } from "@/lib/types";
import { clsx } from "clsx";

const priorityConfig: Record<TaskPriority, { label: string; className: string; dot: string }> = {
  [TaskPriority.Low]:      { label: "Low",      className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  [TaskPriority.Medium]:   { label: "Medium",   className: "bg-blue-500/20 text-blue-300 border-blue-500/30",         dot: "bg-blue-400" },
  [TaskPriority.High]:     { label: "High",     className: "bg-orange-500/20 text-orange-300 border-orange-500/30",   dot: "bg-orange-400" },
  [TaskPriority.Critical]: { label: "Critical", className: "bg-red-500/20 text-red-300 border-red-500/30",            dot: "bg-red-400" },
};

interface Props {
  priority: TaskPriority;
  size?: "sm" | "md";
}

export default function PriorityBadge({ priority, size = "md" }: Props) {
  const config = priorityConfig[priority];
  if (!config) return null;
  return (
    <span className={clsx(
      "inline-flex items-center rounded-full border font-medium",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      config.className
    )}>
      <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}
