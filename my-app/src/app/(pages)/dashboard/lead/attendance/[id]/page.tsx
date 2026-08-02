"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FiArrowLeft, FiDownload, FiCheckCircle, FiXCircle, FiExternalLink, FiClock,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending Review", color: "#D97706", bg: "#FFFBEB" },
  verified: { label: "Verified",       color: "#059669", bg: "#F0FDF4" },
  rejected: { label: "Rejected",       color: "#DC2626", bg: "#FEF2F2" },
};

function Skeleton() {
  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-pulse">
      <div className="h-24 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}

export default function LeadAttendanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [loading,    setLoading   ] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  const [students,   setStudents  ] = useState<any[]>([]);
  const [exporting,  setExporting ] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/lead/attendance/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.submission) {
          setSubmission(d.submission);
          setStudents(d.students ?? []);
        } else {
          toast.error(d.error ?? "Failed to load submission");
        }
        setLoading(false);
      })
      .catch(() => { toast.error("Error connecting to server"); setLoading(false); });
  }, [id]);

  const handleExportExcel = async () => {
    if (students.length === 0) { toast.error("No students to export"); return; }
    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Attendance");
      ws.columns = [{ width: 20 }, { width: 32 }, { width: 16 }];

      ws.mergeCells("A1:C1");
      const tc = ws.getCell("A1");
      tc.value = `${submission.activity_title} (${submission.activity_code})`;
      tc.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      tc.alignment = { horizontal: "center", vertical: "middle" };
      tc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
      ws.getRow(1).height = 30;

      const hr = ws.addRow(["Student ID", "Student Name", "Status (P/A)"]);
      hr.eachCell(c => {
        c.font = { bold: true }; c.alignment = { horizontal: "center" };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
      });

      students.forEach(s => {
        const absent = s.attendance_percentage === 0;
        const row = ws.addRow([s.username, s.name, absent ? "A" : "P"]);
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "left" };
        const sc = row.getCell(3);
        sc.alignment = { horizontal: "center" };
        sc.font = { bold: true, color: { argb: "FFFFFFFF" } };
        sc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: absent ? "FFDC2626" : "FF16A34A" } };
      });

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${submission.activity_code}_Attendance.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Skeleton />;
  if (!submission) return (
    <div className="max-w-5xl mx-auto p-6 text-center">
      <p className="text-gray-500">Submission not found.</p>
      <Link href="/dashboard/lead/attendance" className="text-xs text-blue-600 hover:underline mt-2 inline-block">← Back to list</Link>
    </div>
  );

  const meta = statusMeta[submission.status];
  const presentCount = students.filter(s => s.attendance_percentage === 100).length;
  const absentCount  = students.length - presentCount;
  const presentPct   = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ backgroundColor: BRAND }} />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/lead/attendance" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <FiArrowLeft size={14} />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{submission.activity_title}</h1>
                <p className="text-xs text-gray-400 mt-0.5">{submission.activity_code} · {submission.club_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FiDownload size={13} /> {exporting ? "Exporting…" : "Export XLSX"}
              </button>
              <span
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold"
                style={{ backgroundColor: meta.bg, color: meta.color }}
              >
                {submission.status === "pending" && <FiClock size={13} />}
                {submission.status === "verified" && <FiCheckCircle size={13} />}
                {submission.status === "rejected" && <FiXCircle size={13} />}
                {meta.label}
              </span>
            </div>
          </div>

          {/* Submission info */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Submitted by",  value: submission.lead_username },
              { label: "Submitted at",  value: new Date(submission.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
              { label: "Verified by",   value: submission.verified_by ?? "—" },
              { label: "Verified at",   value: submission.verified_at ? new Date(submission.verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",   value: students.length, color: "#6B7280" },
          { label: "Present", value: presentCount,    color: "#059669" },
          { label: "Absent",  value: absentCount,     color: "#DC2626" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Attendance percentage bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Attendance Rate</span>
          <span className="text-sm font-bold text-gray-900">{presentPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${presentPct}%`, backgroundColor: presentPct >= 75 ? "#059669" : presentPct >= 50 ? "#D97706" : "#DC2626" }}
          />
        </div>
      </div>

      {/* Reviewer notes (rejected / verified) */}
      {submission.faculty_notes && (
        <div className={`rounded-xl p-5 flex items-start gap-3 ${submission.status === "rejected" ? "bg-red-50 border border-red-100" : "bg-emerald-50 border border-emerald-100"}`}>
          {submission.status === "rejected"
            ? <FiXCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            : <FiCheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-semibold ${submission.status === "rejected" ? "text-red-800" : "text-emerald-800"}`}>
              Reviewer Notes
            </p>
            <p className={`text-xs mt-1 ${submission.status === "rejected" ? "text-red-700" : "text-emerald-700"}`}>"{submission.faculty_notes}"</p>
          </div>
        </div>
      )}

      {submission.scanned_copy_url && (
        <a
          href={submission.scanned_copy_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
        >
          <FiExternalLink size={12} /> View Scanned Copy
        </a>
      )}

      {/* Student table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Student Attendance ({students.length})</h2>
        </div>
        {students.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No enrolled students.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((s, i) => {
                const isAbsent = s.attendance_percentage === 0;
                return (
                  <tr key={s.username} className={`hover:bg-gray-50/50 ${isAbsent ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{s.username}</td>
                    <td className="px-5 py-3 text-right">
                      {isAbsent
                        ? <span className="text-[11px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Absent</span>
                        : <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Present</span>
                      }
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
