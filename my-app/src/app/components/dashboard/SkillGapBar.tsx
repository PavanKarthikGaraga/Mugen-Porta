"use client";
/**
 * SkillGapBar — shows required vs current skill level
 * Props: name, required (0-100), current (0-100), color
 */
export default function SkillGapBar({ name, required, current, color = "rgb(151,0,3)" }) {
  const gap = Math.max(0, required - current);
  const met = current >= required;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-800 truncate pr-2">{name}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {met ? (
            <span className="text-emerald-600 font-semibold text-[10px]">✓ Met</span>
          ) : (
            <span className="text-red-600 font-medium text-[10px]">Gap: {gap}%</span>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-visible">
        {/* Current */}
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${current}%`,
            backgroundColor: met ? "#059669" : color,
          }}
        />
        {/* Required marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-800 rounded-full z-10"
          style={{ left: `${required}%` }}
          title={`Required: ${required}%`}
        />
      </div>
      <div className="flex items-center justify-between text-[9px] text-gray-400">
        <span>Current: {current}%</span>
        <span>Required: {required}%</span>
      </div>
    </div>
  );
}
