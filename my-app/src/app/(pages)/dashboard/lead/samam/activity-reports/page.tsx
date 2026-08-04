"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FiFileText, FiCheckCircle, FiClock, FiEdit2, FiRefreshCw } from "react-icons/fi";

const BRAND = "rgb(151,0,3)";

function statusInfo(status?: string) {
  if (status === "generated") return { label: "Generated", color: "text-emerald-700", Icon: FiCheckCircle };
  if (status === "draft") return { label: "Draft saved", color: "text-amber-600", Icon: FiClock };
  return { label: "Not started", color: "text-gray-400", Icon: FiFileText };
}

export default function ActivityReportsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/lead/samam/activity-reports");
      if (res.ok) setActivities((await res.json()).activities || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      <div className="mb-2">
        <h1 className="text-[16px] font-semibold text-gray-900">Activity Reports</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Generate the official KL SAC activity report PDF for each activity your club has run.
        </p>
      </div>

      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-700 text-[13px]">Your Activities ({activities.length})</h2>
          <button
            onClick={fetchActivities}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <FiFileText size={28} className="mx-auto mb-3 text-gray-300" />
            <p className="text-[13px] font-medium text-gray-900">No activities assigned to your club yet</p>
            <p className="text-[12px] text-gray-500 mt-1">Once an activity is mapped to your club, it&apos;ll show up here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  {["Code", "Activity", "Date", "Venue", "Report Status", ""].map((h, i) => (
                    <th key={i} className={`px-5 py-3 font-semibold text-gray-600 whitespace-nowrap ${h === "" ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((a) => {
                  const info = statusInfo(a.report_status);
                  return (
                    <tr key={a.code} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-[11px] text-gray-600">{a.code}</td>
                      <td className="px-5 py-3 font-medium text-gray-900 max-w-[260px] truncate">{a.title}</td>
                      <td className="px-5 py-3 text-gray-600">{a.activity_date ? String(a.activity_date).slice(0, 10) : "—"}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">{a.venue || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`flex items-center gap-1.5 text-[11px] font-medium ${info.color}`}>
                          <info.Icon size={12} /> {info.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/dashboard/lead/samam/activity-reports/${a.code}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: BRAND }}
                        >
                          <FiEdit2 size={12} /> {a.report_status ? "Edit Report" : "Generate Report"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
