"use client";
import { useState, useEffect, useCallback } from "react";
import { FiUsers, FiBarChart, FiTrendingUp, FiCalendar } from "react-icons/fi";
import { handleApiError } from '@/lib/apiErrorHandler';

export default function LeadOverviewPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        yearWiseCount: {},
        categoryWiseCount: {},
        recentRegistrations: 0
    });
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({ clubId: null, clubName: '' });

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (userData.clubId) {
            fetchStats();
        }
    }, [userData.clubId, fetchStats]);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    clubId: data.clubId,
                    clubName: data.clubName || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/dashboard/lead/stats?clubId=${userData.clubId}`);

            if (await handleApiError(response)) {
                return;
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
    }, [userData.clubId]);

    const statCards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: FiUsers,
            color: 'blue'
        },
        {
            title: 'Recent Registrations',
            value: stats.recentRegistrations,
            icon: FiTrendingUp,
            color: 'green'
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
            default:
                return 'border-gray-500 text-gray-600 bg-gray-50';
        }
    };

    const yearLabels = {
        '1st': '1st Year',
        '2nd': '2nd Year',
        '3rd': '3rd Year',
        '4th': '4th Year'
    };

    const categoryLabels = {
        'TEC': 'Technical',
        'LCH': 'Leadership & Community',
        'ESO': 'Entrepreneurship & Startup',
        'IIE': 'Innovation, Incubation & Entrepreneurship',
        'HWB': 'Health & Well-being'
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Lead Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome to your club dashboard • {userData.clubName}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const colorClasses = getColorClasses(stat.color);

                    return (
                        <div
                            key={index}
                            className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${colorClasses} hover:shadow-lg transition-shadow`}
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
                                    stat.color === 'red' ? 'text-red-500' : 'text-gray-500'}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Year-wise Count */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Students by Year</h2>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats.yearWiseCount || {}).map(([year, count]) => (
                            <div key={year} className="text-center p-4 border border-gray-200 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{count}</p>
                                <p className="text-sm text-gray-600">{yearLabels[year] || year}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category-wise Count */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Students by Category</h2>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(stats.categoryWiseCount || {}).map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <span className="text-gray-900">{categoryLabels[category] || category}</span>
                                <span className="font-semibold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
