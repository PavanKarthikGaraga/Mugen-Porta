"use client";
import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiRefreshCw, FiFilter, FiChevronLeft, FiChevronRight, FiUsers, FiEye, FiDownload, FiX } from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

interface Student {
    username: string;
    name: string;
    email: string;
    gender?: string;
    year: string;
    branch: string;
    phoneNumber: string;
    residenceType?: string;
    hostelName?: string;
    busRoute?: string;
    clubId: string;
    clubName: string;
    created_at: string;
}

interface Club { id: string; name: string }

function Skeleton() {
    return (
        <div className="space-y-5 max-w-5xl mx-auto animate-pulse">
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="h-14 bg-gray-100 rounded-xl" />
            <div className="space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl"/>)}</div>
        </div>
    );
}

export default function CouncilStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [clubs, setClubs]       = useState<Club[]>([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState("");
    const [yearFilter, setYearFilter]   = useState("");
    const [clubFilter, setClubFilter]   = useState("");
    const [pagination, setPagination]   = useState({ page: 1, limit: 50, total: 0, pages: 0 });
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [downloading, setDownloading] = useState(false);

    const fetchClubs = async () => {
        try {
            const r = await fetch('/api/dashboard/council/clubs');
            if (r.ok) { const d = await r.json(); setClubs(d.clubs ?? []); }
        } catch {}
    };

    const fetchStudents = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "50" });
            if (search)     params.set("search", search);
            if (yearFilter) params.set("year",   yearFilter);
            if (clubFilter) params.set("clubId", clubFilter);
            const r = await fetch(`/api/dashboard/council/students?${params}`);
            if (r.ok) {
                const d = await r.json();
                setStudents(d.students ?? []);
                setPagination({ page: d.page ?? 1, limit: 50, total: d.total ?? 0, pages: d.pages ?? 0 });
            }
        } catch {} finally { setLoading(false); }
    }, [search, yearFilter, clubFilter]);

    useEffect(() => { fetchClubs(); }, []);
    useEffect(() => { fetchStudents(1); }, [fetchStudents]);

    const downloadExcel = async () => {
        setDownloading(true);
        try {
            const params = new URLSearchParams({ all: "true" });
            if (search)     params.set("search", search);
            if (yearFilter) params.set("year",   yearFilter);
            if (clubFilter) params.set("clubId", clubFilter);
            const r = await fetch(`/api/dashboard/council/students?${params}`);
            if (!r.ok) throw new Error("Failed to fetch students");
            const d = await r.json();
            const allStudents: Student[] = d.students ?? [];
            if (allStudents.length === 0) { toast.error("No students to export"); return; }

            const ExcelJS = (await import("exceljs")).default;
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet("Students");
            ws.columns = [
                { header: "S.No", key: "sno", width: 8 },
                { header: "Username", key: "username", width: 16 },
                { header: "Name", key: "name", width: 26 },
                { header: "Email", key: "email", width: 30 },
                { header: "Phone", key: "phone", width: 14 },
                { header: "Year", key: "year", width: 8 },
                { header: "Branch", key: "branch", width: 14 },
                { header: "Club", key: "club", width: 24 },
                { header: "Residence Type", key: "residenceType", width: 16 },
                { header: "Hostel/Bus Route", key: "residenceDetail", width: 20 },
            ];

            const headerRow = ws.getRow(1);
            headerRow.eachCell(cell => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
            });
            headerRow.height = 22;
            ws.views = [{ state: "frozen", ySplit: 1 }];
            ws.autoFilter = { from: "A1", to: "J1" };

            allStudents.forEach((s, i) => {
                const row = ws.addRow({
                    sno: i + 1,
                    username: s.username,
                    name: s.name,
                    email: s.email || "N/A",
                    phone: s.phoneNumber || "N/A",
                    year: s.year,
                    branch: s.branch || "N/A",
                    club: s.clubName || "N/A",
                    residenceType: s.residenceType || "N/A",
                    residenceDetail: s.residenceType === "Hostel" ? (s.hostelName || "N/A") : (s.busRoute || "N/A"),
                });
                if (i % 2 === 1) {
                    row.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } }; });
                }
            });

            const buf = await wb.xlsx.writeBuffer();
            const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `students_${new Date().toISOString().split("T")[0]}.xlsx`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
            toast.success(`Downloaded ${allStudents.length} students successfully!`);
        } catch {
            toast.error("Error downloading file");
        } finally {
            setDownloading(false);
        }
    };

    if (loading && students.length === 0) return <Skeleton />;

    return (
        <div className="space-y-5 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1" style={{ backgroundColor: BRAND }} />
                <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Students</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{pagination.total} students across your domain clubs</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={downloadExcel} disabled={downloading} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-60">
                            <FiDownload size={13} /> {downloading ? "Exporting…" : "Export XLSX"}
                        </button>
                        <button onClick={() => fetchStudents(pagination.page)} disabled={loading} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-48 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <FiSearch size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, branch…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="text-xs flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                    />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <FiFilter size={12} className="text-gray-400" />
                    <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="text-xs bg-transparent outline-none text-gray-700">
                        <option value="">All Years</option>
                        {["1st","2nd","3rd","4th"].map(y => <option key={y} value={y}>{y} Year</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <FiUsers size={12} className="text-gray-400" />
                    <select value={clubFilter} onChange={e => setClubFilter(e.target.value)} className="text-xs bg-transparent outline-none text-gray-700">
                        <option value="">All Clubs</option>
                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            {students.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <FiUsers size={36} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">No students found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {["ID","Name","Year","Branch","Club","Phone","Joined","Actions"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map(s => (
                                    <tr key={s.username} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-gray-700">{s.username}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.year}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.branch}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.clubName}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.phoneNumber || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{s.created_at ? new Date(s.created_at).toLocaleDateString("en-IN") : '—'}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedStudent(s)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors whitespace-nowrap"
                                            >
                                                <FiEye size={12} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
                            <div className="flex gap-2">
                                <button onClick={() => fetchStudents(pagination.page - 1)} disabled={pagination.page <= 1 || loading} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                                    <FiChevronLeft size={14} />
                                </button>
                                <button onClick={() => fetchStudents(pagination.page + 1)} disabled={pagination.page >= pagination.pages || loading} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                                    <FiChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* View Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Student Details</h3>
                            <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900">{selectedStudent.name}</dd></div>
                                        <div className="flex justify-between"><dt className="text-gray-500">Username</dt><dd className="font-medium text-gray-900">{selectedStudent.username}</dd></div>
                                        <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-900">{selectedStudent.email || 'N/A'}</dd></div>
                                        <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900">{selectedStudent.phoneNumber || 'N/A'}</dd></div>
                                        <div className="flex justify-between"><dt className="text-gray-500">Gender</dt><dd className="font-medium text-gray-900">{selectedStudent.gender || 'N/A'}</dd></div>
                                    </dl>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic & Club</h4>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between"><dt className="text-gray-500">Year</dt><dd className="font-medium text-gray-900">{selectedStudent.year} Year</dd></div>
                                        <div className="flex justify-between"><dt className="text-gray-500">Branch</dt><dd className="font-medium text-gray-900">{selectedStudent.branch || 'N/A'}</dd></div>
                                        <div className="flex justify-between"><dt className="text-gray-500">Club</dt><dd className="font-medium text-gray-900">{selectedStudent.clubName || 'N/A'}</dd></div>
                                        <div className="flex justify-between"><dt className="text-gray-500">Joined</dt><dd className="font-medium text-gray-900">{selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString("en-IN") : 'N/A'}</dd></div>
                                    </dl>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 md:col-span-2">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Residence</h4>
                                    <dl className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between"><dt className="text-gray-500">Residence Type</dt><dd className="font-medium text-gray-900">{selectedStudent.residenceType || 'N/A'}</dd></div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">{selectedStudent.residenceType === 'Hostel' ? 'Hostel Name' : 'Bus Route'}</dt>
                                            <dd className="font-medium text-gray-900">
                                                {selectedStudent.residenceType === 'Hostel' ? (selectedStudent.hostelName || 'N/A') : (selectedStudent.busRoute || 'N/A')}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-xl">
                            <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
