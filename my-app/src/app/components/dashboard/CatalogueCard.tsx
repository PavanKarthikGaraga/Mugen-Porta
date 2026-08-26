"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FiBookmark, FiStar, FiUsers, FiCheckCircle,
  FiCpu, FiBookOpen, FiHeart, FiZap, FiActivity,
  FiArrowRight, FiCalendar, FiClock, FiMapPin,
} from "react-icons/fi";
import { DOMAINS } from "@/app/Data/activities-mock";
import { formatActivityDate, formatTimeRange } from "@/lib/formatSchedule";
import EnrollModal from "./EnrollModal";

const BRAND = "rgb(151,0,3)";

const DOMAIN_ICON: Record<string, React.ElementType> = {
  TEC: FiCpu,
  LCH: FiBookOpen,
  ESO: FiHeart,
  IIE: FiZap,
  HWB: FiActivity,
};

const DIFFICULTY_CONFIG: Record<string, { cls: string }> = {
  Beginner:     { cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  Intermediate: { cls: "text-amber-700 bg-amber-50 border-amber-200" },
  Advanced:     { cls: "text-red-700 bg-red-50 border-red-200" },
};

export default function CatalogueCard({ activity, bookmarked = false, onBookmark, isEnrolled = false, listMode = false }: any) {
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [localEnrolled, setLocalEnrolled] = useState(isEnrolled);

  const domain = DOMAINS[activity.domain] || DOMAINS.TEC;
  const DomainIcon = DOMAIN_ICON[activity.domain] || FiCpu;
  const enrolled = (activity.enrolledCount || 0) + (localEnrolled && !isEnrolled ? 1 : 0);
  const max = activity.maxEnrollment || 0;
  const fillPct = max > 0 ? Math.min(100, Math.round((enrolled / max) * 100)) : 0;
  const isFull = max > 0 && enrolled >= max;
  const diffConf = DIFFICULTY_CONFIG[activity.difficulty] || DIFFICULTY_CONFIG.Beginner;
  const isRegistrationOpen = activity.registration_open !== 0;
  const isCompleted = activity.status === 'completed' || activity.approval_status === 'completed' || !!activity.is_attendance_locked;

  const dateLabel = formatActivityDate(activity.activity_date);
  const timeLabel = formatTimeRange(activity.start_time, activity.end_time);
  const venueLabel = activity.venue || null;
  const hasSchedule = isRegistrationOpen && Boolean(dateLabel || timeLabel || venueLabel);

  const handleEnroll = async () => {
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/activities/${activity.code}/enroll`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLocalEnrolled(true);
      } else {
        alert(data.message || "Enrollment failed");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setEnrollLoading(false);
    setEnrollModalOpen(false);
  };

  // ── List-mode row ──────────────────────────────────────────────────────────
  if (listMode) {
    return (
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: domain.bg }}
          >
            <DomainIcon size={17} style={{ color: domain.color }} />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[10px] font-mono text-gray-400">{activity.code}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${diffConf.cls}`}>
                {activity.difficulty}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-red-800 transition-colors truncate">
              {activity.name}
            </h3>
            {hasSchedule && (
              <div className="flex items-center gap-3 mt-1 flex-wrap text-[11px] text-gray-500">
                {dateLabel && <span className="flex items-center gap-1"><FiCalendar size={10} className="text-gray-400" /> {dateLabel}</span>}
                {timeLabel && <span className="flex items-center gap-1"><FiClock size={10} className="text-gray-400" /> {timeLabel}</span>}
                {venueLabel && <span className="flex items-center gap-1 min-w-0"><FiMapPin size={10} className="text-gray-400 flex-shrink-0" /> <span className="truncate">{venueLabel}</span></span>}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-5 text-xs text-gray-500 flex-shrink-0">
            <span className="flex items-center gap-1 font-bold" style={{ color: BRAND }}>
              <FiStar size={11} /> {activity.credits}
            </span>
            {max > 0 && (
              <span className="flex items-center gap-1">
                <FiUsers size={11} /> {enrolled}/{max}
              </span>
            )}
          </div>

          {/* Bookmark */}
          <button
            onClick={() => onBookmark?.(activity.code)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiBookmark
              size={13}
              className={bookmarked ? "fill-current" : ""}
              style={{ color: bookmarked ? BRAND : "#D1D5DB" }}
            />
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/dashboard/student/activity-catalogue/${activity.code}`}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Details
            </Link>
            <div className="relative">
              <button
                disabled={!isRegistrationOpen || isCompleted || isFull || localEnrolled}
                onClick={() => isRegistrationOpen && !isCompleted && !localEnrolled && !isFull && setEnrollModalOpen(true)}
                className="peer text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all disabled:cursor-not-allowed"
                style={{
                  backgroundColor: (localEnrolled || isCompleted) ? "#10B981" : (!isRegistrationOpen || isFull) ? "#D1D5DB" : BRAND,
                }}
              >
                {isCompleted ? "Completed" : localEnrolled ? "✓" : isFull ? "Full" : "Enroll"}
              </button>
              {!isRegistrationOpen && !isCompleted && !isFull && !localEnrolled && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-sm">
                  Registrations not open yet
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <EnrollModal
          isOpen={enrollModalOpen}
          onClose={() => setEnrollModalOpen(false)}
          onConfirm={handleEnroll}
          activityName={activity.name}
          loading={enrollLoading}
        />
      </div>
    );
  }

  // ── Grid-mode card ─────────────────────────────────────────────────────────
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top: domain icon + bookmark */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: domain.bg }}
        >
          <DomainIcon size={20} style={{ color: domain.color }} />
        </div>

        <button
          onClick={() => onBookmark?.(activity.code)}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          aria-label={bookmarked ? "Remove bookmark" : "Save activity"}
        >
          <FiBookmark
            size={14}
            className={bookmarked ? "fill-current" : ""}
            style={{ color: bookmarked ? BRAND : "#D1D5DB" }}
          />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 flex flex-col flex-1 gap-2.5">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: domain.color, backgroundColor: domain.bg }}
          >
            {activity.domain}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffConf.cls}`}>
            {activity.difficulty}
          </span>
        </div>

        {/* Code + Title */}
        <div>
          <p className="text-[10px] font-mono text-gray-400 mb-0.5">{activity.code}</p>
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-800 transition-colors">
            {activity.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {activity.purpose}
        </p>

        {/* Schedule & venue — only rendered when the activity has any set */}
        {hasSchedule && (
          <div className="flex flex-col gap-1 rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2">
            {dateLabel && (
              <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <FiCalendar size={11} className="text-gray-400 flex-shrink-0" /> {dateLabel}
              </span>
            )}
            {timeLabel && (
              <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <FiClock size={11} className="text-gray-400 flex-shrink-0" /> {timeLabel}
              </span>
            )}
            {venueLabel && (
              <span className="flex items-center gap-1.5 text-[11px] text-gray-600 min-w-0">
                <FiMapPin size={11} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{venueLabel}</span>
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-bold" style={{ color: BRAND }}>
            <FiStar size={11} /> {activity.credits} pts
          </span>
          {max > 0 && (
            <span className="flex items-center gap-1 text-gray-500">
              <FiUsers size={11} /> {enrolled}/{max}
            </span>
          )}
        </div>

        {/* Enrollment bar */}
        {max > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${fillPct}%`,
                  backgroundColor: isFull ? "#DC2626" : fillPct > 80 ? "#D97706" : domain.color,
                }}
              />
            </div>
            <p className="text-[9px] text-gray-400">
              {isFull
                ? "No seats available"
                : `${max - enrolled} seat${max - enrolled !== 1 ? "s" : ""} remaining`}
            </p>
          </div>
        )}

        {/* Actions — pinned to bottom */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/dashboard/student/activity-catalogue/${activity.code}`}
            className="flex items-center justify-center gap-1 flex-1 text-xs font-semibold py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Details <FiArrowRight size={11} />
          </Link>
          <div className="relative flex-1">
            <button
              disabled={!isRegistrationOpen || isCompleted || isFull || localEnrolled}
              onClick={() => isRegistrationOpen && !isCompleted && !localEnrolled && !isFull && setEnrollModalOpen(true)}
              className="peer w-full text-xs font-bold py-2.5 rounded-xl text-white transition-all disabled:cursor-not-allowed"
              style={{
                backgroundColor: (localEnrolled || isCompleted) ? "#10B981" : (!isRegistrationOpen || isFull) ? "#D1D5DB" : BRAND,
              }}
            >
              {isCompleted ? "Completed"
                : localEnrolled ? <span className="flex items-center justify-center gap-1"><FiCheckCircle size={11} /> Enrolled</span>
                : isFull ? "Full" : "Enroll"}
            </button>
            {!isRegistrationOpen && !isCompleted && !isFull && !localEnrolled && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-sm">
                Registrations not open yet
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EnrollModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        onConfirm={handleEnroll}
        activityName={activity.name}
        loading={enrollLoading}
      />
    </div>
  );
}
