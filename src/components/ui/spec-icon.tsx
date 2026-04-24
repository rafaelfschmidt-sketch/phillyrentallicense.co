"use client";

/**
 * Icon + value + label for property specs (beds, baths, sqft, etc.)
 */
export function SpecIcon({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: "#f7f6f3" }}
      >
        <span style={{ color: "#50b8a2" }}>{icon}</span>
      </div>
      <div>
        <div className="text-sm font-bold" style={{ color: "#333543" }}>
          {value}
        </div>
        <div className="text-[11px]" style={{ color: "#6b6d7b" }}>
          {label}
        </div>
      </div>
    </div>
  );
}
