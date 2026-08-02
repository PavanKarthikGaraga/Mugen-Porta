"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiUsers, FiTrendingUp, FiRefreshCw, FiChevronRight,
  FiFileText, FiActivity, FiHome, FiMapPin,
} from "react-icons/fi";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apiErrorHandler";
import StatCard from "@/app/components/dashboard/StatCard";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import ProgressCard from "@/app/components/dashboard/ProgressCard";

const BRAND = "rgb(151,0,3)";

const yearOrder  = ["1st", "2nd", "3rd", "4th"];
const yearColors = ["#B45309", "#059669", "#2563EB", "#DC2626"];
const yearLabels: Record<string, string> = {
  "1st": "1st Year", "2nd": "2nd Year", "3rd": "3rd Year", "4th": "4th Year",
};

async function exportResidenceList(type: "Hostel" | "Day Scholar") {
  const res = await fetch(`/api/dashboard/lead/residence-list?type=${encodeURIComponent(type)}`);
  if (!res.ok) { toast.error("Failed to fetch student list for export"); return; }
  const d = await res.json();
  const students: any[] = d.students ?? [];
  if (students.length === 0) { toast.error(`No ${type.toLowerCase()} students found`); return; }

  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(type);
  ws.columns = [{ width: 16 }, { width: 28 }, { width: 10 }, { width: 18 }, { width: 24 }];

  ws.mergeCells("A1:E1");
  const tc = ws.getCell("A1");
  tc.value = `${type} Students`;
  tc.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  tc.alignment = { horizontal: "center", vertical: "middle" };
  tc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
  ws.getRow(1).height = 28;

  const headers = type === "Hostel"
    ? ["Student ID", "Student Name", "Year", "Branch", "Hostel"]
    : ["Student ID", "Student Name", "Year", "Branch", "Bus Route"];
  const hr = ws.addRow(headers);
  hr.eachCell(c => {
    c.font = { bold: true }; c.alignment = { horizontal: "center" };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
  });

  students.forEach((s: any) => {
    ws.addRow([s.username, s.name, s.year, s.branch, type === "Hostel" ? (s.hostelName ?? "") : (s.busRoute ?? "")]);
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${type.replace(" ", "_")}_Students.xlsx`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast.success(`${type} list downloaded`);
}

function Skeleton() {
  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-pulse">
      <div className="h-20 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-56 bg-gray-100 rounded-xl" />
        <div className="h-56 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function LeadOverviewPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    recentRegistrations: 0,
    yearWiseCount: {} as Record<string, number>,
    residenceWiseCount: { Hostel: 0, "Day Scholar": 0 } as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"Hostel" | "Day Scholar" | null>(null);

  const handleExport = async (type: "Hostel" | "Day Scholar") => {
    setExporting(type);
    try { await exportResidenceList(type); } finally { setExporting(null); }
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/lead/stats");
      if (await handleApiError(res)) return;
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const maxYear = Math.max(...yearOrder.map((y) => stats.yearWiseCount[y] ?? 0), 1);
  const hostelCount = stats.residenceWiseCount["Hostel"] ?? 0;
  const dayScholarCount = stats.residenceWiseCount["Day Scholar"] ?? 0;
  const maxResidence = Math.max(hostelCount, dayScholarCount, 1);

  if (loading && !stats.totalStudents) return <Skeleton />;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ backgroundColor: BRAND }} />
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Club Overview</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Your club · Lead Control Panel
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<FiUsers size={16} />}
          label="Total Members"
          value={loading ? "—" : stats.totalStudents.toLocaleString()}
          accent={BRAND}
        />
        <StatCard
          icon={<FiTrendingUp size={16} />}
          label="Recent (30 days)"
          value={loading ? "—" : stats.recentRegistrations.toLocaleString()}
          trend={stats.recentRegistrations > 0 ? "new registrations" : undefined}
          trendUp={stats.recentRegistrations > 0}
          accent="#059669"
        />
      </div>

      {/* Year & Domain distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Year distribution */}
        <DashboardCard
          title="Year Distribution"
          subtitle="Members by academic year"
          action={
            <Link href="/dashboard/lead/students" className="text-xs font-medium hover:underline flex items-center gap-0.5" style={{ color: BRAND }}>
              View members <FiChevronRight size={12} />
            </Link>
          }
        >
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3,4].map((i) => <div key={i} className="h-6 bg-gray-100 rounded" />)}
            </div>
          ) : Object.keys(stats.yearWiseCount).length > 0 ? (
            <div className="space-y-3">
              {yearOrder.map((y, i) => (
                <ProgressCard
                  key={y}
                  label={yearLabels[y]}
                  value={stats.yearWiseCount[y] ?? 0}
                  max={maxYear}
                  showPercentage={false}
                  suffix=" students"
                  color={yearColors[i]}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic text-center py-4">No year data yet</p>
          )}
        </DashboardCard>

        {/* Residence breakdown */}
        <DashboardCard
          title="Residence Breakdown"
          subtitle="Hostellers vs Day Scholars"
        >
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2].map((i) => <div key={i} className="h-6 bg-gray-100 rounded" />)}
            </div>
          ) : (
            <div className="space-y-4">
              <ProgressCard
                label="Hostellers"
                value={hostelCount}
                max={maxResidence}
                showPercentage={false}
                suffix=" students"
                color="#2563EB"
              />
              <ProgressCard
                label="Day Scholars"
                value={dayScholarCount}
                max={maxResidence}
                showPercentage={false}
                suffix=" students"
                color="#D97706"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleExport("Hostel")}
                  disabled={exporting !== null || hostelCount === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FiHome size={12} />
                  {exporting === "Hostel" ? "Exporting…" : "Export Hostellers"}
                </button>
                <button
                  onClick={() => handleExport("Day Scholar")}
                  disabled={exporting !== null || dayScholarCount === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FiMapPin size={12} />
                  {exporting === "Day Scholar" ? "Exporting…" : "Export Day Scholars"}
                </button>
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Members",     icon: <FiUsers    size={18} />, href: "/dashboard/lead/students", color: "#2563EB" },
          { label: "Submissions", icon: <FiFileText size={18} />, href: "/dashboard/lead/reports",  color: "#7C3AED" },
          { label: "SAMAM",       icon: <FiActivity size={18} />, href: "/dashboard/lead/samam",    color: BRAND    },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center gap-2 text-center group"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${item.color}15`, color: item.color }}
            >
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
