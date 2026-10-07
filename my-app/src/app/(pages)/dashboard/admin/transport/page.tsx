"use client";

import { useState, useEffect } from "react";
import { FiCalendar, FiMapPin, FiTruck, FiUsers } from "react-icons/fi";
import { toast } from "sonner";

export default function TransportDetailsPage() {
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTransportDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/dashboard/admin/transport?date=${date}`);
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    toast.error(result.error || "Failed to fetch transport details");
                }
            } catch (error) {
                toast.error("Network error while fetching transport details");
            } finally {
                setLoading(false);
            }
        };

        fetchTransportDetails();
    }, [date]);

    const totalStudents = data.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transport Details</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View day-scholar student counts by city and bus route for enrolled activities on a specific date.
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400" />
                        </div>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FiTruck className="text-red-700" /> Transport Requirements
                    </h2>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <FiUsers /> Total Students: {totalStudents}
                    </span>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-12">
                            <FiMapPin className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <h3 className="text-sm font-medium text-gray-900">No students found</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                No day-scholar students are enrolled in activities for {new Date(date).toLocaleDateString()}.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Club
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            City / District
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bus Route
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.student_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.student_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.club_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.city || 'Not Specified'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-medium bg-gray-100 text-gray-800">
                                                    {item.city_bus_route || 'Not Specified'}
                                                </span>
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
