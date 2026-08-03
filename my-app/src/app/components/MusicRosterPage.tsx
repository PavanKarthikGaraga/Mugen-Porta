"use client";
import { useState, useEffect, useCallback } from "react";
import { FiMusic, FiUsers, FiDownload, FiSearch, FiRefreshCw, FiMic, FiSliders } from "react-icons/fi";

interface Student {
    username: string;
    name: string;
    branch: string;
    year: string;
    gender: string;
    submitted: boolean;
    preferenceType: "vocals" | "instruments" | null;
    instrument: string | null;
    otherInstrument: string | null;
    submittedAt: string | null;
}

interface Stats {
    total: number;
    submitted: number;
    notSubmitted: number;
    vocalsCount: number;
    instrumentsCount: number;
    instrumentBreakdown: Record<string, number>;
}

const INSTRUMENT_COLORS: Record<string, string> = {
    Keyboard: "#e74c3c",
    Guitar:   "#e67e22",
    Violin:   "#9b59b6",
    Drums:    "#3498db",
    Veena:    "#1abc9c",
    Other:    "#95a5a6",
};

function getColor(name: string) {
    return INSTRUMENT_COLORS[name] || "#95a5a6";
}

function instrumentLabel(s: Student) {
    if (s.preferenceType === "vocals") return "—";
    if (!s.instrument) return "—";
    if (s.instrument === "other") return s.otherInstrument || "Other";
    return s.instrument;
}

export default function MusicRosterPage() {
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState<string | null>(null);
    const [students, setStudents]   = useState<Student[]>([]);
    const [stats, setStats]         = useState<Stats | null>(null);
    const [search, setSearch]       = useState("");
    const [filterType, setFilterType] = useState<"all" | "vocals" | "instruments" | "pending">("all");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/dashboard/music-roster");
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to load roster"); return; }
            setStudents(data.students || []);
            setStats(data.stats || null);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── CSV Export ─────────────────────────────────────────────────────────────
    const exportCSV = () => {
        const header = ["Roll No", "Name", "Branch", "Year", "Preference", "Instrument", "Submitted At"];
        const rows = students.map((s) => [
            s.username,
            s.name,
            s.branch,
            s.year,
            s.preferenceType ?? "Not submitted",
            s.preferenceType === "instruments" ? instrumentLabel(s) : "",
            s.submittedAt ? new Date(s.submittedAt).toLocaleString("en-IN") : "",
        ]);
        const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `music_club_roster_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    // ── Filtered list ──────────────────────────────────────────────────────────
    const filtered = students.filter((s) => {
        const q = search.toLowerCase();
        const matchSearch = !q || s.name.toLowerCase().includes(q) || s.username.includes(q) || s.branch.toLowerCase().includes(q);
        const matchFilter =
            filterType === "all" ? true :
            filterType === "vocals" ? s.preferenceType === "vocals" :
            filterType === "instruments" ? s.preferenceType === "instruments" :
            !s.submitted;
        return matchSearch && matchFilter;
    });

    // ── States ─────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgb(151,0,3)", borderTopColor: "transparent" }} />
                <p className="text-gray-500 text-sm">Loading Music Roster…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-lg mx-auto mt-20 text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                <FiMusic className="mx-auto text-red-300 mb-3" size={40} />
                <p className="font-semibold text-red-700 mb-1">Access Error</p>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: "rgb(151,0,3)" }}>
                        <FiMusic className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Music Club Roster</h1>
                        <p className="text-gray-500 text-sm">LCH03 — Instrument & Vocal Preferences</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={load}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                    >
                        <FiRefreshCw size={14} /> Refresh
                    </button>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg transition-colors"
                        style={{ backgroundColor: "rgb(151,0,3)" }}
                    >
                        <FiDownload size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total Students", value: stats.total,        icon: FiUsers,   color: "#1a1a1a" },
                        { label: "Vocals",          value: stats.vocalsCount,  icon: FiMic,     color: "#e74c3c" },
                        { label: "Instruments",     value: stats.instrumentsCount, icon: FiSliders, color: "#e67e22" },
                        { label: "Not Submitted",   value: stats.notSubmitted, icon: FiRefreshCw, color: "#95a5a6" },
                    ].map((card) => (
                        <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <card.icon size={16} style={{ color: card.color }} />
                                <span className="text-xs text-gray-500 font-medium">{card.label}</span>
                            </div>
                            <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {stats.total > 0 ? `${Math.round((card.value / stats.total) * 100)}%` : "0%"} of total
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Instrument breakdown */}
            {stats && Object.keys(stats.instrumentBreakdown).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Instrument Breakdown</h2>
                    <div className="space-y-3">
                        {Object.entries(stats.instrumentBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([name, count]) => (
                                <div key={name} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 w-28 truncate font-medium">{name}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.round((count / stats.instrumentsCount) * 100)}%`,
                                                backgroundColor: getColor(name),
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 w-6 text-right">{count}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Submission progress bar */}
            {stats && stats.total > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">Submission Progress</span>
                        <span className="text-sm font-bold" style={{ color: "rgb(151,0,3)" }}>
                            {stats.submitted}/{stats.total} submitted
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${Math.round((stats.submitted / stats.total) * 100)}%`,
                                backgroundColor: "rgb(151,0,3)",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, roll number or branch…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["all", "vocals", "instruments", "pending"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterType(f)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                filterType === f
                                    ? "text-white border-transparent"
                                    : "text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                            style={filterType === f ? { backgroundColor: "rgb(151,0,3)" } : {}}
                        >
                            {f === "all" ? "All" : f === "vocals" ? "🎤 Vocals" : f === "instruments" ? "🎸 Instruments" : "⏳ Pending"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Student Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100" style={{ backgroundColor: "#f9f9f9" }}>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Roll No</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Name</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Branch</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Year</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Preference</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Instrument</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs">Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                        No students found
                                    </td>
                                </tr>
                            ) : filtered.map((s, i) => (
                                <tr
                                    key={s.username}
                                    className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                                >
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.username}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{s.branch}</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{s.year}</td>
                                    <td className="px-4 py-3">
                                        {!s.submitted ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Pending</span>
                                        ) : s.preferenceType === "vocals" ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-pink-100 text-pink-700">🎤 Vocals</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">🎸 Instruments</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{instrumentLabel(s)}</td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-IN") : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        Showing {filtered.length} of {students.length} students
                    </div>
                )}
            </div>
        </div>
    );
}
