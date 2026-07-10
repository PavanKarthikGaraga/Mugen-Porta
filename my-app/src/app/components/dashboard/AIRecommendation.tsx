"use client";

/**
 * AIRecommendation — AI Mentor suggestion card.
 * Props: rec { id, type, title, reason, credits, icon, urgency }
 */

const urgencyConfig = {
  high: { ring: "border-red-200 bg-red-50", badge: "bg-red-100 text-red-700", label: "High Priority" },
  medium: { ring: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-700", label: "Recommended" },
  low: { ring: "border-blue-200 bg-blue-50", badge: "bg-blue-100 text-blue-700", label: "Explore" },
};

export default function AIRecommendation({ rec }) {
  const { type, title, reason, credits, icon, urgency } = rec;
  const config = urgencyConfig[urgency] || urgencyConfig.low;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.ring}`}>
      <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-gray-900 leading-snug">{title}</p>
          <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{reason}</p>
        <p className="text-xs font-medium mt-1.5" style={{ color: "rgb(151,0,3)" }}>+{credits} SDC credits</p>
      </div>
    </div>
  );
}
