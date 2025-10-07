"use client";
import { useState, useEffect, useCallback } from "react";
import { FiUsers, FiFolder, FiBarChart, FiTrendingUp, FiCalendar, FiFilter } from "react-icons/fi";
import { handleApiError } from '@/lib/apiErrorHandler';

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalProjects: 0,
        totalClubs: 0,
        recentRegistrations: 0,
        activeProjects: 0,
        totalRegistrations: 0
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        domain: '',
        year: '',
        branch: '',
        dateRange: '30'
    });

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);

            // Build query parameters from filters
            const queryParams = new URLSearchParams();
            if (filters.domain) queryParams.append('domain', filters.domain);
            if (filters.year) queryParams.append('year', filters.year);
            if (filters.branch) queryParams.append('branch', filters.branch);
            if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);

            const response = await fetch(`/api/dashboard/admin/stats?${queryParams}`);

            if (await handleApiError(response)) {
                return; // Error was handled
            }

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchStats();
    }, [filters, fetchStats]);

    const statCards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: FiUsers,
            color: 'blue',
            href: '/dashboard/admin/students'
        },
        {
            title: 'Active Projects',
            value: stats.activeProjects,
            icon: FiFolder,
            color: 'green',
            href: '/dashboard/admin/projects'
        },
        {
            title: 'Total Clubs',
            value: stats.totalClubs,
            icon: FiBarChart,
            color: 'purple',
            href: '/dashboard/admin/clubs'
        },
        {
            title: 'Recent Registrations',
            value: stats.recentRegistrations,
            icon: FiTrendingUp,
            color: 'yellow',
            href: '/dashboard/admin/students'
        },
        {
            title: 'Total Registrations',
            value: stats.totalRegistrations,
            icon: FiCalendar,
            color: 'red',
            href: '/dashboard/admin/students'
        }
    ];

    const getColorClasses = (color) => {
        switch (color) {
            case 'blue':
                return 'border-blue-500 text-blue-600 bg-blue-50';
            case 'green':
                return 'border-green-500 text-green-600 bg-green-50';
            case 'purple':
                return 'border-purple-500 text-purple-600 bg-purple-50';
            case 'red':
                return 'border-red-500 text-red-600 bg-red-50';
            case 'yellow':
                return 'border-yellow-500 text-yellow-600 bg-yellow-50';
            default:
                return 'border-gray-500 text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome to the administrative control panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const colorClasses = getColorClasses(stat.color);
                    
                    return (
                        <div
                            key={index}
                            className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${colorClasses} hover:shadow-lg transition-shadow cursor-pointer`}
                            onClick={() => window.location.href = stat.href}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {loading ? '...' : stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <Icon className={`h-8 w-8 ${stat.color === 'blue' ? 'text-blue-500' : 
                                    stat.color === 'green' ? 'text-green-500' :
                                    stat.color === 'purple' ? 'text-purple-500' :
                                    stat.color === 'red' ? 'text-red-500' :
                                    stat.color === 'yellow' ? 'text-yellow-500' : 'text-gray-500'}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FiFilter className="mr-2" />
                    Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                        <select
                            value={filters.domain}
                            onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        >
                            <option value="">All Domains</option>
                            <option value="TEC">Technical (TEC)</option>
                            <option value="LCH">Leadership & Community (LCH)</option>
                            <option value="ESO">Entrepreneurship & Startup (ESO)</option>
                            <option value="IIE">Innovation, Incubation & Entrepreneurship (IIE)</option>
                            <option value="HWB">Health & Well-being (HWB)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        >
                            <option value="">All Years</option>
                            <option value="22">Y22</option>
                            <option value="23">Y23</option>
                            <option value="24">Y24</option>
                            <option value="25">Y25</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                        <input
                            type="text"
                            value={filters.branch}
                            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                            placeholder="Enter branch"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                            <option value="">All time</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setFilters({ domain: '', year: '', branch: '', dateRange: '30' })}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={fetchStats}
                        className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
