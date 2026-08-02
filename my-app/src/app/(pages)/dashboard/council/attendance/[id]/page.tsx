"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FiArrowLeft, FiDownload, FiUpload, FiCheckCircle, FiXCircle,
  FiExternalLink, FiAlertCircle, FiCheck, FiClock,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending Review",     color: "#D97706", bg: "#FFFBEB" },
  verified: { label: "Verified",           color: "#059669", bg: "#F0FDF4" },
  rejected: { label: "Rejected",           color: "#DC2626", bg: "#FEF2F2" },
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

export default function CouncilAttendanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [loading,      setLoading    ] = useState(true);
  const [submission,   setSubmission ] = useState<any>(null);
  const [students,     setStudents   ] = useState<any[]>([]);
  const [uploading,    setUploading  ] = useState(false);
  const [verifying,    setVerifying  ] = useState(false);
  const [scannedUrl,   setScannedUrl ] = useState("");
  const [notes,        setNotes      ] = useState("");
  const [exporting,    setExporting  ] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/council/attendance/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.submission) {
          setSubmission(d.submission);
          setStudents(d.students ?? []);
          setScannedUrl(d.submission.scanned_copy_url ?? "");
          setNotes(d.submission.faculty_notes ?? "");
        } else {
          toast.error(d.error ?? "Failed to load submission");
        }
        setLoading(false);
      })
      .catch(() => { toast.error("Error connecting to server"); setLoading(false); });
  }, [id]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    const MAX = 10 * 1024 * 1024;
    if (file.size > MAX) { toast.error("File must be under 10 MB"); return; }
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Only PDF, JPG, PNG, or WEBP allowed"); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setScannedUrl(data.url);
        toast.success("Scanned copy uploaded");
      } else {
        toast.error(data.error ?? "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (status: "verified" | "rejected") => {
    if (status === "verified" && !scannedUrl) {
      toast.error("Upload a scanned copy before verifying");
      return;
    }
    if (!confirm(`${status === "verified" ? "Verify" : "Reject"} this attendance submission?`)) return;

    setVerifying(true);
    try {
      const res = await fetch(`/api/dashboard/council/attendance/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, scannedCopyUrl: scannedUrl, notes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSubmission((prev: any) => ({ ...prev, status, scanned_copy_url: scannedUrl, faculty_notes: notes }));
      } else {
        toast.error(data.error ?? "Failed to update");
      }
    } catch {
      toast.error("Error verifying attendance");
    } finally {
      setVerifying(false);
    }
  };

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
        c.border = { top: { style: "thin", color: { argb: "FFD1D5DB" } }, bottom: { style: "thin", color: { argb: "FFD1D5DB" } }, left: { style: "thin", color: { argb: "FFD1D5DB" } }, right: { style: "thin", color: { argb: "FFD1D5DB" } } };
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
      <Link href="/dashboard/council/attendance" className="text-xs text-blue-600 hover:underline mt-2 inline-block">← Back to list</Link>
    </div>
  );

  const meta = statusMeta[submission.status];
  const presentCount = students.filter(s => s.attendance_percentage === 100).length;
  const absentCount  = students.length - presentCount;
  const presentPct   = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;
  const isLocked     = submission.status === "verified";

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ backgroundColor: BRAND }} />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/council/attendance" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
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

      {/* Scanned copy + verification */}
      {!isLocked && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Physical Attendance Sheet</h2>
          <p className="text-xs text-gray-500">Upload the signed physical attendance sheet (PDF/image) before verifying.</p>

          {scannedUrl ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
              <FiCheckCircle size={16} className="text-green-600 flex-shrink-0" />
              <span className="text-xs text-green-700 flex-1 truncate">Scanned copy uploaded</span>
              <a href={scannedUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View <FiExternalLink size={11} />
              </a>
              {!isLocked && (
                <label className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer">
                  Replace
                  <input type="file" className="hidden" accept="application/pdf,image/*" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
                </label>
              )}
            </div>
          ) : (
            <label className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? "border-gray-300 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
              <FiUpload size={20} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">{uploading ? "Uploading…" : "Upload Scanned Copy"}</span>
              <span className="text-xs text-gray-400">PDF, JPG, PNG or WEBP · Max 10 MB</span>
              <input type="file" className="hidden" accept="application/pdf,image/*" disabled={uploading} onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            </label>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Verification Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes for the lead (e.g., discrepancies found, reason for rejection…)"
              className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleVerify("verified")}
              disabled={verifying || !scannedUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#059669" }}
            >
              <FiCheck size={15} /> {verifying ? "Verifying…" : "Verify & Approve"}
            </button>
            <button
              onClick={() => handleVerify("rejected")}
              disabled={verifying}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: "#DC2626" }}
            >
              <FiXCircle size={15} /> Reject
            </button>
          </div>

          {!scannedUrl && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              <FiAlertCircle size={13} className="flex-shrink-0" />
              Upload the scanned physical sheet before you can approve.
            </div>
          )}
        </div>
      )}

      {/* Verified/rejected locked state */}
      {isLocked && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-3">
          <FiCheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Attendance Verified</p>
            {submission.faculty_notes && <p className="text-xs text-emerald-700 mt-1">"{submission.faculty_notes}"</p>}
            {submission.scanned_copy_url && (
              <a href={submission.scanned_copy_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
                <FiExternalLink size={12} /> View Scanned Copy
              </a>
            )}
          </div>
        </div>
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
