"use client";
import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiRefreshCw, FiFilter, FiChevronLeft, FiChevronRight, FiUsers } from "react-icons/fi";

const BRAND = "rgb(151,0,3)";

interface Student {
    username: string;
    name: string;
    email: string;
    year: string;
    branch: string;
    phoneNumber: string;
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
                setPagination(d.pagination ?? { page: 1, limit: 50, total: 0, pages: 0 });
            }
        } catch {} finally { setLoading(false); }
    }, [search, yearFilter, clubFilter]);

    useEffect(() => { fetchClubs(); }, []);
    useEffect(() => { fetchStudents(1); }, [fetchStudents]);

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
                    <button onClick={() => fetchStudents(pagination.page)} disabled={loading} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                        <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
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
                                    {["ID","Name","Year","Branch","Club","Phone","Joined"].map(h => (
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
        </div>
    );
}
