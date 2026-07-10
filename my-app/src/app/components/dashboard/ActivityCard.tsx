"use client";

/**
 * ActivityCard — single upcoming activity row.
 * Props: activity { id, title, category, date, time, venue, credits, status, color }
 */
export default function ActivityCard({ activity }) {
  const { title, category, date, time, venue, credits, status, color } = activity;

  const statusStyles = {
    Registered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Open: "bg-blue-50 text-blue-700 border border-blue-200",
    Upcoming: "bg-amber-50 text-amber-700 border border-amber-200",
    Closed: "bg-gray-100 text-gray-500 border border-gray-200",
  };

  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "short" });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      {/* Date pill */}
      <div
        className="flex-shrink-0 w-10 h-12 rounded-lg flex flex-col items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        <span className="text-xs font-bold leading-none">{month}</span>
        <span className="text-base font-bold leading-tight">{day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{time} · {venue}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">{category}</span>
          <span className="text-xs font-medium" style={{ color: "rgb(151,0,3)" }}>+{credits} SDC</span>
        </div>
      </div>

      {/* Status */}
      <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-md ${statusStyles[status] || statusStyles["Upcoming"]}`}>
        {status}
      </span>
    </div>
  );
}
