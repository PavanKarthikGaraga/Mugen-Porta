"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FiArrowLeft, FiDownload, FiCalendar, 
    FiCheckCircle, FiClock, FiActivity, FiLayers,
    FiPieChart, FiBarChart2, FiGlobe, FiDatabase
} from 'react-icons/fi';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from 'sonner';

const BRAND = "rgb(151,0,3)";

export default function SuperAnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

    const fetchData = async (date: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard/admin/super-analytics?date=${date}`);
            const json = await res.json();
            if (json.success) {
                setData(json);
            } else {
                toast.error(json.error || "Failed to fetch analytics");
            }
        } catch (err) {
            toast.error("Error fetching data");
        }
        setLoading(false);
    };

    const generatePDF = () => {
        if (!data || !data.activities) return;

        const doc = new jsPDF('landscape');
        
        // Header
        doc.setFillColor(151, 0, 3); // BRAND color
        doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Super Admin Daily Activity Report", 14, 20);
        
        doc.setFontSize(10);
        doc.text(`Date: ${selectedDate}`, doc.internal.pageSize.width - 40, 20);

        // Summary stats
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Daily Summary:`, 14, 45);
        
        doc.setFontSize(10);
        doc.text(`Total Activities: ${data.daily.total}`, 14, 55);
        doc.text(`Completed: ${data.daily.completed}`, 60, 55);
        doc.text(`Pending: ${data.daily.pending}`, 100, 55);
        
        doc.text(`SAC Clubs: ${data.daily.sac_count}`, 14, 62);
        doc.text(`DEPT Clubs: ${data.daily.dept_count}`, 60, 62);
        doc.text(`MHS Clubs: ${data.daily.mhs_count}`, 100, 62);

        // Table
        const tableData = data.activities.map((a: any) => [
            a.code,
            a.title,
            a.domain,
            a.dept_club,
            a.venue,
            `${a.start_time} - ${a.end_time || 'N/A'}`,
            a.status.toUpperCase()
        ]);

        (doc as any).autoTable({
            startY: 75,
            head: [['Activity ID', 'Title', 'Domain', 'Club/Dept', 'Venue', 'Timings', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [151, 0, 3] },
            styles: { fontSize: 8 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        doc.save(`Activity_Report_${selectedDate}.pdf`);
        toast.success("PDF Report Downloaded successfully!");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-red-100 text-red-700 border-red-200';
            case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <FiCheckCircle className="inline mr-1" />;
            case 'pending': return <FiClock className="inline mr-1" />;
            case 'ongoing': return <FiActivity className="inline mr-1" />;
            default: return <FiCalendar className="inline mr-1" />;
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: BRAND }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: BRAND }}></div>
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/dashboard/admin" className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900">
                                <FiArrowLeft />
                            </Link>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Super Admin Analytics</h1>
                        </div>
                        <p className="text-gray-500 text-sm ml-12">Comprehensive overview of all club activities, domains, and daily tracking.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto ml-12 md:ml-0">
                        <div className="relative w-full sm:w-auto">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition-all"
                            />
                        </div>
                        <button 
                            onClick={generatePDF}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                            style={{ backgroundColor: BRAND }}
                        >
                            <FiDownload size={16} />
                            Download Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Overall Database Analytics */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiDatabase style={{ color: BRAND }} /> Overall Activity Master (All Time)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3 text-gray-500">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-700"><FiLayers size={18} /></div>
                            <span className="text-sm font-semibold">Total Activities</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{data?.overall?.total || 0}</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl shadow-sm text-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3 text-blue-100">
                            <div className="p-2 bg-white/20 rounded-lg text-white"><FiGlobe size={18} /></div>
                            <span className="text-sm font-semibold">SAC Clubs</span>
                        </div>
                        <div className="text-3xl font-black">{data?.overall?.sac_total || 0}</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl shadow-sm text-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3 text-purple-100">
                            <div className="p-2 bg-white/20 rounded-lg text-white"><FiBarChart2 size={18} /></div>
                            <span className="text-sm font-semibold">DEPT Clubs</span>
                        </div>
                        <div className="text-3xl font-black">{data?.overall?.dept_total || 0}</div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl shadow-sm text-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3 text-emerald-100">
                            <div className="p-2 bg-white/20 rounded-lg text-white"><FiPieChart size={18} /></div>
                            <span className="text-sm font-semibold">MHS Clubs</span>
                        </div>
                        <div className="text-3xl font-black">{data?.overall?.mhs_total || 0}</div>
                    </div>
                </div>
            </div>

            {/* Daily Analytics */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiActivity style={{ color: BRAND }} /> Daily Tracking ({new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })})
                </h2>
                
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
                        <div className="p-6 text-center hover:bg-gray-50 transition-colors">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Activities Today</p>
                            <p className="text-3xl font-black text-gray-900">{data?.daily?.total || 0}</p>
                        </div>
                        <div className="p-6 text-center hover:bg-gray-50 transition-colors">
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Completed</p>
                            <p className="text-3xl font-black text-emerald-600">{data?.daily?.completed || 0}</p>
                        </div>
                        <div className="p-6 text-center hover:bg-gray-50 transition-colors">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Pending Action</p>
                            <p className="text-3xl font-black text-red-600">{data?.daily?.pending || 0}</p>
                        </div>
                        <div className="p-6 text-center hover:bg-gray-50 transition-colors">
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Ongoing/Upcoming</p>
                            <p className="text-3xl font-black text-blue-600">{(data?.daily?.ongoing || 0) + (data?.daily?.upcoming || 0)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Activity Breakdown</h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                                SAC: {data?.daily?.sac_count || 0}
                            </span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                                DEPT: {data?.daily?.dept_count || 0}
                            </span>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                                MHS: {data?.daily?.mhs_count || 0}
                            </span>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading activities...</div>
                    ) : !data?.activities || data.activities.length === 0 ? (
                        <div className="p-16 flex flex-col items-center text-gray-400 gap-3">
                            <FiCalendar size={32} className="text-gray-300" />
                            <p className="font-medium text-gray-500">No activities scheduled for this date.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold border-b">Status</th>
                                        <th className="p-4 font-semibold border-b">Time</th>
                                        <th className="p-4 font-semibold border-b">Domain / Club</th>
                                        <th className="p-4 font-semibold border-b">Activity Details</th>
                                        <th className="p-4 font-semibold border-b">Venue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {data.activities.map((a: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-4 align-top">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(a.status)}`}>
                                                    {getStatusIcon(a.status)}
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-top font-medium text-gray-900 whitespace-nowrap">
                                                {a.start_time ? a.start_time.substring(0, 5) : '--:--'}
                                                <br/>
                                                <span className="text-gray-400 text-xs font-normal">to {a.end_time ? a.end_time.substring(0, 5) : '--:--'}</span>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="font-bold text-gray-900">{a.domain}</div>
                                                <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">{a.dept_club}</div>
                                            </td>
                                            <td className="p-4 align-top max-w-[200px]">
                                                <div className="font-semibold text-gray-900 mb-0.5">{a.title}</div>
                                                <div className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block">{a.code}</div>
                                            </td>
                                            <td className="p-4 align-top text-gray-600">
                                                {a.venue}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
