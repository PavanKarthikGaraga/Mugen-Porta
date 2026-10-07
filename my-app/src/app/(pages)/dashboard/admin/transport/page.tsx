"use client";

import { useState, useEffect, useMemo } from "react";
import { FiCalendar, FiMapPin, FiTruck, FiUsers, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#d0ed57', '#a4de6c'];

export default function TransportDetailsPage() {
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCity, setExpandedCity] = useState<string | null>(null);

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

    // Grouping data by District -> Bus Route
    const groupedData = useMemo(() => {
        const grouped: Record<string, Record<string, any[]>> = {};
        data.forEach(item => {
            const city = item.city || 'Not Specified';
            const route = item.city_bus_route || 'Not Specified';
            if (!grouped[city]) grouped[city] = {};
            if (!grouped[city][route]) grouped[city][route] = [];
            grouped[city][route].push(item);
        });
        return grouped;
    }, [data]);

    // Data for Pie Chart (Count by City)
    const pieData = useMemo(() => {
        return Object.keys(groupedData).map(city => {
            const count = Object.values(groupedData[city]).reduce((sum, students) => sum + students.length, 0);
            return { name: city, value: count };
        });
    }, [groupedData]);

    const totalStudents = data.length;

    const toggleCity = (city: string) => {
        setExpandedCity(expandedCity === city ? null : city);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transport Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View analytics and student counts grouped by district and bus route for enrolled activities on a specific date.
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
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                    <FiMapPin className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900">No students found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        No day-scholar students are enrolled in activities for {new Date(date).toLocaleDateString()}.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* KPI Cards */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 rounded-lg text-red-700">
                                        <FiUsers className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{totalStudents}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
                                        <FiMapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Districts / Cities</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{Object.keys(groupedData).length}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg text-green-700">
                                        <FiTruck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Unique Routes</p>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {new Set(data.map(i => i.city_bus_route)).size}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Students by District</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Grouped Data View */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FiTruck className="text-red-700" /> Student List (Grouped by District & Route)
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {Object.entries(groupedData).map(([city, routes]) => {
                                const cityTotal = Object.values(routes).reduce((sum, students) => sum + students.length, 0);
                                const isExpanded = expandedCity === city;
                                
                                return (
                                    <div key={city} className="bg-white">
                                        <button 
                                            onClick={() => toggleCity(city)}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? <FiChevronDown className="text-gray-400" /> : <FiChevronRight className="text-gray-400" />}
                                                <span className="font-semibold text-gray-900">{city}</span>
                                            </div>
                                            <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-medium">
                                                {cityTotal} Students
                                            </span>
                                        </button>
                                        
                                        {isExpanded && (
                                            <div className="px-6 pb-6 bg-gray-50/50">
                                                <div className="space-y-4 pt-2">
                                                    {Object.entries(routes).map(([route, students]) => (
                                                        <div key={route} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                                                                <span className="font-medium text-sm text-gray-800 flex items-center gap-2">
                                                                    <FiTruck className="text-gray-500" /> Route: {route}
                                                                </span>
                                                                <span className="text-xs font-medium text-gray-500">
                                                                    {students.length} Student{students.length > 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-100">
                                                                        {students.map((student, i) => (
                                                                            <tr key={i} className="hover:bg-gray-50">
                                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{student.student_id}</td>
                                                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{student.student_name}</td>
                                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{student.club_name || 'N/A'}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
