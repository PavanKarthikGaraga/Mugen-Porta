"use client";

/**
 * StatCard — a premium animated stat tile.
 * Props: icon (ReactNode), label, value, trend ("+12% vs last month"), trendUp (bool), accent (hex color)
 */
export default function StatCard({ icon, label, value, trend, trendUp, accent = "rgb(151,0,3)", className = "" }) {
  return (
    <div
      className={`relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden p-5 flex flex-col gap-3 ${className}`}
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: accent }} />

      <div className="flex items-start justify-between">
        {/* Icon bubble */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}15` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>

        {/* Trend badge */}
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
