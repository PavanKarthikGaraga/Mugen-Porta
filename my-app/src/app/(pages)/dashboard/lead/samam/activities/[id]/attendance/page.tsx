"use client";
import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiSave, FiAlertCircle, FiDownload, FiSend, FiClock, FiXCircle, FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const statusMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: "Pending Faculty Review", color: "#D97706", icon: <FiClock   size={14} /> },
  verified: { label: "Verified by Faculty",    color: "#059669", icon: <FiCheck   size={14} /> },
  rejected: { label: "Rejected by Faculty",    color: "#DC2626", icon: <FiXCircle size={14} /> },
};

export default function ActivityAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading,          setLoading         ] = useState(true);
  const [students,         setStudents        ] = useState<any[]>([]);
  const [presents,         setPresents        ] = useState<Set<string>>(new Set());
  const [verifyMode,       setVerifyMode      ] = useState(false);
  const [searchQuery,      setSearchQuery     ] = useState("");
  const [sortOrder,        setSortOrder       ] = useState<'asc' | 'desc'>('asc');
  const [saving,           setSaving          ] = useState(false);
  const [exporting,        setExporting       ] = useState(false);
  const [submitting,       setSubmitting      ] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [submission,       setSubmission      ] = useState<any>(null);
  const [activityInfo,     setActivityInfo    ] = useState<{ code: string; title: string }>({ code: id, title: id });

  useEffect(() => {
    Promise.all([
      fetch(`/api/dashboard/lead/samam/activities/${id}/attendance`).then(r => r.json()),
      fetch(`/api/dashboard/lead/samam/activities/${id}/attendance/submit`).then(r => r.json()),
    ]).then(([d, s]) => {
      if (d.success) {
        setStudents(d.students);
        if (d.activity) setActivityInfo(d.activity);
        if (d.students.length > 0 && d.students.some((s: any) => s.attendance_marked)) {
          setAttendanceMarked(true);
          setPresents(new Set(
            d.students.filter((s: any) => s.attendance_percentage === 100).map((s: any) => s.username)
          ));
        }
      } else {
        toast.error("Failed to load students");
      }
      setSubmission(s.submission ?? null);
      setLoading(false);
    }).catch(() => {
      toast.error("Error connecting to server");
      setLoading(false);
    });
  }, [id]);

  const handleExportExcel = async () => {
    if (students.length === 0) { toast.error("No enrolled students to export"); return; }
    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Attendance");
      sheet.columns = [{ width: 20 }, { width: 32 }, { width: 16 }];

      sheet.mergeCells("A1:C1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = `${activityInfo.title} (${activityInfo.code})`;
      titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
      sheet.getRow(1).height = 30;

      const headerRow = sheet.addRow(["Student ID", "Student Name", "Status (P/A)"]);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FF111827" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
        cell.border = { top: { style: "thin", color: { argb: "FFD1D5DB" } }, bottom: { style: "thin", color: { argb: "FFD1D5DB" } }, left: { style: "thin", color: { argb: "FFD1D5DB" } }, right: { style: "thin", color: { argb: "FFD1D5DB" } } };
      });
      headerRow.height = 20;

      students.forEach((s) => {
        const isPresent = attendanceMarked ? s.attendance_percentage === 100 : presents.has(s.username);
        const row = sheet.addRow([s.username, s.name, isPresent ? "P" : "A"]);
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "left" };
        const sc = row.getCell(3);
        sc.alignment = { horizontal: "center", vertical: "middle" };
        sc.font = { bold: true, color: { argb: "FFFFFFFF" } };
        sc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: !isPresent ? "FFDC2626" : "FF16A34A" } };
        row.eachCell((cell) => { cell.border = { top: { style: "thin", color: { argb: "FFE5E7EB" } }, bottom: { style: "thin", color: { argb: "FFE5E7EB" } }, left: { style: "thin", color: { argb: "FFE5E7EB" } }, right: { style: "thin", color: { argb: "FFE5E7EB" } } }; });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${activityInfo.code}_Attendance.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success("Attendance sheet exported");
    } catch {
      toast.error("Failed to export attendance sheet");
    } finally {
      setExporting(false);
    }
  };

  const togglePresent = (username: string) => {
    if (attendanceMarked) return;
    const s = new Set(presents);
    s.has(username) ? s.delete(username) : s.add(username);
    setPresents(s);
  };

  const handleSave = async () => {
    if (!confirm("Save attendance? This action cannot be altered later.")) return;
    setSaving(true);
    try {
      const absenteesArray = students.filter(s => !presents.has(s.username)).map(s => s.username);
      const res = await fetch(`/api/dashboard/lead/samam/activities/${id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absentees: absenteesArray }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Attendance saved successfully. Submitted for verification.");
        setAttendanceMarked(true);
        setVerifyMode(false);
        setSubmission({ status: "pending" });
      } else {
        toast.error(data.error || "Failed to save attendance");
      }
    } catch {
      toast.error("Error saving attendance");
    }
    setSaving(false);
  };

  const handleSubmitForVerification = async () => {
    if (!confirm("Submit this attendance for faculty verification?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/dashboard/lead/samam/activities/${id}/attendance/submit`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Submitted for faculty verification");
        setSubmission({ status: "pending" });
      } else {
        toast.error(data.error || "Failed to submit");
      }
    } catch {
      toast.error("Error submitting for verification");
    }
    setSubmitting(false);
  };

  const filteredStudents = useMemo(() => {
    let list = verifyMode ? students.filter(s => !presents.has(s.username)) : students;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.username.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      if (sortOrder === 'asc') return a.username.localeCompare(b.username);
      return b.username.localeCompare(a.username);
    });
  }, [students, presents, verifyMode, searchQuery, sortOrder]);

  const handleSelectAll = () => {
    if (attendanceMarked) return;
    const allFilteredPresent = filteredStudents.length > 0 && filteredStudents.every(s => presents.has(s.username));
    const newPresents = new Set(presents);
    if (allFilteredPresent) {
      filteredStudents.forEach(s => newPresents.delete(s.username));
    } else {
      filteredStudents.forEach(s => newPresents.add(s.username));
    }
    setPresents(newPresents);
  };

  const presentCount = students.filter(s => attendanceMarked ? s.attendance_percentage === 100 : presents.has(s.username)).length;
  const absentCount  = students.length - presentCount;
  const subMeta = submission ? statusMeta[submission.status] : null;

  if (loading) return <div className="p-12 text-center text-gray-500">Loading enrolled students...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 -mx-6 -mt-6 mb-5" style={{ backgroundColor: BRAND }} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/lead/samam/activities" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <FiArrowLeft />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{activityInfo.title || id}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{attendanceMarked ? "Attendance locked" : "Mark absent students below"}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exporting || students.length === 0}
              className="px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
            >
              <FiDownload size={13} /> {exporting ? "Exporting…" : "Export XLSX"}
            </button>
            {attendanceMarked && !submission && (
              <button
                onClick={handleSubmitForVerification}
                disabled={submitting}
                className="px-3 py-2 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 disabled:opacity-60"
                style={{ backgroundColor: BRAND }}
              >
                <FiSend size={13} /> {submitting ? "Submitting…" : "Submit for Verification"}
              </button>
            )}
            {attendanceMarked && !submission && (
              <span className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <FiCheck size={13} /> Attendance Locked
              </span>
            )}
          </div>
        </div>

        {/* Submission status banner */}
        {submission && subMeta && (
          <div
            className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ backgroundColor: `${subMeta.color}15`, color: subMeta.color }}
          >
            {subMeta.icon}
            {subMeta.label}
            {submission.faculty_notes && (
              <span className="ml-2 text-gray-600 font-normal">— &quot;{submission.faculty_notes}&quot;</span>
            )}
            {submission.status === 'rejected' && (
              <button
                onClick={handleSubmitForVerification}
                disabled={submitting}
                className="ml-auto px-3 py-1 text-xs font-semibold text-white rounded-md disabled:opacity-60"
                style={{ backgroundColor: BRAND }}
              >
                Re-submit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary pills */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: students.length, color: "#6B7280" },
            { label: "Present", value: presentCount, color: "#059669" },
            { label: "Absent",  value: absentCount,  color: "#DC2626" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Student table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-700">
              {verifyMode ? "Verifying Absentees" : "All Enrolled Students"} ({filteredStudents.length})
            </h2>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs outline-none bg-transparent w-24 sm:w-32"
              />
            </div>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
            </button>
          </div>
          {!attendanceMarked && (
            <div className="flex gap-2">
              <button 
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-xs text-gray-600 bg-white border rounded hover:bg-gray-50 font-medium"
              >
                {filteredStudents.length > 0 && filteredStudents.every(s => presents.has(s.username)) ? "Deselect All" : "Select All"}
              </button>
              {verifyMode ? (
                <>
                  <button onClick={() => setVerifyMode(false)} className="px-3 py-1.5 text-xs text-gray-600 bg-white border rounded hover:bg-gray-50">
                    Back to All
                  </button>
                  <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-xs text-white rounded hover:opacity-90 flex items-center gap-1.5 disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                    {saving ? "Saving..." : <><FiSave size={12} /> Save Final Attendance</>}
                  </button>
                </>
              ) : (
                <button onClick={() => setVerifyMode(true)} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1.5">
                  Verify Absentees <FiArrowLeft className="rotate-180" size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No students enrolled in this activity.</div>
        ) : filteredStudents.length === 0 && verifyMode ? (
          <div className="p-12 text-center text-emerald-600 font-medium flex flex-col items-center gap-3">
            <FiCheck size={32} />
            <p>100% Attendance — no absentees.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No students match your search.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider border-b">
                {!attendanceMarked && (
                  <th className="p-4 font-semibold w-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer disabled:opacity-50"
                        checked={filteredStudents.length > 0 && filteredStudents.every(s => presents.has(s.username))}
                        onChange={handleSelectAll}
                        title="Select/Deselect All"
                      />
                      <span>Present</span>
                    </div>
                  </th>
                )}
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((s) => {
                const isPresent = attendanceMarked ? s.attendance_percentage === 100 : presents.has(s.username);
                return (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${!isPresent ? 'bg-red-50/20' : ''}`}>
                    {!attendanceMarked && (
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          checked={isPresent}
                          onChange={() => togglePresent(s.username)}
                        />
                      </td>
                    )}
                    <td className="p-4 font-medium text-gray-900">{s.name}</td>
                    <td className="p-4 text-gray-400 text-xs font-mono">{s.username}</td>
                    <td className="p-4 text-right">
                      {!isPresent
                        ? <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Absent</span>
                        : <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Present</span>
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

      {!attendanceMarked && (
        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-800 items-start">
          <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
          <p>All students are marked <em>Absent</em> by default. Check boxes to mark students as <strong>Present</strong>. Once saved, attendance is permanently locked and automatically sent for faculty verification.</p>
        </div>
      )}
    </div>
  );
}
