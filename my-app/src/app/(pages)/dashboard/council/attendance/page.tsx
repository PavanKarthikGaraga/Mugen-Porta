"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiClock, FiCheckCircle, FiXCircle, FiChevronRight, FiRefreshCw,
  FiUsers, FiActivity,
} from "react-icons/fi";

const BRAND = "rgb(151,0,3)";

const statusMeta = {
  pending:  { label: "Pending",  color: "#D97706", bg: "#FFFBEB", icon: <FiClock       size={13} /> },
  verified: { label: "Verified", color: "#059669", bg: "#F0FDF4", icon: <FiCheckCircle size={13} /> },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEF2F2", icon: <FiXCircle     size={13} /> },
};

function Skeleton() {
  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-pulse">
      <div className="h-20 bg-gray-100 rounded-xl" />
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function CouncilAttendancePage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/council/attendance");
      if (res.ok) {
        const d = await res.json();
        setSubmissions(d.submissions ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const filtered = filter === "all" ? submissions : submissions.filter(s => s.status === filter);
  const counts = {
    all: submissions.length,
    pending:  submissions.filter(s => s.status === "pending").length,
    verified: submissions.filter(s => s.status === "verified").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
  };

  if (loading && submissions.length === 0) return <Skeleton />;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ backgroundColor: BRAND }} />
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Attendance Verification</h1>
            <p className="text-xs text-gray-500 mt-0.5">Review, upload physical sheets, and verify club attendance</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/council/attendance-records"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
            >
              <FiActivity size={13} /> Records
            </Link>
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "pending", "verified", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filter === f ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            style={filter === f ? { backgroundColor: f === "all" ? BRAND : statusMeta[f]?.color } : {}}
          >
            {f === "all" ? "All" : statusMeta[f].label} ({counts[f]})
          </button>
        ))}
      </div>

      {/* List */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <FiUsers size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No attendance submissions yet</p>
          <p className="text-xs text-gray-400 mt-1">Submissions from club leads will appear here</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">No {filter} submissions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const meta = statusMeta[sub.status as keyof typeof statusMeta];
            const presentPct = sub.total_count > 0 ? Math.round((sub.present_count / sub.total_count) * 100) : 0;
            return (
              <Link
                key={sub.id}
                href={`/dashboard/council/attendance/${sub.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex items-center gap-5 group block"
              >
                {/* Status dot */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: meta.bg, color: meta.color }}
                >
                  {meta.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 truncate">{sub.activity_title}</span>
                    <span className="text-xs font-mono text-gray-400">({sub.activity_code})</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">{sub.club_name}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">
                      Submitted {new Date(sub.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {sub.total_count > 0 && (
                      <>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs font-medium" style={{ color: "#059669" }}>{sub.present_count} present</span>
                        <span className="text-xs font-medium text-red-500">{sub.absent_count} absent</span>
                        <span className="text-xs text-gray-400">({presentPct}%)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <FiChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
