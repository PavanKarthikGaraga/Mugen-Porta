"use client";
import Link from "next/link";
import { FiChevronRight, FiClock, FiStar, FiAward, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import ProgressCard from "./ProgressCard";
import { DOMAINS } from "@/app/Data/activities-mock";

const STATUS_CONFIG = {
  registered:      { label: "Registered",      bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200"   },
  ongoing:         { label: "Ongoing",          bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200"  },
  completed:       { label: "Completed",        bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200"},
  pending_review:  { label: "Pending Review",   bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-200" },
  certificates:    { label: "Certificate Ready",bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200"  },
  archived:        { label: "Archived",         bg: "bg-gray-50",    text: "text-gray-500",   border: "border-gray-200"   },
};

export default function MyActivityRow({ activity, tabKey }) {
  const domainCode = activity?.domain || "TEC";
  const domain = DOMAINS[domainCode] || DOMAINS.TEC;
  const statusKey = activity?.enrollment_status || tabKey || "registered";
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.registered;
  
  // Ensure assignments is always an array
  const assignments = Array.isArray(activity?.assignments) ? activity.assignments : 
                      (typeof activity?.assignments === 'string' ? JSON.parse(activity.assignments || '[]') : []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4">
      <div className="flex items-start gap-4">
        {/* Domain color pill */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0"
          style={{ backgroundColor: domain.color }}
        >
          {domainCode[0]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-mono text-gray-400">{activity?.code}</p>
              <h4 className="text-sm font-semibold text-gray-900 leading-snug">{activity?.name}</h4>
              <p className="text-xs text-gray-400 mt-0.5">👤 {activity?.faculty} · {activity?.semester}</p>
            </div>
            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${config.bg} ${config.text} ${config.border}`}>
              {config.label}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <FiStar size={11} style={{ color: "rgb(151,0,3)" }} />
              <span className="font-semibold text-gray-700">{activity?.credits_earned || activity?.credits || 0}</span> SAMAM Points
            </span>
            <span className="flex items-center gap-1">
              <FiClock size={11} /> {activity?.hours || 0}h
            </span>
            {activity?.userAttendance > 0 && (
              <span className="flex items-center gap-1">
                <FiCheckCircle size={11} className="text-emerald-500" />
                Attendance: {activity.userAttendance}%
              </span>
            )}
            {activity?.badgeEarned && (
              <span className="flex items-center gap-1">
                <FiAward size={11} className="text-amber-500" />
                <span className="text-amber-700 font-medium">{activity.badge}</span>
              </span>
            )}
            {activity?.certificateReady && (
              <span className="flex items-center gap-1">
                <FiCheckCircle size={11} className="text-green-500" />
                <span className="text-green-700 font-medium">Certificate Ready</span>
              </span>
            )}
          </div>

          {/* Progress bar */}
          {activity?.userProgress > 0 && (
            <div className="mt-3">
              <ProgressCard label="Progress" value={activity.userProgress} />
            </div>
          )}

          {/* Faculty feedback snippet */}
          {activity?.facultyFeedback && (
            <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-[10px] font-semibold text-blue-700 mb-0.5">Faculty Feedback</p>
              <p className="text-xs text-blue-800 line-clamp-2">{activity.facultyFeedback}</p>
            </div>
          )}

          {/* Assignment status */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {assignments.map((a: any) => (
              <span
                key={a.id}
                className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  a.submitted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                {a.submitted ? <FiCheckCircle size={9} /> : <FiAlertCircle size={9} />}
                {a.title}
              </span>
            ))}
          </div>
        </div>

        {/* View arrow */}
        <Link
          href={`/dashboard/student/activity-catalogue/${activity.code}`}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
        >
          <FiChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
