import { Tag } from "@/lib/types";

interface Props {
  tag: Tag;
  size?: "sm" | "md";
}

export default function TagBadge({ tag, size = "md" }: Props) {
  const bg = tag.color || "#6366f1";
  return (
    <span
      className="inline-flex items-center rounded-full font-medium border"
      style={{
        backgroundColor: `${bg}20`,
        color: bg,
        borderColor: `${bg}40`,
        fontSize: size === "sm" ? "11px" : "12px",
        padding: size === "sm" ? "2px 8px" : "3px 10px",
      }}
    >
      {tag.tagName}
    </span>
  );
}
