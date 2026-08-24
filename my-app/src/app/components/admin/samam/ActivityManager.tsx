"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { FiSearch, FiRefreshCw, FiPlus, FiActivity, FiCheckCircle, FiAlertCircle, FiEdit2, FiTrash2, FiUserCheck, FiUsers, FiDownload } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND, DOMAIN_COLORS } from "./SharedUI";
import { usePersistedState } from "@/lib/hooks/usePersistedState";

const DOMAIN_NAMES: Record<string, string> = {
  TEC: "TEC (Technical)",
  LCH: "LCH (Liberal Arts)",
  ESO: "ESO (Extension & Society Outreach)",
  IIE: "IIE (Innovation, Incubation and Entrepreneurship)",
  HWB: "HWB (Health and Wellbeing)",
};

/**
 * Status shown to the admin is derived from registration_open + the
 * activity's date, not the raw `status` enum column -- that column doesn't
 * track "has this actually happened yet" or "is registration currently
 * open", so an activity created with status='upcoming' displayed as
 * "Inactive" even though it was perfectly normal. Once the activity date has
 * passed it's done regardless of the registration flag; otherwise the
 * registration flag decides whether it's currently open or not-yet-opened.
 */
function getActivityStatusInfo(a: any) {
  const activityDate = a.activity_date ? new Date(a.activity_date) : null;
  if (activityDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    activityDate.setHours(0, 0, 0, 0);
    if (activityDate < today) {
      return { label: "Completed", color: "text-gray-500" };
    }
  }
  if (Number(a.registration_open ?? 1) === 1) {
    return { label: "Registrations Active", color: "text-emerald-700" };
  }
  return { label: "Not Opened Yet", color: "text-amber-600" };
}

export default function ActivityManager({
  actSearchStr, setActSearchStr, fetchActivities, activitiesLoading, filteredActivities, deleteActivity, role = "admin"
}: any) {
  const [selectedDomain, setSelectedDomain] = usePersistedState(`samam_activities_domain_${role}`, "");
  const [selectedCategory, setSelectedCategory] = usePersistedState(`samam_activities_category_${role}`, "");
  const [selectedStatus, setSelectedStatus] = usePersistedState(`samam_activities_status_${role}`, "");
  const [exporting, setExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const approveActivity = async (code: string, action: 'approve' | 'reject', note?: string) => {
    setActionLoading(code);
    try {
      const res = await fetch(`/api/dashboard/admin/samam/activities/${code}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchActivities();
      } else {
        toast.error(data.message || 'Failed to update approval status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const displayActivities = useMemo(() => {
    return filteredActivities.filter((a: any) => {
      if (selectedDomain && a.domain !== selectedDomain) return false;
      if (selectedCategory && (a.category || "General") !== selectedCategory) return false;
      if (selectedStatus) {
        const info = getActivityStatusInfo(a);
        if (selectedStatus === "completed" && info.label !== "Completed") return false;
        if (selectedStatus === "active" && info.label === "Completed") return false;
      }
      return true;
    });
  }, [filteredActivities, selectedDomain, selectedCategory, selectedStatus]);

  const groupedActivities = displayActivities.reduce((acc: any, curr: any) => {
    const domain = curr.domain || "Other";
    const category = curr.category || "General";

    if (!acc[domain]) acc[domain] = {};
    if (!acc[domain][category]) acc[domain][category] = [];

    acc[domain][category].push(curr);
    return acc;
  }, {});

  // Render domain groups in the canonical TEC→LCH→ESO→IIE→HWB order. Object
  // key order otherwise follows insertion, which follows the API's
  // created_at DESC — so whichever domain had the most recently created
  // activity floated to the top and looked like the list was filtered to it.
  const orderedDomainGroups = Object.entries(groupedActivities).sort(
    ([a], [b]) => {
      const order = Object.keys(DOMAIN_NAMES);
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    }
  );

  // Extract unique domains and categories for dropdown options
  const rawDomains = Array.from(new Set(filteredActivities.map((a: any) => a.domain || "Other"))) as string[];
  const domainOrder = Object.keys(DOMAIN_NAMES);
  const availableDomains = rawDomains.sort((a, b) => {
    const idxA = domainOrder.indexOf(a);
    const idxB = domainOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
  const availableCategories = Array.from(new Set(
    filteredActivities
      .filter((a: any) => !selectedDomain || a.domain === selectedDomain)
      .map((a: any) => a.category || "General")
  )) as string[];

  // Exports exactly what's currently listed — same search + domain + category
  // filters the table is showing, in the same canonical domain order.
  const exportXlsx = async () => {
    if (displayActivities.length === 0) { toast.error("No activities to export"); return; }
    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Activities");
      ws.columns = [
        { header: "S.No", key: "sno", width: 7 },
        { header: "Code", key: "code", width: 14 },
        { header: "Title", key: "title", width: 40 },
        { header: "Domain", key: "domain", width: 10 },
        { header: "Category", key: "category", width: 26 },
        { header: "Points", key: "points", width: 9 },
        { header: "Enrolled", key: "enrolled", width: 10 },
        { header: "Max Seats", key: "max", width: 11 },
        { header: "Date", key: "date", width: 13 },
        { header: "Start", key: "start", width: 9 },
        { header: "End", key: "end", width: 9 },
        { header: "Venue", key: "venue", width: 26 },
        { header: "Registration", key: "reg", width: 13 },
        { header: "Status", key: "status", width: 11 },
      ];

      const header = ws.getRow(1);
      header.eachCell(c => {
        c.font = { bold: true, color: { argb: "FFFFFFFF" } };
        c.alignment = { horizontal: "center", vertical: "middle" };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
      });
      header.height = 22;
      ws.views = [{ state: "frozen", ySplit: 1 }];
      ws.autoFilter = { from: "A1", to: "N1" };

      const ordered = orderedDomainGroups.flatMap(([, categoriesObj]: [string, any]) =>
        Object.values(categoriesObj).flat() as any[]
      );

      ordered.forEach((a: any, i: number) => {
        const row = ws.addRow({
          sno: i + 1,
          code: a.code,
          title: a.title,
          domain: a.domain || "—",
          category: a.category || "General",
          points: a.points ?? a.sdc_credits ?? 0,
          enrolled: a.enrolledCount || 0,
          max: a.max_participants || a.max_seats || "∞",
          date: a.activity_date ? String(a.activity_date).slice(0, 10) : "—",
          start: a.start_time ? String(a.start_time).slice(0, 5) : "—",
          end: a.end_time ? String(a.end_time).slice(0, 5) : "—",
          venue: a.venue || "—",
          reg: Number(a.registration_open ?? 1) === 1 ? "Open" : "Closed",
          status: getActivityStatusInfo(a).label,
        });
        if (i % 2 === 1) {
          row.eachCell(c => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } }; });
        }
      });

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activities_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${ordered.length} activities`);
    } catch {
      toast.error("Failed to export activities");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={actSearchStr} onChange={e => setActSearchStr(e.target.value)}
            placeholder="Search activities by title or code..."
            className="w-full h-9 pl-9 pr-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors shadow-sm" />
        </div>
        
        {/* Fixed widths: a <select> sizes itself to the selected option's
            text, so picking a long domain/category name used to widen it and
            shove the Refresh / New Activity buttons across the row. */}
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={selectedDomain}
            onChange={(e) => { setSelectedDomain(e.target.value); setSelectedCategory(""); }}
            className="h-9 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors shadow-sm bg-white w-44 truncate"
          >
            <option value="">All Domains</option>
            {availableDomains.map(d => <option key={d} value={d}>{DOMAIN_NAMES[d] || d}</option>)}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors shadow-sm bg-white w-44 truncate"
          >
            <option value="">All Categories</option>
            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors shadow-sm bg-white w-32 truncate"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button onClick={fetchActivities}
          className="h-9 px-4 text-[13px] font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm shrink-0">
          <FiRefreshCw size={14} className={activitiesLoading ? "animate-spin" : ""} /> Refresh
        </button>
        <button onClick={exportXlsx}
          disabled={exporting || displayActivities.length === 0}
          className="h-9 px-4 text-[13px] font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm shrink-0 disabled:opacity-50">
          <FiDownload size={14} /> {exporting ? "Exporting…" : `Export XLSX (${displayActivities.length})`}
        </button>
        <Link
          href={role === "admin" ? "/dashboard/admin/samam/activities/new" : role === "council" ? "/dashboard/council/samam/activities/new" : "/dashboard/lead/samam/activities/new"}
          className="h-9 px-4 text-[13px] font-medium rounded-md text-white flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm" style={{ backgroundColor: BRAND }}>
          <FiPlus size={14} /> New Activity
        </Link>
      </div>

      <div className="bg-white rounded-md border border-gray-200 flex-1 flex flex-col">
        <div>
          {activitiesLoading ? (
            <div className="p-5 space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded-sm animate-pulse" />)}</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[13px] font-medium text-gray-900">No activities found</p>
              <p className="text-[12px] text-gray-500 mt-1">Try adjusting your search criteria or create a new activity.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {orderedDomainGroups.map(([domain, categoriesObj]: [string, any]) => (
                <div key={domain} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{DOMAIN_NAMES[domain] || domain}</h2>
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                      {Object.values(categoriesObj).flat().length} Activities
                    </span>
                    <div className="flex-1 border-b border-gray-200"></div>
                  </div>
                  
                  <div className="space-y-8 pl-4">
                    {/* overflow-hidden + the inner scroller keep each table
                        inside its card's border. The scroll container used to
                        sit above the headings, so a table wider than the
                        viewport spilled out past the card's own border
                        instead of scrolling within it. */}
                    {Object.entries(categoriesObj).map(([category, items]: [string, any]) => (
                      <div key={category} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="font-semibold text-gray-800 text-[14px]">{category}</h3>
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{items.length} Activities</span>
                        </div>
                        <div className="overflow-x-auto">
                        {/* min-width sized for every column plus the labelled
                            action buttons, so the table scrolls horizontally
                            rather than compressing until buttons wrap. */}
                        <table className="w-full min-w-[1020px] text-[13px]">
                          <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                              {/* No "Type" column — it repeated the category,
                                  which is already this card's heading and the
                                  dropdown filter, and its long values were
                                  what forced the table past the card. */}
                              {["Code", "Title", "Points", "Enrollment", "Status", "Approval", "Actions"].map((h, i) => (
                                <th
                                  key={i}
                                  className={`px-5 py-3 font-semibold text-gray-600 whitespace-nowrap ${h === "Actions" ? "text-right" : "text-left"}`}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {items.map((a: any) => (
                              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-5 py-3">
                                  <span className="font-mono text-[11px] text-gray-600">{a.code}</span>
                                </td>
                                <td className="px-5 py-3 align-middle">
                                  <p className="font-medium text-gray-900 max-w-[320px] leading-snug">{a.title}</p>
                                  {a.description && <p className="text-[11px] text-gray-500 truncate max-w-[320px] mt-0.5">{a.description}</p>}
                                </td>
                                <td className="px-5 py-3 font-medium text-gray-900">{a.points || a.sdc_credits}</td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <span>{a.enrolledCount || 0}</span>
                                    <span className="text-gray-400">/ {a.max_participants || a.max_seats || "∞"}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3">
                                  {(() => {
                                    const info = getActivityStatusInfo(a);
                                    return (
                                      <span className={`flex items-center gap-1.5 text-[11px] font-medium ${info.color}`}>
                                        {info.label === "Registrations Active" ? <FiCheckCircle size={12} /> : <FiAlertCircle size={12} />}
                                        {info.label}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="px-5 py-3">
                                  <span className={`flex items-center gap-1.5 text-[11px] font-medium ${a.approval_status === 'active' ? "text-emerald-700" : a.approval_status === 'pending_approval' ? "text-amber-600" : a.approval_status === 'rejected' ? "text-red-600" : "text-emerald-700"}`}>
                                    {a.approval_status === 'pending_approval' ? <FiAlertCircle size={12} /> : <FiCheckCircle size={12} />}
                                    {a.approval_status === 'pending_approval' ? "Pending" : a.approval_status === 'rejected' ? "Rejected" : "Approved"}
                                  </span>
                                </td>
                                {/* Always visible and labelled. These used to be
                                    icon-only and opacity-0 until row hover, so the
                                    actions were invisible until you happened to
                                    mouse over — and unreachable entirely on a
                                    touch device, which has no hover state. */}
                                {/* whitespace-nowrap + w-px keeps the action
                                    buttons on one line and shrinks the column to
                                    exactly their width, instead of the cell being
                                    squeezed until the buttons wrap and their
                                    borders clip. */}
                                <td className="px-5 py-3 whitespace-nowrap w-px align-middle">
                                  <div className="flex items-center gap-2 justify-end">
                                    {(role === "admin" || role === "faculty" || role === "council") && a.approval_status === 'pending_approval' && (
                                      <>
                                        <button
                                          onClick={() => approveActivity(a.code, 'approve')}
                                          disabled={actionLoading === a.code}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md border border-gray-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-colors whitespace-nowrap"
                                        >
                                          <FiCheckCircle size={13} /> Approve
                                        </button>
                                        <button
                                          onClick={() => {
                                            const note = prompt("Reason for rejection:");
                                            if (note !== null) approveActivity(a.code, 'reject', note);
                                          }}
                                          disabled={actionLoading === a.code}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md border border-gray-200 text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors whitespace-nowrap"
                                        >
                                          <FiTrash2 size={13} /> Reject
                                        </button>
                                      </>
                                    )}
                                    {/* Registrations come before Attendance —
                                        you check who signed up, then mark them. */}
                                    <Link
                                      href={role === "admin" ? `/dashboard/admin/samam/activities/${a.code}/students` : role === "council" ? `/dashboard/council/samam/activities/${a.code}/students` : `/dashboard/lead/samam/activities/${a.code}/students`}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors whitespace-nowrap"
                                    >
                                      <FiUsers size={13} /> Registrations
                                    </Link>
                                    <Link
                                      href={role === "admin" ? `/dashboard/admin/activities/${a.code}/attendance` : role === "council" ? `/dashboard/council/samam/activities/${a.code}/attendance` : `/dashboard/lead/samam/activities/${a.code}/attendance`}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors whitespace-nowrap"
                                    >
                                      <FiUserCheck size={13} /> Attendance
                                    </Link>
                                    <Link
                                      href={role === "admin" ? `/dashboard/admin/samam/activities/${a.code}/edit` : role === "council" ? `/dashboard/council/samam/activities/${a.code}/edit` : `/dashboard/lead/samam/activities/${a.code}/edit`}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors whitespace-nowrap"
                                    >
                                      <FiEdit2 size={13} /> Edit
                                    </Link>
                                    <button
                                      onClick={() => deleteActivity(a.code)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors whitespace-nowrap"
                                    >
                                      <FiTrash2 size={13} /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
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
