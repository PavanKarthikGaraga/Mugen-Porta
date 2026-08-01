"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FiUsers, FiRefreshCw, FiChevronRight, FiTrendingUp,
    FiCpu, FiPenTool, FiGlobe, FiZap, FiHeart, FiFilter,
} from "react-icons/fi";
import StatCard from "@/app/components/dashboard/StatCard";

const BRAND = "rgb(151,0,3)";

const yearOrder  = ["1st", "2nd", "3rd", "4th"];
const yearColors = ["#B45309", "#059669", "#2563EB", "#DC2626"];
const yearLabels: Record<string, string> = {
    "1st": "1st Year", "2nd": "2nd Year", "3rd": "3rd Year", "4th": "4th Year",
};

const DOMAIN_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    TEC: { label: "Technology (TEC)",                     color: "#2563EB", icon: <FiCpu     size={13} /> },
    LCH: { label: "Liberal Arts (LCH)",                   color: "#7C3AED", icon: <FiPenTool size={13} /> },
    ESO: { label: "Extension & Outreach (ESO)",           color: "#D97706", icon: <FiGlobe   size={13} /> },
    IIE: { label: "Innovation & Entrepreneurship (IIE)",  color: "#059669", icon: <FiZap     size={13} /> },
    HWB: { label: "Health & Well-being (HWB)",            color: "#E11D48", icon: <FiHeart   size={13} /> },
};

interface Club { id: string; name: string }

function Skeleton() {
    return (
        <div className="space-y-5 max-w-5xl mx-auto animate-pulse">
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">{[1,2].map(i=><div key={i} className="h-28 bg-gray-100 rounded-xl"/>)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{[1,2].map(i=><div key={i} className="h-56 bg-gray-100 rounded-xl"/>)}</div>
        </div>
    );
}

export default function CouncilOverviewPage() {
    const [stats, setStats] = useState({ totalStudents: 0, recentRegistrations: 0, yearWiseCount: {} as Record<string, number>, domainWiseCount: {} as Record<string, number>, domain: '' });
    const [loading, setLoading] = useState(true);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [selectedClub, setSelectedClub] = useState("");

    useEffect(() => {
        fetchClubs();
        fetchStats("");
    }, []);

    const fetchClubs = async () => {
        try {
            const r = await fetch('/api/dashboard/council/clubs');
            if (r.ok) { const d = await r.json(); setClubs(d.clubs ?? []); }
        } catch {}
    };

    const fetchStats = async (clubId: string) => {
        setLoading(true);
        try {
            const url = clubId ? `/api/dashboard/council/stats?clubId=${clubId}` : '/api/dashboard/council/stats';
            const r = await fetch(url);
            if (r.ok) { const d = await r.json(); setStats(d); }
        } catch {} finally { setLoading(false); }
    };

    const handleClubChange = (clubId: string) => { setSelectedClub(clubId); fetchStats(clubId); };

    if (loading && stats.totalStudents === 0) return <Skeleton />;

    const domainInfo = DOMAIN_META[stats.domain] || { label: stats.domain, color: BRAND, icon: null };

    return (
        <div className="space-y-5 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1" style={{ backgroundColor: BRAND }} />
                <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Council Overview</h1>
                        {stats.domain && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: domainInfo.color }}>
                                    {domainInfo.label}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <FiFilter size={12} className="text-gray-400" />
                            <select value={selectedClub} onChange={e => handleClubChange(e.target.value)} className="text-xs bg-transparent outline-none text-gray-700 pr-4">
                                <option value="">All Clubs</option>
                                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <button onClick={() => fetchStats(selectedClub)} disabled={loading} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard label="Total Students" value={stats.totalStudents} icon={<FiUsers size={20} />} accent={BRAND} />
                <StatCard label="New (30 days)"  value={stats.recentRegistrations} icon={<FiTrendingUp size={20} />} accent="#059669" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><FiUsers size={14} className="text-gray-400"/> Year-wise Breakdown</h3>
                    <div className="space-y-3">
                        {yearOrder.map((yr, i) => {
                            const count = stats.yearWiseCount[yr] || 0;
                            const pct = stats.totalStudents > 0 ? Math.round((count / stats.totalStudents) * 100) : 0;
                            return (
                                <div key={yr}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-600">{yearLabels[yr]}</span>
                                        <span className="font-semibold" style={{ color: yearColors[i] }}>{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: yearColors[i] }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Links</h3>
                    <div className="space-y-2">
                        {[
                            { label: "View All Students",          href: "/dashboard/council/students" },
                            { label: "Attendance Records",         href: "/dashboard/council/attendance-records" },
                            { label: "Passport Approvals",         href: "/dashboard/council/passport-approvals" },
                        ].map(l => (
                            <Link key={l.href} href={l.href} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group">
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{l.label}</span>
                                <FiChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
