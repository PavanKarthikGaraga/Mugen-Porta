"use client"
import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiRefreshCw, FiEye, FiChevronLeft, FiChevronRight, FiFilter } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FacultyStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        year: "",
        category: "",
        clubId: ""
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    });
    const [userData, setUserData] = useState({ assignedClubs: [] });
    const [clubs, setClubs] = useState([]);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    assignedClubs: data.user?.assignedClubs || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchClubs = useCallback(async () => {
        try {
            const response = await fetch('/api/dashboard/faculty/clubs');
            if (response.ok) {
                const data = await response.json();
                // Filter to only show assigned clubs
                const assignedClubs = data.filter(club =>
                    userData.assignedClubs.includes(club.id)
                );
                setClubs(assignedClubs);
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
    }, [userData.assignedClubs]);

    const fetchStudents = useCallback(async (page = 1) => {
        if (userData.assignedClubs.length === 0) return;

        setLoading(true);
        try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: pagination.limit.toString(),
            search: searchTerm
        });

            if (filters.year && filters.year !== 'all') params.append('year', filters.year);
            if (filters.category && filters.category !== 'all') params.append('category', filters.category);
            if (filters.clubId && filters.clubId !== 'all') params.append('clubId', filters.clubId);

            const response = await fetch(`/api/dashboard/faculty/students?${params}`);
            const data = await response.json();

            if (data.success) {
                setStudents(data.data.students);
                setPagination(data.data.pagination);
            } else {
                console.error('Error fetching students:', data.error);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filters, pagination.limit, userData.assignedClubs.length]);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (userData.assignedClubs.length > 0) {
            fetchClubs();
            fetchStudents(1);
        }
    }, [userData.assignedClubs, fetchClubs, fetchStudents]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchStudents(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [fetchStudents]);

    const handlePageChange = (newPage) => {
        fetchStudents(newPage);
    };

    const refreshData = async () => {
        await fetchStudents(pagination.page);
    };

    const categoryLabels = {
        'TEC': 'Technical',
        'LCH': 'Leadership & Community',
        'ESO': 'Entrepreneurship & Startup',
        'IIE': 'Innovation, Incubation & Entrepreneurship',
        'HWB': 'Health & Well-being'
    };

    if (userData.assignedClubs.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <FiFilter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Clubs Assigned</h3>
                    <p className="text-gray-600">You don&apos;t have any clubs assigned yet. Contact an administrator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
                    <p className="text-gray-600 mt-1">View students across your assigned clubs</p>
                </div>
                <Button
                    onClick={refreshData}
                    className="bg-red-800 hover:bg-red-900"
                >
                    <FiRefreshCw className="h-4 w-4 mr-2" />
                    <span>Refresh</span>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiFilter className="mr-2" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label className="block text-sm font-medium mb-2">Search</Label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, username, or email"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="block text-sm font-medium mb-2">Club</Label>
                        <Select
                            value={filters.clubId}
                            onValueChange={(value) => setFilters({ ...filters, clubId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Assigned Clubs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Assigned Clubs</SelectItem>
                                {clubs.map((club) => (
                                    <SelectItem key={club.id} value={club.id}>
                                        {club.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="block text-sm font-medium mb-2">Year</Label>
                        <Select
                            value={filters.year}
                            onValueChange={(value) => setFilters({ ...filters, year: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Years" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                <SelectItem value="1st">1st Year</SelectItem>
                                <SelectItem value="2nd">2nd Year</SelectItem>
                                <SelectItem value="3rd">3rd Year</SelectItem>
                                <SelectItem value="4th">4th Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="block text-sm font-medium mb-2">Category</Label>
                        <Select
                            value={filters.category}
                            onValueChange={(value) => setFilters({ ...filters, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="TEC">Technical (TEC)</SelectItem>
                                <SelectItem value="LCH">Leadership & Community (LCH)</SelectItem>
                                <SelectItem value="ESO">Entrepreneurship & Startup (ESO)</SelectItem>
                                <SelectItem value="IIE">Innovation, Incubation & Entrepreneurship (IIE)</SelectItem>
                                <SelectItem value="HWB">Health & Well-being (HWB)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <Button
                        onClick={() => {
                            setFilters({ year: 'all', category: 'all', clubId: 'all' });
                            setSearchTerm('');
                        }}
                        variant="outline"
                    >
                        Clear Filters
                    </Button>
                </div>
                </CardContent>
            </Card>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {loading && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading students...</p>
                    </div>
                )}

                {!loading && students.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No students found matching your criteria.</p>
                    </div>
                )}

                {!loading && students.length > 0 && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Year
                                        </th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Branch
                                        </th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Club
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {student.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.year} Year
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.branch}
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.clubName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    {categoryLabels[student.selectedDomain] || student.selectedDomain}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.phoneNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    className="text-blue-600 cursor-pointer hover:text-blue-900 p-1 rounded"
                                                    title="View Details"
                                                >
                                                    <FiEye className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <FiChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm text-gray-700">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.pages}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <FiChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
