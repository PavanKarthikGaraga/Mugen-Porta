"use client";
import Link from "next/link";
import {
  FiChevronRight, FiStar, FiAward, FiCheckCircle, FiAlertCircle,
  FiCpu, FiBookOpen, FiHeart, FiZap, FiActivity,
  FiCalendar, FiClock, FiMapPin,
} from "react-icons/fi";
import { DOMAINS } from "@/app/Data/activities-mock";
import { formatActivityDate, formatTimeRange } from "@/lib/formatSchedule";

const BRAND = "rgb(151,0,3)";

const DOMAIN_ICON: Record<string, React.ElementType> = {
  TEC: FiCpu,
  LCH: FiBookOpen,
  ESO: FiHeart,
  IIE: FiZap,
  HWB: FiActivity,
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  registered:     { label: "Registered",   cls: "text-blue-700 bg-blue-50 border-blue-200",       dot: "bg-blue-500" },
  ongoing:        { label: "Ongoing",      cls: "text-amber-700 bg-amber-50 border-amber-200",     dot: "bg-amber-500" },
  completed:      { label: "Completed",    cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  pending_review: { label: "Under Review", cls: "text-purple-700 bg-purple-50 border-purple-200",  dot: "bg-purple-500" },
  certificates:   { label: "Cert Ready",  cls: "text-green-700 bg-green-50 border-green-200",     dot: "bg-green-500" },
  archived:       { label: "Archived",     cls: "text-gray-500 bg-gray-50 border-gray-200",        dot: "bg-gray-400" },
};

export default function MyActivityRow({ activity, tabKey }: any) {
  const domainCode = activity?.domain || "TEC";
  const domain = DOMAINS[domainCode] || DOMAINS.TEC;
  const DomainIcon = DOMAIN_ICON[domainCode] || FiCpu;
  const statusKey = activity?.enrollment_status || tabKey || "registered";
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.registered;

  const assignments: any[] = Array.isArray(activity?.assignments)
    ? activity.assignments
    : typeof activity?.assignments === "string"
    ? (() => { try { return JSON.parse(activity.assignments || "[]"); } catch { return []; } })()
    : [];

  const submittedCount = assignments.filter((a) => a.submitted).length;
  const totalAssignments = assignments.length;

  const dateLabel = formatActivityDate(activity?.activity_date);
  const timeLabel = formatTimeRange(activity?.start_time, activity?.end_time);
  const venueLabel = activity?.venue || null;
  const hasSchedule = Boolean(dateLabel || timeLabel || venueLabel);

  return (
    <Link
      href={`/dashboard/student/activity-catalogue/${activity?.code}`}
      className="block group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 p-4"
    >
      <div className="flex items-start gap-3">
        {/* Domain icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: domain.bg }}
        >
          <DomainIcon size={19} style={{ color: domain.color }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[10px] font-mono text-gray-400">{activity?.code}</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ color: domain.color, backgroundColor: domain.bg }}
                >
                  {domainCode}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-red-800 transition-colors">
                {activity?.name}
              </h4>
              {activity?.category && (
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{activity.category}</p>
              )}
              {hasSchedule && (
                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-gray-500">
                  {dateLabel && <span className="flex items-center gap-1"><FiCalendar size={10} className="text-gray-400" /> {dateLabel}</span>}
                  {timeLabel && <span className="flex items-center gap-1"><FiClock size={10} className="text-gray-400" /> {timeLabel}</span>}
                  {venueLabel && <span className="flex items-center gap-1 min-w-0"><FiMapPin size={10} className="text-gray-400 flex-shrink-0" /> <span className="truncate">{venueLabel}</span></span>}
                </div>
              )}
            </div>

            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 flex items-center gap-1.5 ${config.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1 font-bold" style={{ color: BRAND }}>
              <FiStar size={11} />
              {activity?.credits_earned || activity?.credits || 0} pts
            </span>
            {(activity?.userAttendance ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <FiCheckCircle size={11} />
                {activity.userAttendance}% attendance
              </span>
            )}
          </div>

          {/* Assignment progress dots */}
          {totalAssignments > 0 && (
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span className="text-[10px] font-medium text-gray-500">
                {submittedCount}/{totalAssignments} tasks
              </span>
              <div className="flex gap-1">
                {assignments.map((a: any, idx: number) => (
                  <span
                    key={a.id || idx}
                    title={a.title || `Task ${idx + 1}`}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      a.submitted ? "bg-emerald-400" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              {submittedCount === totalAssignments && totalAssignments > 0 && (
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <FiCheckCircle size={9} /> All done
                </span>
              )}
            </div>
          )}

          {/* Faculty feedback */}
          {activity?.facultyFeedback && (
            <div className="mt-2.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[10px] font-bold text-blue-600 mb-0.5">Faculty Feedback</p>
              <p className="text-xs text-blue-800 line-clamp-2 leading-relaxed">
                {activity.facultyFeedback}
              </p>
            </div>
          )}

          {/* Badges / certs */}
          {(activity?.badgeEarned || activity?.certificateReady) && (
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {activity?.badgeEarned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <FiAward size={10} /> {activity.badge || "Badge Earned"}
                </span>
              )}
              {activity?.certificateReady && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FiCheckCircle size={10} /> Certificate Ready
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl group-hover:bg-gray-100 transition-colors text-gray-300 group-hover:text-gray-600 mt-0.5">
          <FiChevronRight size={16} />
        </div>
      </div>
    </Link>
  );
}
