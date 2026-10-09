"use client";
import { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiTarget, FiFilter, FiActivity, FiX, FiBarChart2, FiUsers, FiMapPin, FiCalendar, FiArrowLeft, FiDownload, FiRefreshCw } from "react-icons/fi";
import { SDG_MAP } from "@/app/Data/activities-mock";
import { toast } from "sonner";
import { generateActivityReportPdf } from "@/lib/activityReportPdf";

const SAC_DOMAINS = ['TEC', 'LCH', 'ESO', 'IIE', 'HWB'];
const DEPT_DOMAIN = 'DEPT. CLUBS';
const MHS_DOMAIN = 'MHS. CLUBS';

const SDG_COLORS: Record<number, { bg: string, text: string, border: string }> = {
    1: { bg: '#e5243b', text: '#fff', border: '#c01328' }, // No Poverty
    2: { bg: '#dda63a', text: '#fff', border: '#b8892c' }, // Zero Hunger
    3: { bg: '#4c9f38', text: '#fff', border: '#3b802a' }, // Good Health
    4: { bg: '#c5192d', text: '#fff', border: '#a31122' }, // Quality Education
    5: { bg: '#ff3a21', text: '#fff', border: '#d62a15' }, // Gender Equality
    6: { bg: '#26bde2', text: '#fff', border: '#1da2c2' }, // Clean Water
    7: { bg: '#fcc30b', text: '#000', border: '#d9a606' }, // Affordable Energy
    8: { bg: '#a21942', text: '#fff', border: '#821032' }, // Decent Work
    9: { bg: '#fd6925', text: '#fff', border: '#da5319' }, // Industry
    10: { bg: '#dd1367', text: '#fff', border: '#b90d53' }, // Reduced Inequalities
    11: { bg: '#fd9d24', text: '#000', border: '#d88319' }, // Sustainable Cities
    12: { bg: '#bf8b2e', text: '#fff', border: '#9e7123' }, // Responsible Consumption
    13: { bg: '#3f7e44', text: '#fff', border: '#2f6133' }, // Climate Action
    14: { bg: '#0a97d9', text: '#fff', border: '#087db5' }, // Life Below Water
    15: { bg: '#56c02b', text: '#fff', border: '#45a020' }, // Life on Land
    16: { bg: '#00689d', text: '#fff', border: '#00507a' }, // Peace & Justice
    17: { bg: '#19486a', text: '#fff', border: '#11354f' }, // Partnerships
};

export default function SDGsMapper({ role }: { role: "admin" | "analytics" }) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "SAC" | "DEPT" | "MHS">("ALL");
    const [selectedSDG, setSelectedSDG] = useState<number | null>(null);

    // Detail View State
    const [selectedDetailCode, setSelectedDetailCode] = useState<string | null>(null);
    const [detail, setDetail] = useState<{ activity: any; students: any[]; report: any } | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetch("/api/dashboard/admin/sdgs-mapper")
            .then(res => res.json())
            .then(data => {
                if (data.activities) {
                    setActivities(data.activities);
                } else {
                    toast.error(data.error || "Failed to load");
                }
            })
            .catch(() => toast.error("Error loading activities"))
            .finally(() => setLoading(false));
    }, []);

    const isSAC = (domain: string) => SAC_DOMAINS.includes(domain);
    const isDept = (domain: string) => domain === DEPT_DOMAIN;
    const isMHS = (domain: string) => domain === MHS_DOMAIN;

    const filteredActivities = activities.filter(a => {
        if (filter === "ALL") return true;
        if (filter === "SAC") return isSAC(a.domain);
        if (filter === "DEPT") return isDept(a.domain);
        if (filter === "MHS") return isMHS(a.domain);
        return true;
    });

    const analytics = {
        total: activities.length,
        sacCount: activities.filter(a => isSAC(a.domain)).length,
        deptCount: activities.filter(a => isDept(a.domain)).length,
        mhsCount: activities.filter(a => isMHS(a.domain)).length,
    };

    const sdgCounts = new Map<number, number>();
    filteredActivities.forEach(a => {
        if (Array.isArray(a.sdgs)) {
            a.sdgs.forEach((sdg: number) => {
                sdgCounts.set(sdg, (sdgCounts.get(sdg) || 0) + 1);
            });
        }
    });

    const getSDGActivities = (sdg: number) => {
        return filteredActivities.filter(a => Array.isArray(a.sdgs) && a.sdgs.includes(sdg));
    };

    const fetchDetail = async (code: string) => {
        setSelectedDetailCode(code);
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/dashboard/admin/samam/completed-activities?activity=${encodeURIComponent(code)}`);
            const data = await res.json();
            if (res.ok) setDetail(data);
            else toast.error(data.message || "Failed to load activity details");
        } catch {
            toast.error("Failed to load activity details");
        } finally {
            setDetailLoading(false);
        }
    };

    const downloadReport = async () => {
        if (!detail?.report || !detail.activity) return;
        setDownloading(true);
        try {
            const r = detail.report;
            const formatDateStr = (d: string | null) => {
                if (!d) return "—";
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return "—";
                return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            };
            await generateActivityReportPdf({
                clubName: detail.activity.club_name || "",
                activityTitle: detail.activity.title || "",
                activityDate: formatDateStr(detail.activity.activity_date),
                facultyName: r.faculty_name || "",
                posterUrl: r.poster_url || "",
                permissionLetterUrl: r.permission_letter_url || "",
                eventParticulars: {
                    activityName: detail.activity.title || "",
                    organizingClub: detail.activity.club_name || "",
                    academicYear: r.academic_year || "",
                    facultyIncharge: [r.faculty_name, r.faculty_id].filter(Boolean).join(" - "),
                    studentLead: [r.student_lead_name, r.student_lead_id].filter(Boolean).join(" - "),
                    timeSlot: r.time_slot || "",
                    venue: r.venue || "",
                    studentsParticipated: r.students_participated ? String(r.students_participated) : "",
                    sdgsMapped: (typeof detail.activity?.sdgs === 'string' ? JSON.parse(detail.activity.sdgs || '[]') : (detail.activity?.sdgs || [])).map((num: number) => `SDG ${num}: ${SDG_MAP[num]}`).join(", "),
                },
                overview: r.overview || "",
                objectives: r.objectives || "",
                proceedings: r.proceedings || "",
                keyHighlights: r.key_highlights || "",
                learningOutcomes: r.learning_outcomes || "",
                conclusion: r.conclusion || "",
                gallery: r.gallery || [],
                attendanceSheets: r.attendance_sheets || [],
            });
            toast.success("Report downloaded");
        } catch (err: any) {
            toast.error(err?.message || "Failed to generate report PDF");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (selectedDetailCode) {
        return (
            <div className="max-w-7xl mx-auto space-y-4 pb-20">
                <button
                    onClick={() => { setSelectedDetailCode(null); setDetail(null); }}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900"
                >
                    <FiArrowLeft size={14} /> Back to SDGs Mapper
                </button>

                {detailLoading ? (
                    <div className="p-5 text-center text-gray-500 text-[13px]">Loading...</div>
                ) : detail ? (
                    <>
                        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm">
                            <h3 className="text-[15px] font-semibold text-gray-900">{detail.activity.title}</h3>
                            <div className="flex flex-wrap gap-4 mt-2 text-[12px] text-gray-500">
                                <span className="flex items-center gap-1"><FiCalendar size={12} /> {detail.activity.activity_date ? new Date(detail.activity.activity_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                                <span className="flex items-center gap-1"><FiMapPin size={12} /> {detail.activity.venue || "—"}</span>
                                <span className="flex items-center gap-1"><FiUsers size={12} /> {detail.students.length} enrolled · {detail.students.filter((s: any) => s.status === "completed").length} verified completed</span>
                                <span className="font-medium text-gray-700">{detail.students.reduce((sum: number, s: any) => sum + Number(s.pointsAwarded || 0), 0)} points allotted</span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                {detail.report ? (
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <FiCheckCircle size={12} /> Report generated
                                        </span>
                                        {detail.report.generated_at && (
                                            <span className="text-[11px] text-gray-400">on {new Date(detail.report.generated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                        <FiXCircle size={12} /> Report not generated yet
                                    </span>
                                )}
                                {detail.report && (
                                    <button
                                        onClick={downloadReport}
                                        disabled={downloading}
                                        className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg text-white disabled:opacity-50 bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        {downloading ? <FiRefreshCw size={12} className="animate-spin" /> : <FiDownload size={12} />}
                                        Download Report
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                                <h4 className="text-[13px] font-semibold text-gray-900">Students Participated</h4>
                            </div>
                            {detail.students.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-[13px]">No enrollment records for this activity.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[13px] text-left">
                                        <thead className="bg-white border-b border-gray-100">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold text-gray-600">Student</th>
                                                <th className="px-5 py-3 font-semibold text-gray-600">Branch</th>
                                                <th className="px-5 py-3 font-semibold text-gray-600">Year</th>
                                                <th className="px-5 py-3 font-semibold text-gray-600">Attendance</th>
                                                <th className="px-5 py-3 font-semibold text-gray-600">Verification</th>
                                                <th className="px-5 py-3 font-semibold text-gray-600 text-right">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {detail.students.map((s: any) => (
                                                <tr key={s.username} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-3">
                                                        <p className="font-medium text-gray-900">{s.name}</p>
                                                        <p className="text-[11px] text-gray-500">{s.username}</p>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-600">{s.branch}</td>
                                                    <td className="px-5 py-3 text-gray-600">{s.year}</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                                                            Number(s.attendance_percentage) > 0
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-red-50 text-red-700 border-red-200"
                                                        }`}>
                                                            {Number(s.attendance_percentage) > 0 ? "Present" : "Absent"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                                                            s.status === "completed"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                                        }`}>
                                                            {s.status === "completed" ? "Verified" : "Pending verification"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-medium text-gray-900">{Number(s.pointsAwarded || 0)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FiTarget className="text-blue-600" />
                        SDGs Mapper & Analytics
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track how activities align with the UN Sustainable Development Goals (SDGs).
                    </p>
                </div>
            </div>

            {/* High-level Analytics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 transition-transform group-hover:scale-110"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Total Activities</span>
                    <span className="text-3xl font-black text-gray-900 relative z-10">{analytics.total}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full opacity-50 transition-transform group-hover:scale-110"></div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 relative z-10">SAC Activities</span>
                    <span className="text-3xl font-black text-gray-900 relative z-10">{analytics.sacCount}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 transition-transform group-hover:scale-110"></div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 relative z-10">Dept. Clubs</span>
                    <span className="text-3xl font-black text-gray-900 relative z-10">{analytics.deptCount}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 transition-transform group-hover:scale-110"></div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 relative z-10">MHS Clubs</span>
                    <span className="text-3xl font-black text-gray-900 relative z-10">{analytics.mhsCount}</span>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 rounded-xl w-fit border border-gray-200">
                {(["ALL", "SAC", "DEPT", "MHS"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => {
                            setFilter(f);
                            setSelectedSDG(null);
                        }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                            filter === f 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        }`}
                    >
                        {f === "ALL" ? "All Domains" : f === "SAC" ? "SAC Clubs" : f === "DEPT" ? "Dept. Clubs" : "MHS Clubs"}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SDGs Grid */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900">Sustainable Development Goals</h2>
                        <span className="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                            Showing data for: {filter}
                        </span>
                    </div>
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Array.from({ length: 17 }, (_, i) => i + 1).map(sdgNum => {
                            const count = sdgCounts.get(sdgNum) || 0;
                            const isSelected = selectedSDG === sdgNum;
                            const colors = SDG_COLORS[sdgNum] || { bg: '#e5e7eb', text: '#374151', border: '#d1d5db' };
                            
                            return (
                                <button
                                    key={sdgNum}
                                    onClick={() => setSelectedSDG(isSelected ? null : sdgNum)}
                                    className={`relative flex flex-col items-start justify-between p-3 rounded-xl transition-all duration-300 text-left overflow-hidden border-2 ${
                                        isSelected ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-105' : 'hover:-translate-y-1 hover:shadow-md opacity-90 hover:opacity-100'
                                    }`}
                                    style={{
                                        backgroundColor: colors.bg,
                                        borderColor: isSelected ? '#fff' : colors.border,
                                        color: colors.text
                                    }}
                                >
                                    <div className="flex justify-between w-full items-start mb-4">
                                        <span className="text-2xl font-black opacity-80 leading-none">{sdgNum}</span>
                                        {count > 0 && (
                                            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white/25 px-2 text-xs font-bold backdrop-blur-sm shadow-sm">
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold leading-tight uppercase tracking-wide">
                                        {SDG_MAP[sdgNum] || `Goal ${sdgNum}`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected SDG Activities */}
                <div className="lg:col-span-1">
                    {selectedSDG === null ? (
                        <div className="bg-white h-full min-h-[300px] rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                <FiTarget size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Select an SDG</h3>
                            <p className="text-sm text-gray-500">
                                Click on any goal in the grid to view all corresponding activities from the selected domain.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white h-full rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-100 text-white relative overflow-hidden" style={{ backgroundColor: SDG_COLORS[selectedSDG]?.bg || '#374151' }}>
                                <button 
                                    onClick={() => setSelectedSDG(null)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full backdrop-blur-sm transition-all"
                                >
                                    <FiX size={16} />
                                </button>
                                <div className="pr-10">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1 block">SDG {selectedSDG}</span>
                                    <h3 className="text-lg font-black leading-tight">
                                        {SDG_MAP[selectedSDG] || `Goal ${selectedSDG}`}
                                    </h3>
                                    <p className="text-sm font-medium mt-2 opacity-90">
                                        {getSDGActivities(selectedSDG).length} mapped activities
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px] bg-gray-50/30">
                                {getSDGActivities(selectedSDG).length === 0 ? (
                                    <div className="text-center py-10 text-gray-500 text-sm">
                                        No activities mapped to this SDG in the current filter.
                                    </div>
                                ) : (
                                    getSDGActivities(selectedSDG).map(act => (
                                        <div key={act.code} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{act.title}</h4>
                                                <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex-shrink-0">
                                                    {act.code}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                                                    {act.domain}
                                                </span>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                                                    {act.category}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-1 mb-3 text-xs text-gray-600">
                                                {act.activity_date && (
                                                    <div className="flex items-center gap-1.5">
                                                        <FiCalendar className="text-gray-400 flex-shrink-0" size={12} />
                                                        <span>
                                                            {new Date(act.activity_date).toLocaleDateString('en-GB', {
                                                                day: '2-digit', month: 'short', year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                {act.venue && (
                                                    <div className="flex items-center gap-1.5">
                                                        <FiMapPin className="text-gray-400 flex-shrink-0" size={12} />
                                                        <span className="truncate">{act.venue}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-lg p-2 border border-gray-100">
                                                <div className="flex flex-col items-center flex-1 border-r border-gray-200 last:border-0">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Enrolled</span>
                                                    <span className="text-sm font-black text-gray-900">{act.total_enrolled || 0}</span>
                                                </div>
                                                <div className="flex flex-col items-center flex-1">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Present</span>
                                                    <span className="text-sm font-black text-emerald-600">{act.students_present || 0}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                                                {act.report_status ? (
                                                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                                        <FiCheckCircle size={12} /> Report Gen.
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                                                        <FiXCircle size={12} /> No Report
                                                    </span>
                                                )}
                                                
                                                {/* Link to view report if it exists, or activity view */}
                                                <button 
                                                    onClick={() => fetchDetail(act.code)}
                                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
