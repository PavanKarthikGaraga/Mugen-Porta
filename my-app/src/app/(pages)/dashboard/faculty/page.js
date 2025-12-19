"use client";
import { useState, useEffect } from "react";
import { FiUsers, FiBarChart, FiTrendingUp, FiFilter } from "react-icons/fi";
import { handleApiError } from '@/lib/apiErrorHandler';

export default function FacultyOverviewPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        yearWiseCount: {},
        domainWiseCount: {},
        recentRegistrations: 0,
        clubWiseStats: {}
    });
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({ assignedClubs: [] });
    const [selectedClub, setSelectedClub] = useState('');
    const [clubs, setClubs] = useState([]);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (userData.assignedClubs.length > 0) {
            fetchClubs();
            fetchStats(selectedClub);
        }
    }, [userData.assignedClubs, selectedClub]);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    assignedClubs: data.user?.assignedClubs || []
                });
                // Don't auto-select - show all clubs by default
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchClubs = async () => {
        try {
            const response = await fetch('/api/dashboard/faculty/clubs');
            if (response.ok) {
                const data = await response.json();
                setClubs(data);
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
    };

    const fetchStats = async (clubId) => {
        try {
            setLoading(true);
            const url = clubId ? `/api/dashboard/faculty/stats?clubId=${clubId}` : '/api/dashboard/faculty/stats';

            const response = await fetch(url);

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
    };

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

    const domainLabels = {
        'TEC': 'Technical',
        'LCH': 'Leadership & Community',
        'ESO': 'Entrepreneurship & Startup',
        'IIE': 'Innovation, Incubation & Entrepreneurship',
        'HWB': 'Health & Well-being'
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Faculty Dashboard
                    {selectedClub && (
                        <span className="text-lg font-normal text-gray-600 ml-2">
                            - {clubs.find(c => c.id === selectedClub)?.name || selectedClub}
                        </span>
                    )}
                    {!selectedClub && userData.assignedClubs.length > 1 && (
                        <span className="text-lg font-normal text-gray-600 ml-2">
                            - All Clubs Combined
                        </span>
                    )}
                </h1>
                <p className="mt-2 text-gray-600">
                    Welcome to your faculty dashboard • {userData.assignedClubs.length} club{userData.assignedClubs.length !== 1 ? 's' : ''} assigned
                    {selectedClub && (
                        <span className="ml-2 text-red-600 font-medium">
                            • Viewing: {clubs.find(c => c.id === selectedClub)?.name || selectedClub}
                        </span>
                    )}
                    {!selectedClub && userData.assignedClubs.length > 1 && (
                        <span className="ml-2 text-blue-600 font-medium">
                            • Viewing: All Clubs Combined
                        </span>
                    )}
                </p>
            </div>

            {/* Club Filter */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center space-x-4">
                    <FiFilter className="h-5 w-5 text-gray-500" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Club
                        </label>
                        <select
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        >
                            <option value="">All Clubs Combined</option>
                            {clubs.map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            {userData.assignedClubs.length > 0 && (
                <>
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
                                {Object.entries(stats.domainWiseCount || {}).map(([domain, count]) => (
                                    <div key={domain} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <span className="text-gray-900">{domainLabels[domain] || domain}</span>
                                        <span className="font-semibold text-gray-900">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* No clubs assigned message */}
            {userData.assignedClubs.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiUsers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Clubs Assigned</h3>
                    <p className="text-gray-600">You don&apos;t have any clubs assigned yet. Contact an administrator.</p>
                </div>
            )}
        </div>
    );
}
