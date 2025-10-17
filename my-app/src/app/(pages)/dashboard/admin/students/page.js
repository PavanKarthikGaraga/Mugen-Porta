"use client"
import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiRefreshCw, FiDownload, FiEye, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        domain: "",
        year: "",
        residenceType: "",
        clubId: ""
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    });
    const [stats, setStats] = useState({
        total: 0,
        tec: 0,
        lch: 0,
        eso: 0,
        iie: 0,
        hwb: 0,
        rural: 0
    });
    const [clubStats, setClubStats] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    const fetchStudents = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                search: searchTerm,
                domain: filters.domain,
                year: filters.year,
                residenceType: filters.residenceType,
                clubId: filters.clubId
            });

            const response = await fetch(`/api/dashboard/admin/students?${params}`);
            const data = await response.json();

            if (await handleApiError(response)) {
                return; // Error was handled
            }

            if (data.success) {
                setStudents(data.data.students);
                setPagination(data.data.pagination);
                setStats(data.data.stats);
                setClubStats(data.data.clubStats || []);
            } else {
                console.error('Error fetching students:', data.error);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filters, pagination.limit]);

    useEffect(() => {
        fetchStudents(1);
    }, [fetchStudents]);

    const handlePageChange = (newPage) => {
        fetchStudents(newPage);
    };

    const refreshData = async () => {
        await fetchStudents(pagination.page);
    };

    const deleteStudent = async (studentId) => {
        try {
            const response = await fetch(`/api/dashboard/admin/students/${studentId}`, {
                method: 'DELETE'
            });

            if (await handleApiError(response)) {
                return; // Error was handled
            }

            const data = await response.json();

            if (data.success) {
                handleApiSuccess('Student deleted successfully');
                setShowDeleteModal(false);
                setStudentToDelete(null);
                await refreshData();
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (studentToDelete) {
            deleteStudent(studentToDelete.id);
        }
    };

    const downloadExcel = async () => {
        try {
            // Create CSV content
            const headers = [
                'ID', 'Username', 'Name', 'Gender', 'Year', 'Phone', 
                'Residence Type', 'Hostel Name', 'Domain', 'Project ID', 'Club', 'State', 'District'
            ];

            const csvContent = [
                headers.join(','),
                ...students.map(student => [
                    student.id,
                    student.username,
                    `"${student.name}"`,
                    student.gender,
                    student.year,
                    student.phoneNumber,
                    student.residenceType,
                    `"${student.hostelName || 'N/A'}"`,
                    student.selectedDomain,
                    student.projectId || 'N/A',
                    `"${student.clubName || 'N/A'}"`,
                    student.state,
                    student.district
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading Excel:', error);
            alert('Error downloading file');
        }
    };

    const getDomainBadgeClass = (domain) => {
        switch(domain) {
            case 'TEC': return 'bg-blue-100 text-blue-800';
            case 'LCH': return 'bg-purple-100 text-purple-800';
            case 'ESO': return 'bg-green-100 text-green-800';
            case 'IIE': return 'bg-orange-100 text-orange-800';
            case 'HWB': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Total Students: {stats.total}
                    </span>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={downloadExcel}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <FiDownload className="h-4 w-4" />
                        <span>Download CSV</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600">TEC</div>
                    <div className="text-2xl font-bold text-green-800">{stats.tec}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-sm text-purple-600">LCH</div>
                    <div className="text-2xl font-bold text-purple-800">{stats.lch}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-600">ESO</div>
                    <div className="text-2xl font-bold text-yellow-800">{stats.eso}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-sm text-orange-600">IIE</div>
                    <div className="text-2xl font-bold text-orange-800">{stats.iie}</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <div className="text-sm text-pink-600">HWB</div>
                    <div className="text-2xl font-bold text-pink-800">{stats.hwb}</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="text-sm text-indigo-600">Rural</div>
                    <div className="text-2xl font-bold text-indigo-800">{stats.rural}</div>
                </div>
            </div>

            {/* Club Statistics */}
            {clubStats.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Membership</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {clubStats.slice(0, 8).map((club) => (
                            <div key={club.clubName || 'no-club'} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-600 truncate">{club.clubName || 'No Club'}</div>
                                <div className="text-lg font-bold text-gray-800">{club.memberCount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search by name or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* Domain Filter */}
                    <div>
                        <select
                            value={filters.domain}
                            onChange={(e) => setFilters({...filters, domain: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Domains</option>
                            <option value="TEC">Technology</option>
                            <option value="LCH">Literature & Culture</option>
                            <option value="ESO">Environment & Social</option>
                            <option value="IIE">Innovation & Entrepreneurship</option>
                            <option value="HWB">Health & Wellbeing</option>
                            <option value="Rural">Rural Development</option>
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({...filters, year: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Years</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                        </select>
                    </div>

                    {/* Residence Type Filter */}
                    <div>
                        <select
                            value={filters.residenceType}
                            onChange={(e) => setFilters({...filters, residenceType: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Residence Types</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Day Scholar">Day Scholar</option>
                        </select>
                    </div>

                    {/* Club Filter */}
                    <div>
                        <select
                            value={filters.clubId}
                            onChange={(e) => setFilters({...filters, clubId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Clubs</option>
                            {clubStats.map((club) => (
                                <option key={club.clubId} value={club.clubId}>
                                    {club.clubName} ({club.memberCount})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student, index) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(pagination.page - 1) * pagination.limit + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {student.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDomainBadgeClass(student.selectedDomain)}`}>
                                            {student.selectedDomain}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.projectId || 'Not Assigned'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.clubName || 'Not Assigned'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button 
                                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                title="View Details"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </button>
                                            <button 
                                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                                title="Delete Student"
                                                onClick={() => handleDeleteClick(student)}
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <p className="text-gray-600 mt-2">Loading students...</p>
                    </div>
                )}

                {!loading && students.length === 0 && (
                    <div className="text-center py-12">
                        <FiSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No students found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-700">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            const pageNum = Math.max(1, pagination.page - 2) + i;
                            if (pageNum <= pagination.pages) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                            pageNum === pagination.page
                                                ? 'bg-red-600 text-white'
                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <FiChevronRight className="h-4 w-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && studentToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Confirm Delete
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete student <strong>{studentToDelete.name}</strong> ({studentToDelete.username})? 
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setStudentToDelete(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
