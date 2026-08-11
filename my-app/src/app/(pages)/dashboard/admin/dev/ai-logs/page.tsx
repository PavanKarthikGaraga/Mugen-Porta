"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiCpu, FiSearch, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";

const API = "/api/dashboard/admin/dev/ai-logs";

type StudentRow = {
    username: string;
    name: string;
    branch: string;
    dashboardTokens: number;
    roadmapTokens: number;
    totalCalls: number;
    lastUsed: string;
};

export default function AiLogsPage() {
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [totals, setTotals] = useState<{ totalDashboardTokens: number; totalRoadmapTokens: number; studentsUsed: number } | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const checkAccess = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) { setHasAccess(false); router.push('/dashboard/admin'); return; }
            const data = await res.json();
            const envUsers = process.env.NEXT_PUBLIC_DEV_USERNAME ? process.env.NEXT_PUBLIC_DEV_USERNAME.split(',') : [];
            const defaultUsers = ['2300032048', '2400030188', '240030188'];
            const devUsernames = [...new Set([...envUsers, ...defaultUsers])].map((u) => u.trim());
            const devOk = devUsernames.includes(data.user.username);
            setHasAccess(devOk);
            if (!devOk) router.push('/dashboard/admin');
        } catch {
            setHasAccess(false);
            router.push('/dashboard/admin');
        }
    }, [router]);

    const fetchLogs = useCallback(async (q: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}?search=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || data.error || "Failed to load AI logs");
                return;
            }
            setStudents(data.students || []);
            setTotals(data.totals || null);
        } catch {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { checkAccess(); }, [checkAccess]);
    useEffect(() => { if (hasAccess) fetchLogs(""); }, [hasAccess, fetchLogs]);

    if (hasAccess === null) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3">
                <FiCpu size={20} className="text-gray-700" />
                <h1 className="text-[17px] font-semibold text-gray-900">AI Logs</h1>
            </div>
            <p className="text-[13px] text-gray-500 -mt-4">
                Token usage per student across Career Dashboard (role matches + role fit) and Career Roadmap AI analysis.
            </p>

            {totals && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
                        <p className="text-lg font-semibold text-gray-900">{totals.studentsUsed}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Students using AI</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
                        <p className="text-lg font-semibold text-gray-900">{totals.totalDashboardTokens.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Career Dashboard tokens</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
                        <p className="text-lg font-semibold text-gray-900">{totals.totalRoadmapTokens.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Career Roadmap tokens</p>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") fetchLogs(search); }}
                    placeholder="Search by name or ID number"
                    className="flex-1 h-10 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                />
                <button
                    onClick={() => fetchLogs(search)}
                    disabled={loading}
                    className="h-10 px-4 rounded-md text-[13px] font-medium text-white flex items-center gap-2 disabled:opacity-50"
                    style={{ background: "#111827" }}
                >
                    {loading ? <FiRefreshCw size={14} className="animate-spin" /> : <FiSearch size={14} />}
                    Search
                </button>
            </div>

            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-5 text-center text-gray-500 text-[13px]">Loading...</div>
                ) : students.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 text-[13px]">No AI usage logged yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px] text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-gray-600">Student</th>
                                    <th className="px-5 py-3 font-semibold text-gray-600">Branch</th>
                                    <th className="px-5 py-3 font-semibold text-gray-600 text-right">Career Dashboard Tokens</th>
                                    <th className="px-5 py-3 font-semibold text-gray-600 text-right">Career Roadmap Tokens</th>
                                    <th className="px-5 py-3 font-semibold text-gray-600 text-right">Calls</th>
                                    <th className="px-5 py-3 font-semibold text-gray-600">Last Used</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((s) => (
                                    <tr key={s.username} className="hover:bg-gray-50/50">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-900">{s.name}</p>
                                            <p className="text-[11px] text-gray-500">{s.username}</p>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{s.branch}</td>
                                        <td className="px-5 py-3 text-right font-medium text-gray-900">{Number(s.dashboardTokens).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right font-medium text-gray-900">{Number(s.roadmapTokens).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right text-gray-500">{s.totalCalls}</td>
                                        <td className="px-5 py-3 text-gray-500 text-[12px]">
                                            {s.lastUsed ? new Date(s.lastUsed).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
