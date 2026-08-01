"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FiArrowLeft, FiDownload, FiUsers, FiHome, FiBus,
  FiSearch, FiX, FiUser,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const RESIDENCE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  Hostel:       { label: "Hostel",      icon: FiHome, color: "#7C3AED", bg: "#F5F3FF" },
  "Day Scholar":{ label: "Day Scholar", icon: FiBus,  color: "#0369A1", bg: "#E0F2FE" },
};

export default function EnrolledStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [students, setStudents]   = useState<any[]>([]);
  const [activity, setActivity]   = useState<{ code: string; title: string } | null>(null);
  const [search, setSearch]       = useState("");
  const [filterRes, setFilterRes] = useState<"all" | "Hostel" | "Day Scholar">("all");

  useEffect(() => {
    fetch(`/api/dashboard/lead/samam/activities/${id}/students`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudents(d.students || []);
          setActivity(d.activity);
        } else {
          toast.error(d.error || "Failed to load students");
        }
      })
      .catch(() => toast.error("Network error"))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = students.filter(s => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || s.name?.toLowerCase().includes(q) || s.student_id?.toLowerCase().includes(q) || s.branch?.toLowerCase().includes(q);
    const matchR = filterRes === "all" || s.residenceType === filterRes;
    return matchQ && matchR;
  });

  const hostelCount    = students.filter(s => s.residenceType === "Hostel").length;
  const dayScholarCount = students.filter(s => s.residenceType === "Day Scholar").length;

  const handleDownload = async () => {
    if (students.length === 0) { toast.error("No students to export"); return; }
    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      wb.creator = "KL University SAC Activities";
      const ws = wb.addWorksheet("Enrolled Students");

      const cols = [
        { header: "Student ID",   key: "student_id",   width: 16 },
        { header: "Name",         key: "name",          width: 32 },
        { header: "Branch",       key: "branch",        width: 22 },
        { header: "Year",         key: "year",          width: 8  },
        { header: "Residence",    key: "residenceType", width: 14 },
        { header: "Hostel Name",  key: "hostelName",    width: 22 },
        { header: "Bus Route",    key: "busRoute",      width: 22 },
        { header: "Status",       key: "enrollment_status", width: 14 },
      ];
      ws.columns = cols;

      // Title row
      ws.mergeCells(`A1:H1`);
      const titleCell = ws.getCell("A1");
      titleCell.value  = `${activity?.title || id} (${activity?.code || id}) — Enrolled Students`;
      titleCell.font   = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
      titleCell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(1).height = 28;

      // Sub-header info row
      ws.mergeCells("A2:H2");
      const infoCell = ws.getCell("A2");
      infoCell.value = `Total: ${students.length}  |  Hostel: ${hostelCount}  |  Day Scholar: ${dayScholarCount}  |  Generated: ${new Date().toLocaleString()}`;
      infoCell.font  = { size: 9, color: { argb: "FF6B7280" } };
      infoCell.alignment = { horizontal: "center" };
      ws.getRow(2).height = 16;

      // Column headers
      const headerRow = ws.addRow(cols.map(c => c.header));
      headerRow.eachCell(cell => {
        cell.font      = { bold: true, color: { argb: "FF111827" } };
        cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border    = { bottom: { style: "thin", color: { argb: "FFD1D5DB" } } };
      });
      headerRow.height = 20;

      // Data rows
      students.forEach((s, i) => {
        const row = ws.addRow([
          s.student_id,
          s.name,
          s.branch,
          s.year,
          s.residenceType,
          s.residenceType === "Hostel" ? (s.hostelName || "N/A") : "—",
          s.residenceType === "Day Scholar" ? (s.busRoute || "N/A") : "—",
          s.enrollment_status || "registered",
        ]);
        const isHostel = s.residenceType === "Hostel";
        row.getCell(5).fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: isHostel ? "FFF5F3FF" : "FFE0F2FE" },
        };
        row.getCell(5).font = { color: { argb: isHostel ? "FF7C3AED" : "FF0369A1" } };
        if (i % 2 === 1) {
          [1, 2, 3, 4, 6, 7, 8].forEach(col => {
            row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
          });
        }
      });

      // Auto-fit columns
      ws.columns.forEach(col => { if (!col.width || col.width < 10) col.width = 10; });

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activity?.code || id}_enrolled_students.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${students.length} students`);
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${BRAND} 0%, #7C3AED 100%)` }} />
        <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/lead/samam"
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <FiArrowLeft size={16} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {activity ? `${activity.title}` : id} — Enrolled Students
              </h1>
              {activity && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{activity.code}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={exporting || students.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            <FiDownload size={15} />
            {exporting ? "Exporting…" : "Download XLSX"}
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Enrolled", value: students.length, color: BRAND, bg: "#FFF1F1", icon: FiUsers },
            { label: "Hostel", value: hostelCount, color: "#7C3AED", bg: "#F5F3FF", icon: FiHome },
            { label: "Day Scholar", value: dayScholarCount, color: "#0369A1", bg: "#E0F2FE", icon: FiBus },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or branch…"
            className="w-full h-9 pl-9 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "Hostel", "Day Scholar"] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRes(r)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterRes === r ? "text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              style={filterRes === r ? { backgroundColor: r === "Hostel" ? "#7C3AED" : r === "Day Scholar" ? "#0369A1" : BRAND } : {}}
            >
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{filtered.length} of {students.length}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading students…</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <FiUser size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {students.length === 0 ? "No students enrolled yet" : "No students match your filter"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Residence</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hostel / Bus Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => {
                  const res = RESIDENCE_CONFIG[s.residenceType] || RESIDENCE_CONFIG["Day Scholar"];
                  const ResIcon = res.icon;
                  const detail = s.residenceType === "Hostel"
                    ? (s.hostelName && s.hostelName !== "N/A" ? s.hostelName : "—")
                    : (s.busRoute || "—");
                  return (
                    <tr key={s.student_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{s.student_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.branch}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.year}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: res.bg, color: res.color }}
                        >
                          <ResIcon size={10} />
                          {s.residenceType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{detail}</td>
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
