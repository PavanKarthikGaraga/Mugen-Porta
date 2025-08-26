"use client";
import { useState, useEffect } from "react";
import { FiUsers, FiFolder, FiMail, FiBarChart, FiTrendingUp, FiCalendar } from "react-icons/fi";
import { handleApiError } from '@/lib/apiErrorHandler';

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalProjects: 0,
        totalClubs: 0,
        pendingEmails: 0,
        recentRegistrations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/dashboard-stats');
                
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
        };

        fetchStats();
    }, []);

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
            value: stats.totalProjects,
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
            title: 'Pending Emails',
            value: stats.pendingEmails,
            icon: FiMail,
            color: 'red',
            href: '/dashboard/admin/dev/email-queue'
        },
        {
            title: 'Recent Registrations',
            value: stats.recentRegistrations,
            icon: FiTrendingUp,
            color: 'yellow',
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

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FiCalendar className="mr-2" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        <h3 className="font-medium text-gray-900">View Students</h3>
                        <p className="text-sm text-gray-600">Manage student registrations</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        <h3 className="font-medium text-gray-900">Email Queue</h3>
                        <p className="text-sm text-gray-600">Monitor email delivery</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        <h3 className="font-medium text-gray-900">Database Query</h3>
                        <p className="text-sm text-gray-600">Execute custom queries</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                        <h3 className="font-medium text-gray-900">Generate Reports</h3>
                        <p className="text-sm text-gray-600">Export data and analytics</p>
                    </button>
                </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Server Status</h3>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Online</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Database</h3>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Connected</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Last Updated</h3>
                        <p className="text-sm text-gray-600">{new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
