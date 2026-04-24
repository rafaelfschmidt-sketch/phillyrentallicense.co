"use client";

const STATUS_CONFIGS: Record<string, { color: string; bg: string; label: string }> = {
  good: { color: "#22c55e", bg: "#f0fdf4", label: "Good" },
  warning: { color: "#f59e0b", bg: "#fffbeb", label: "Warning" },
  critical: { color: "#ef4444", bg: "#fef2f2", label: "Critical" },
  pending: { color: "#6b6d7b", bg: "#f8f8fa", label: "Pending" },
  active: { color: "#50b8a2", bg: "#f0fdf4", label: "Active" },
  expired: { color: "#ef4444", bg: "#fef2f2", label: "Expired" },
  missing: { color: "#f59e0b", bg: "#fffbeb", label: "Missing" },
};

/**
 * Animated status badge with colored dot and background.
 */
export function StatusIndicator({
  status,
  label,
  pulse = false,
  size = "sm",
}: {
  status: string;
  label?: string;
  pulse?: boolean;
  size?: "xs" | "sm" | "md";
}) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.pending;
  const displayLabel = label || config.label;

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-sm px-2.5 py-1 gap-1.5",
  };

  const dotSize = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <span
        className={`rounded-full shrink-0 ${dotSize[size]} ${pulse ? "status-pulse" : ""}`}
        style={{ backgroundColor: config.color }}
      />
      {displayLabel}
    </span>
  );
}
