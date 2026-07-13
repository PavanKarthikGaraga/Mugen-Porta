"use client";
import Link from "next/link";
import { FiBookmark, FiClock, FiStar, FiUser, FiZap } from "react-icons/fi";
import { DOMAINS } from "@/app/Data/activities-mock";

const DIFFICULTY_COLOR = {
  Beginner:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced:     "bg-red-50 text-red-700 border-red-200",
};

const STATUS_COLOR = {
  Open:     "bg-emerald-500",
  Closed:   "bg-gray-400",
  Upcoming: "bg-blue-500",
  Ongoing:  "bg-amber-500",
};

const LEVEL_EMOJI = {
  explorer: "🔭", foundation: "🌱", practitioner: "⚙️",
  leader: "🏅", mentor: "🎓", innovator: "🚀",
};

export default function CatalogueCard({ activity, bookmarked = false, onBookmark }) {
  const domain = DOMAINS[activity.domain] || DOMAINS.TEC;
  const enrolled = activity.enrolledCount;
  const max = activity.maxEnrollment;
  const fillPct = Math.round((enrolled / max) * 100);
  const isFull = enrolled >= max;
  const statusLabel = isFull ? "Full" : "Open";

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Header strip */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: domain.color }}
      />

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Domain badge */}
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: domain.color, backgroundColor: domain.bg, borderColor: `${domain.color}30` }}
            >
              {activity.domain}
            </span>
            {/* Difficulty */}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[activity.difficulty]}`}>
              {activity.difficulty}
            </span>
            {/* Level */}
            <span className="text-[10px] text-gray-500">
              {LEVEL_EMOJI[activity.level]} {activity.level.charAt(0).toUpperCase() + activity.level.slice(1)}
            </span>
          </div>
          {/* Bookmark */}
          <button
            onClick={() => onBookmark?.(activity.id)}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Bookmark"
          >
            <FiBookmark
              size={14}
              className={bookmarked ? "fill-current" : ""}
              style={{ color: bookmarked ? "rgb(151,0,3)" : "#9CA3AF" }}
            />
          </button>
        </div>

        {/* Code + Name */}
        <div>
          <p className="text-[10px] font-mono text-gray-400 mb-0.5">{activity.code}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-800 transition-colors">
            {activity.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{activity.purpose}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <FiStar size={11} style={{ color: "rgb(151,0,3)" }} />
            <span className="font-semibold text-gray-700">{activity.credits}</span> SAMAM Points
          </span>
          <span className="flex items-center gap-1">
            <FiClock size={11} className="text-gray-400" />
            {activity.hours}h
          </span>
          <span className="flex items-center gap-1">
            <FiUser size={11} className="text-gray-400" />
            {enrolled}/{max}
          </span>
          <span className="flex items-center gap-1">
            <FiZap size={11} className="text-amber-500" />
            {activity.rating}
          </span>
        </div>

        {/* Faculty */}
        <p className="text-xs text-gray-400 truncate">
          👤 {activity.faculty}
        </p>

        {/* SDGs */}
        <div className="flex flex-wrap gap-1">
          {activity.sdgs.slice(0, 4).map((sdg) => (
            <span key={sdg} className="text-[9px] font-medium bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">
              SDG {sdg}
            </span>
          ))}
          {activity.sdgs.length > 4 && (
            <span className="text-[9px] text-gray-400">+{activity.sdgs.length - 4}</span>
          )}
        </div>

        {/* Enrollment bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-gray-400">Seats filled</span>
            <span className={`font-medium ${isFull ? "text-red-600" : "text-gray-600"}`}>{fillPct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${fillPct}%`, backgroundColor: isFull ? "#DC2626" : "rgb(151,0,3)" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/dashboard/student/activity-catalogue/${activity.code}`}
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Details
          </Link>
          <button
            disabled={isFull}
            className="flex-1 text-xs font-semibold py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isFull ? "#9CA3AF" : "rgb(151,0,3)" }}
          >
            {isFull ? "Full" : "Enroll"}
          </button>
        </div>
      </div>
    </div>
  );
}
