"use client";
/**
 * RingProgress — pure SVG circular progress ring
 * Props: value (0-100), size, strokeWidth, color, label, sublabel, showValue
 */
import { ReactNode } from "react";

interface RingProgressProps {
  value?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string | ReactNode;
  sublabel?: string | ReactNode;
  showValue?: boolean;
  children?: ReactNode;
}

export default function RingProgress({
  value = 0, size = 120, strokeWidth = 10,
  color = "rgb(151,0,3)", label, sublabel, showValue = true,
  children,
}: RingProgressProps) {
  const r   = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const cx = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Track */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
          {/* Fill */}
          <circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        {/* Centre content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {showValue && (
            <span className="text-xl font-bold text-gray-900 leading-none">{value}%</span>
          )}
          {children}
        </div>
      </div>
      {label    && <p className="text-xs font-semibold text-gray-900">{label}</p>}
      {sublabel && <p className="text-[10px] text-gray-400">{sublabel}</p>}
    </div>
  );
}
