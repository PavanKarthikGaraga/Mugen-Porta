"use client";
import type { ReactNode } from "react";

/**
 * ProgressCard — labeled progress bar tile.
 * Props: label, value (0-100), max (number, default 100), color (hex), showPercentage,
 * sublabel (string or JSX — e.g. an icon + text)
 */
export default function ProgressCard({ label, value, max = 100, color = "rgb(151,0,3)", showPercentage = true, suffix = "", sublabel = "" as ReactNode }) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate mr-2">{label}</span>
        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
          {showPercentage ? `${pct}%` : `${value}${suffix}`}
        </span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {sublabel && <p className="text-xs text-zinc-400 dark:text-zinc-500">{sublabel}</p>}
    </div>
  );
}
