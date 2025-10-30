"use client";
import { useState, useEffect, useCallback } from "react";
import { FiUsers, FiFolder, FiBarChart, FiTrendingUp, FiCalendar, FiFilter } from "react-icons/fi";
import { handleApiError } from '@/lib/apiErrorHandler';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalProjects: 0,
        totalClubs: 0,
        recentRegistrations: 0,
        activeProjects: 0,
        totalRegistrations: 0
    });
    const [domainStats, setDomainStats] = useState({
        total: 0,
        tec: 0,
        lch: 0,
        eso: 0,
        iie: 0,
        hwb: 0,
        rural: 0
    });
    const [clubStats, setClubStats] = useState([]);
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
            if (filters.domain && filters.domain !== 'all') queryParams.append('domain', filters.domain);
            if (filters.year && filters.year !== 'all') queryParams.append('year', filters.year);
            if (filters.branch) queryParams.append('branch', filters.branch);
            if (filters.dateRange && filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);

            // Fetch main stats
            const statsResponse = await fetch(`/api/dashboard/admin/stats?${queryParams}`);
            if (await handleApiError(statsResponse)) {
                return; // Error was handled
            }

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Fetch domain and club stats from students API (with filters)
            const studentsResponse = await fetch(`/api/dashboard/admin/students?limit=1&${queryParams}`);
            if (await handleApiError(studentsResponse)) {
                return; // Error was handled
            }

            if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                if (studentsData.success && studentsData.data) {
                    setDomainStats(studentsData.data.stats);
                    setClubStats(studentsData.data.clubStats || []);
                }
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

            {/* Filters */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiFilter className="mr-2" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Select
                                value={filters.domain}
                                onValueChange={(value) => setFilters({ ...filters, domain: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Domains" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Domains</SelectItem>
                                    <SelectItem value="TEC">Technical (TEC)</SelectItem>
                                    <SelectItem value="LCH">Leadership & Community (LCH)</SelectItem>
                                    <SelectItem value="ESO">Entrepreneurship & Startup (ESO)</SelectItem>
                                    <SelectItem value="IIE">Innovation, Incubation & Entrepreneurship (IIE)</SelectItem>
                                    <SelectItem value="HWB">Health & Well-being (HWB)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Select
                                value={filters.year}
                                onValueChange={(value) => setFilters({ ...filters, year: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    <SelectItem value="22">Y22</SelectItem>
                                    <SelectItem value="23">Y23</SelectItem>
                                    <SelectItem value="24">Y24</SelectItem>
                                    <SelectItem value="25">Y25</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="branch">Branch</Label>
                            <Input
                                id="branch"
                                type="text"
                                value={filters.branch}
                                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                                placeholder="Enter branch"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateRange">Date Range</Label>
                            <Select
                                value={filters.dateRange}
                                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="90">Last 90 days</SelectItem>
                                    <SelectItem value="365">Last year</SelectItem>
                                    <SelectItem value="all">All time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setFilters({ domain: '', year: '', branch: '', dateRange: '30' })}
                        >
                            Clear Filters
                        </Button>
                        <Button
                            onClick={fetchStats}
                            className="bg-red-800 hover:bg-red-900"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const colorClasses = getColorClasses(stat.color);

                    return (
                        <Card
                            key={index}
                            className={`cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${colorClasses}`}
                            onClick={() => window.location.href = stat.href}
                        >
                            <CardContent className="p-6">
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
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Domain Statistics */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Domain Distribution</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    <Card className="border border-green-200 bg-green-50">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm font-medium text-green-700 mb-1">TEC</div>
                            <div className="text-2xl font-bold text-green-800">
                                {loading ? '...' : domainStats.tec || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-purple-200 bg-purple-50">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm font-medium text-purple-700 mb-1">LCH</div>
                            <div className="text-2xl font-bold text-purple-800">
                                {loading ? '...' : domainStats.lch || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm font-medium text-yellow-700 mb-1">ESO</div>
                            <div className="text-2xl font-bold text-yellow-800">
                                {loading ? '...' : domainStats.eso || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-orange-200 bg-orange-50">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm font-medium text-orange-700 mb-1">IIE</div>
                            <div className="text-2xl font-bold text-orange-800">
                                {loading ? '...' : domainStats.iie || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-pink-200 bg-pink-50">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm font-medium text-pink-700 mb-1">HWB</div>
                            <div className="text-2xl font-bold text-pink-800">
                                {loading ? '...' : domainStats.hwb || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-indigo-200 bg-indigo-50">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm font-medium text-indigo-700 mb-1">Rural</div>
                            <div className="text-2xl font-bold text-indigo-800">
                                {loading ? '...' : domainStats.rural || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border border-gray-200 bg-gray-50">
                        <CardContent className="p-4 text-center">
                            <div className="text-sm font-medium text-gray-700 mb-1">Total</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {loading ? '...' : domainStats.total || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Club Statistics */}
            {clubStats.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Club Membership</h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                {clubStats.slice(0, 12).map((club) => (
                                    <div key={club.clubId || club.clubName} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                                        <div className="text-sm font-medium text-gray-600 truncate mb-2">{club.clubName || 'No Club'}</div>
                                        <div className="text-2xl font-bold text-gray-800">{club.memberCount || 0}</div>
                                        <div className="text-xs text-gray-500">members</div>
                                    </div>
                                ))}
                            </div>
                            {clubStats.length > 12 && (
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        Showing 12 of {clubStats.length} clubs
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    );
}
