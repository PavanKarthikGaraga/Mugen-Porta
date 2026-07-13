"use client";
import Link from "next/link";
import { FiSearch, FiRefreshCw, FiPlus, FiActivity, FiCheckCircle, FiAlertCircle, FiEdit2, FiTrash2 } from "react-icons/fi";
import { BRAND, DOMAIN_COLORS } from "./SharedUI";

export default function ActivityManager({
  actSearchStr, setActSearchStr, fetchActivities, activitiesLoading, filteredActivities, deleteActivity
}: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={actSearchStr} onChange={e => setActSearchStr(e.target.value)}
            placeholder="Search activities by title or code…"
            className="w-full h-10 pl-9 pr-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm" />
        </div>
        <button onClick={fetchActivities}
          className="h-10 px-4 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm">
          <FiRefreshCw size={14} className={activitiesLoading ? "animate-spin" : ""} /> Refresh
        </button>
        <Link
          href="/dashboard/admin/samam/activities/new"
          className="h-10 px-5 text-xs font-bold rounded-xl text-white flex items-center gap-2 hover:opacity-90 transition-all shadow-sm hover:shadow" style={{ backgroundColor: BRAND }}>
          <FiPlus size={14} /> New Activity
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activitiesLoading ? (
            <div className="p-4 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <FiActivity size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No activities found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or create a new one.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  {["Code", "Title", "Domain", "Type", "Points", "Participants", "Status", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left font-bold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredActivities.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{a.code}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-gray-900 group-hover:text-[rgb(151,0,3)] transition-colors">{a.title}</p>
                      {a.description && <p className="text-gray-400 truncate max-w-[200px] mt-0.5">{a.description}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full font-bold text-white text-[10px] tracking-wide"
                        style={{ backgroundColor: DOMAIN_COLORS[a.domain] || "#6B7280" }}>
                        {a.domain}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 capitalize font-medium text-gray-700">{a.activity_type || a.category || "General"}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{a.points || a.sdc_credits}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-700">{a.enrolledCount || 0}</span>
                        <span className="text-gray-400 font-medium">/ {a.max_participants || a.max_seats || "∞"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md w-fit ${a.status === 'active' || a.is_active ? "text-emerald-700 bg-emerald-50" : "text-gray-500 bg-gray-100"}`}>
                        {a.status === 'active' || a.is_active ? <FiCheckCircle size={12} /> : <FiAlertCircle size={12} />}
                        {a.status === 'active' || a.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/dashboard/admin/samam/activities/${a.code}/edit`}
                          className="text-blue-600 hover:text-white hover:bg-blue-600 p-1.5 rounded-lg border border-blue-100 hover:border-blue-600 transition-colors">
                          <FiEdit2 size={13} />
                        </Link>
                        <button onClick={() => deleteActivity(a.code || a.id)}
                          className="text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-lg border border-red-100 hover:border-red-500 transition-colors">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
