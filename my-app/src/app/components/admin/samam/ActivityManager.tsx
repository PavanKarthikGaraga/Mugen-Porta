"use client";
import Link from "next/link";
import { FiSearch, FiRefreshCw, FiPlus, FiActivity, FiCheckCircle, FiAlertCircle, FiEdit2, FiTrash2, FiUserCheck } from "react-icons/fi";
import { BRAND, DOMAIN_COLORS } from "./SharedUI";

const DOMAIN_NAMES: Record<string, string> = {
  TEC: "TEC (Technical)",
  LCH: "LCH (Liberal Arts)",
  ESO: "ESO (Extension & Society Outreach)",
  IIE: "IIE (Innovation, Incubation and Entrepreneurship)",
  HWB: "HWB (Health and Wellbeing)",
};

export default function ActivityManager({
  actSearchStr, setActSearchStr, fetchActivities, activitiesLoading, filteredActivities, deleteActivity
}: any) {
  const groupedActivities = filteredActivities.reduce((acc: any, curr: any) => {
    const domain = curr.domain || "Other";
    const category = curr.category || "General";
    
    if (!acc[domain]) acc[domain] = {};
    if (!acc[domain][category]) acc[domain][category] = [];
    
    acc[domain][category].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={actSearchStr} onChange={e => setActSearchStr(e.target.value)}
            placeholder="Search activities by title or code..."
            className="w-full h-9 pl-9 pr-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors shadow-sm" />
        </div>
        <button onClick={fetchActivities}
          className="h-9 px-4 text-[13px] font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm">
          <FiRefreshCw size={14} className={activitiesLoading ? "animate-spin" : ""} /> Refresh
        </button>
        <Link
          href="/dashboard/admin/samam/activities/new"
          className="h-9 px-4 text-[13px] font-medium rounded-md text-white flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm" style={{ backgroundColor: BRAND }}>
          <FiPlus size={14} /> New Activity
        </Link>
      </div>

      <div className="bg-white rounded-md border border-gray-200 flex-1 flex flex-col">
        <div className="overflow-x-auto">
          {activitiesLoading ? (
            <div className="p-5 space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-sm animate-pulse" />)}</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[13px] font-medium text-gray-900">No activities found</p>
              <p className="text-[12px] text-gray-500 mt-1">Try adjusting your search criteria or create a new activity.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedActivities).map(([domain, categoriesObj]: [string, any]) => (
                <div key={domain} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{DOMAIN_NAMES[domain] || domain}</h2>
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                      {Object.values(categoriesObj).flat().length} Activities
                    </span>
                    <div className="flex-1 border-b border-gray-200"></div>
                  </div>
                  
                  <div className="space-y-8 pl-4">
                    {Object.entries(categoriesObj).map(([category, items]: [string, any]) => (
                      <div key={category} className="bg-white rounded-md border border-gray-200">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="font-semibold text-gray-800 text-[14px]">{category}</h3>
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{items.length} Activities</span>
                        </div>
                        <table className="w-full text-[13px]">
                          <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                              {["Code", "Title", "Type", "Points", "Enrollment", "Status", ""].map((h, i) => (
                                <th key={i} className="px-5 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {items.map((a: any) => (
                              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-5 py-3">
                                  <span className="font-mono text-[11px] text-gray-600">{a.code}</span>
                                </td>
                                <td className="px-5 py-3">
                                  <p className="font-medium text-gray-900">{a.title}</p>
                                  {a.description && <p className="text-[11px] text-gray-500 truncate max-w-[250px] mt-0.5">{a.description}</p>}
                                </td>
                                <td className="px-5 py-3 capitalize text-gray-600">{a.activity_type || a.category || "General"}</td>
                                <td className="px-5 py-3 font-medium text-gray-900">{a.points || a.sdc_credits}</td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <span>{a.enrolledCount || 0}</span>
                                    <span className="text-gray-400">/ {a.max_participants || a.max_seats || "∞"}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3">
                                  <span className={`flex items-center gap-1.5 text-[11px] font-medium ${a.status === 'active' || a.is_active ? "text-emerald-700" : "text-gray-500"}`}>
                                    {a.status === 'active' || a.is_active ? <FiCheckCircle size={12} /> : <FiAlertCircle size={12} />}
                                    {a.status === 'active' || a.is_active ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                    <Link
                                      href={`/dashboard/admin/activities/${a.code}/attendance`}
                                      title="Mark Attendance"
                                      className="text-gray-400 hover:text-brand-600 transition-colors">
                                      <FiUserCheck size={14} />
                                    </Link>
                                    <Link
                                      href={`/dashboard/admin/samam/activities/${a.code}/edit`}
                                      title="Edit Activity"
                                      className="text-gray-400 hover:text-gray-900 transition-colors">
                                      <FiEdit2 size={14} />
                                    </Link>
                                    <button onClick={() => deleteActivity(a.code || a.id)}
                                      title="Delete"
                                      className="text-gray-400 hover:text-red-600 transition-colors">
                                      <FiTrash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
