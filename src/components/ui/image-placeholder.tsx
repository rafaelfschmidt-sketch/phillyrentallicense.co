"use client";

/**
 * Gradient placeholder shown when no property photo is available.
 * Renders a subtle building icon on a warm gradient background.
 */
export function ImagePlaceholder({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        background: "linear-gradient(135deg, #e8e7e4 0%, #d0d1d8 100%)",
      }}
    >
      <div className="text-center">
        <svg
          className="w-10 h-10 mx-auto"
          fill="none"
          stroke="#b0b2bc"
          strokeWidth={1.25}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
          />
        </svg>
        {label && (
          <span className="block mt-1 text-xs font-medium" style={{ color: "#b0b2bc" }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
