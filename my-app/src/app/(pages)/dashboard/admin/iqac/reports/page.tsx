"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FiEdit } from "react-icons/fi";

export default function IqacReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/dashboard/iqac/reports');
                if (res.ok) {
                    const data = await res.json();
                    setReports(data.reports || []);
                }
            } catch (e) {
                toast.error("Failed to load reports");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">IQAC Reports</h1>
                <p className="text-gray-500 mt-1">Manage and generate reports for IQAC activities.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No reports generated yet. Add activities first.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{r.title}</div>
                                        <div className="text-xs text-gray-500">{r.activity_code}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(r.activity_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            r.status === 'generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link href={`/dashboard/admin/iqac/reports/${r.activity_code}`} className="text-red-600 hover:text-red-900 flex items-center space-x-1">
                                            <FiEdit /> <span>Edit Report</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
