"use client";

/**
 * ProgressCard — labeled progress bar tile.
 * Props: label, value (0-100), max (number, default 100), color (hex), showPercentage
 */
export default function ProgressCard({ label, value, max = 100, color = "rgb(151,0,3)", showPercentage = true, suffix = "", sublabel = "" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs font-semibold text-gray-900">
          {showPercentage ? `${pct}%` : `${value}${suffix}`}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}
