"use client"
import { useState, useEffect, useCallback, useRef } from "react";
import { FiSearch, FiRefreshCw, FiDownload, FiEye, FiTrash2, FiChevronLeft, FiChevronRight, FiEdit2 } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";
import { toast } from "sonner";

const DOMAIN_OPTIONS = [
    { value: 'TEC', label: 'TEC — Technology' },
    { value: 'ESO', label: 'ESO — Environment & Social' },
    { value: 'LCH', label: 'LCH — Liberal Arts' },
    { value: 'IIE', label: 'IIE — Innovation & Entrepreneurship' },
    { value: 'HWB', label: 'HWB — Health & Wellbeing' },
    // Real domain value on clubs.domain is 'DEPT. CLUBS' (matches
    // ClubSelection.tsx and every other place that filters department
    // clubs) -- this used to be the bare 'DEPT', which never matched any
    // real club and made this option silently return an empty list.
    { value: 'DEPT. CLUBS', label: 'DEPT. CLUBS — Department' },
];

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        domain: "",
        year: "",
        branch: "",
        residenceType: "",
        clubId: "",
        campus: "",
        careerChoice: ""
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    });
    const [clubStats, setClubStats] = useState([]);
    const [branchList, setBranchList] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Edit domain/club modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<any>(null);
    const [editDomain, setEditDomain] = useState('');
    const [editClubId, setEditClubId] = useState('');
    const [editClubSearch, setEditClubSearch] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    // fetchStudents takes explicit search/filter params so callers can pass
    // freshly-updated state without waiting for React to flush state updates.
    // This avoids the stale-closure issue where changing a filter and then
    // reading from the component's state inside the callback returned the
    // OLD value, causing the fetch to silently use the previous filter.
    const fetchStudents = useCallback(async (
        page = 1,
        overrideSearch?: string,
        overrideFilters?: typeof filters,
    ) => {
        setLoading(true);
        const effectiveSearch  = overrideSearch  ?? searchTerm;
        const effectiveFilters = overrideFilters ?? filters;
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "50",
                search: effectiveSearch,
                domain: effectiveFilters.domain,
                year: effectiveFilters.year,
                branch: effectiveFilters.branch,
                residenceType: effectiveFilters.residenceType,
                clubId: effectiveFilters.clubId,
                campus: effectiveFilters.campus,
                careerChoice: effectiveFilters.careerChoice,
            });

            const response = await fetch(`/api/dashboard/admin/students?${params}`);
            const data = await response.json();

            if (await handleApiError(response)) return;

            if (data.success) {
                setStudents(data.data.students);
                setPagination(data.data.pagination);
                setClubStats(data.data.clubStats || []);
                if (data.data.branchList?.length) setBranchList(data.data.branchList);
            } else {
                console.error('Error fetching students:', data.error);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Stable — reads from closure only as fallback, callers pass fresh values

    useEffect(() => {
        fetchStudents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced auto-search: fetch 400 ms after the user stops typing.
    // Skips the initial mount (the effect above handles that).
    const isFirstSearch = useRef(true);
    useEffect(() => {
        if (isFirstSearch.current) { isFirstSearch.current = false; return; }
        const timer = setTimeout(() => {
            fetchStudents(1, searchTerm, filters);
        }, 400);
        return () => clearTimeout(timer);
    // filters intentionally omitted — filter changes go through applyFilter synchronously
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Helper: update a single filter field and immediately fetch.
    // Changing domain clears the club pick so stale cross-domain clubs can't persist.
    const applyFilter = (field: string, value: string) => {
        let next = { ...filters, [field]: value };
        if (field === 'domain') next = { ...next, clubId: '' };
        setFilters(next);
        fetchStudents(1, searchTerm, next);
    };

    // Always forward the current search/filters so the stale useCallback
    // closure never silently drops active filter state on page navigation.
    const handlePageChange = (newPage: number) => {
        fetchStudents(newPage, searchTerm, filters);
    };

    const refreshData = async () => {
        fetchStudents(1, searchTerm, filters);
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

    const handleViewClick = (student) => {
        setSelectedStudent(student);
        setShowViewModal(true);
    };

    const confirmDelete = () => {
        if (studentToDelete) {
            deleteStudent(studentToDelete.id);
        }
    };

    const handleEditClick = (student: any) => {
        setStudentToEdit(student);
        setEditDomain(student.selectedDomain || '');
        setEditClubId(student.clubId || '');
        setEditClubSearch('');
        setShowEditModal(true);
    };

    const saveStudentDomainClub = async () => {
        if (!studentToEdit || !editDomain) return;
        setSavingEdit(true);
        try {
            const res = await fetch(`/api/dashboard/admin/students/${studentToEdit.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedDomain: editDomain, clubId: editClubId || null }),
            });
            if (await handleApiError(res)) return;
            const data = await res.json();
            if (data.success) {
                toast.success('Domain and club updated');
                setShowEditModal(false);
                setStudentToEdit(null);
                fetchStudents(pagination.page, searchTerm, filters);
            }
        } catch {
            toast.error('Failed to update');
        } finally {
            setSavingEdit(false);
        }
    };

    const [downloading, setDownloading] = useState(false);

    const downloadExcel = async () => {
        setDownloading(true);
        try {
            // `all=true` bypasses the normal 500-row page-size clamp on the API
            // (that clamp is what was capping this export at 500 students
            // before) and sends back every student matching the currently
            // applied filters, not just whatever's on the current page.
            const params = new URLSearchParams({
                all: 'true',
                search: searchTerm,
                domain: filters.domain,
                year: filters.year,
                branch: filters.branch,
                residenceType: filters.residenceType,
                clubId: filters.clubId,
                campus: filters.campus,
                careerChoice: filters.careerChoice
            });

            const response = await fetch(`/api/dashboard/admin/students?${params}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch students data');
            }

            const allStudents = data.data.students;

            const ExcelJS = (await import("exceljs")).default;
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Students");

            const columns = [
                { header: 'S.No', key: 'sno', width: 8 },
                { header: 'Username', key: 'username', width: 16 },
                { header: 'Name', key: 'name', width: 26 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Gender', key: 'gender', width: 10 },
                { header: 'Year', key: 'year', width: 8 },
                { header: 'Branch', key: 'branch', width: 14 },
                { header: 'Domain', key: 'domain', width: 10 },
                { header: 'Club', key: 'club', width: 24 },
                { header: 'Campus', key: 'campus', width: 20 },
                { header: 'Phone', key: 'phone', width: 14 },
                { header: 'Residence Type', key: 'residenceType', width: 16 },
                { header: 'Hostel Name', key: 'hostelName', width: 18 },
                { header: 'State', key: 'state', width: 16 },
                { header: 'District', key: 'district', width: 16 },
                { header: 'Career Choice', key: 'careerChoice', width: 24 },
            ];
            sheet.columns = columns;

            // Header row styling
            const headerRow = sheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
                cell.border = {
                    top: { style: "thin", color: { argb: "FFD1D5DB" } },
                    bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
                    left: { style: "thin", color: { argb: "FFD1D5DB" } },
                    right: { style: "thin", color: { argb: "FFD1D5DB" } },
                };
            });
            headerRow.height = 22;
            sheet.views = [{ state: "frozen", ySplit: 1 }];
            sheet.autoFilter = { from: "A1", to: "P1" };

            allStudents.forEach((student, index) => {
                const row = sheet.addRow({
                    sno: index + 1,
                    username: student.username,
                    name: student.name,
                    email: student.email,
                    gender: student.gender,
                    year: student.year,
                    branch: student.branch || 'N/A',
                    domain: student.selectedDomain,
                    club: student.clubName || 'Not Assigned',
                    campus: student.campus || 'N/A',
                    phone: student.phoneNumber,
                    residenceType: student.residenceType,
                    hostelName: student.hostelName || 'N/A',
                    state: student.state,
                    district: student.district,
                    careerChoice: student.careerChoice || 'N/A',
                });
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: "thin", color: { argb: "FFE5E7EB" } },
                        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
                        left: { style: "thin", color: { argb: "FFE5E7EB" } },
                        right: { style: "thin", color: { argb: "FFE5E7EB" } },
                    };
                });
                if (index % 2 === 1) {
                    row.eachCell((cell) => {
                        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
                    });
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success(`Downloaded ${allStudents.length} students successfully!`);
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error('Error downloading file');
        } finally {
            setDownloading(false);
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
                        Total Students: {pagination.total}
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
                        disabled={downloading}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <FiDownload className={`h-4 w-4 ${downloading ? 'animate-bounce' : ''}`} />
                        <span>{downloading ? 'Preparing…' : 'Download Excel'}</span>
                    </button>
                </div>
            </div>


            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
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

                    {/* Campus Filter */}
                    <div>
                        <select value={filters.campus} onChange={(e) => applyFilter("campus", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                            <option value="">All Campuses</option>
                            <option value="KLU - Vaddeswaram">KLU - Vaddeswaram</option>
                            <option value="KLH - Bachupally">KLH - Bachupally</option>
                            <option value="KLH - Aziz Nagar">KLH - Aziz Nagar</option>
                            <option value="KLH - GBS">KLH - GBS</option>
                        </select>
                    </div>

                    {/* Domain Filter */}
                    <div>
                        <select value={filters.domain} onChange={(e) => applyFilter("domain", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                            <option value="">All Domains</option>
                            <option value="TEC">Technology</option>
                            <option value="LCH">Liberal Arts</option>
                            <option value="ESO">Environment & Social</option>
                            <option value="IIE">Innovation & Entrepreneurship</option>
                            <option value="HWB">Health & Wellbeing</option>
                            <option value="DEPT. CLUBS">Department Clubs</option>
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <select value={filters.year} onChange={(e) => applyFilter("year", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                            <option value="">All Years</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                        </select>
                    </div>

                    {/* Branch Filter */}
                    <div>
                        <select value={filters.branch} onChange={(e) => applyFilter("branch", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                            <option value="">All Branches</option>
                            {branchList.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    {/* Residence Type Filter */}
                    <div>
                        <select value={filters.residenceType} onChange={(e) => applyFilter("residenceType", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                            <option value="">All Residence Types</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Day Scholar">Day Scholar</option>
                        </select>
                    </div>

                    {/* Club Filter — narrowed to selected domain when one is active */}
                    <div>
                        <select value={filters.clubId} onChange={(e) => applyFilter("clubId", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                            <option value="">All Clubs</option>
                            {(filters.domain
                                ? clubStats.filter((c: any) => c.clubDomain === filters.domain)
                                : clubStats
                            ).map((club: any) => (
                                <option key={club.clubId} value={club.clubId}>
                                    {club.clubName} ({club.memberCount})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Career Choice Filter */}
                    <div>
                        <select value={filters.careerChoice} onChange={(e) => applyFilter("careerChoice", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                            <option value="">All Careers</option>
                            <option value="Placement">Placement</option>
                            <option value="Higher Education">Higher Education</option>
                            <option value="Entrepreneurship">Entrepreneurship</option>
                            <option value="Research & Development (R&D)">Research & Development (R&D)</option>
                            <option value="Civil Services">Civil Services</option>
                            <option value="Social Service / NGOs">Social Service / NGOs</option>
                            <option value="Overseas Career">Overseas Career</option>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
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
                                        {student.branch || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.clubName || 'Not Assigned'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                title="View Details"
                                                onClick={() => handleViewClick(student)}
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                                title="Edit Domain & Club"
                                                onClick={() => handleEditClick(student)}
                                            >
                                                <FiEdit2 className="h-4 w-4" />
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

            {/* View Details Modal */}
            {showViewModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Student Details
                            </h3>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedStudent(null);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Info */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                    <dl className="space-y-2">
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Name</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.name}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Username</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.username}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Email</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.email}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Phone</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.phoneNumber}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Gender</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.gender}</dd></div>
                                    </dl>
                                </div>

                                {/* Academic Info */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic Information</h4>
                                    <dl className="space-y-2">
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Campus</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.campus}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Year</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.year}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Branch</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.branch || 'N/A'}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Career Choice</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.careerChoice || 'N/A'}</dd></div>
                                    </dl>
                                </div>

                                {/* Club Info */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Club Details</h4>
                                    <dl className="space-y-2">
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Domain</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.selectedDomain || 'N/A'}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Club</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.clubName || 'N/A'}</dd></div>
                                    </dl>
                                </div>

                                {/* Additional Info */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Additional Information</h4>
                                    <dl className="space-y-2">
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Residence Type</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.residenceType || 'N/A'}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Hostel Name</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.hostelName || 'N/A'}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">State / District</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.state || 'N/A'} / {selectedStudent.district || 'N/A'}</dd></div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedStudent(null);
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Domain & Club Modal */}
            {showEditModal && studentToEdit && (() => {
                const domainClubs = (clubStats as any[]).filter((c: any) =>
                    c.clubDomain === editDomain
                );
                const filtered = editClubSearch.trim()
                    ? domainClubs.filter((c: any) =>
                        c.clubName.toLowerCase().includes(editClubSearch.toLowerCase()) ||
                        String(c.clubId).toLowerCase().includes(editClubSearch.toLowerCase())
                    )
                    : domainClubs;
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Edit Domain & Club</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{studentToEdit.name} · {studentToEdit.username}</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Domain */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                                    <select
                                        value={editDomain}
                                        onChange={(e) => { setEditDomain(e.target.value); setEditClubId(''); setEditClubSearch(''); }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                                    >
                                        <option value="">— Select Domain —</option>
                                        {DOMAIN_OPTIONS.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Club search + list */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                                    <input
                                        type="text"
                                        placeholder={editDomain ? "Search clubs…" : "Select a domain first"}
                                        value={editClubSearch}
                                        disabled={!editDomain}
                                        onChange={(e) => setEditClubSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                    {editDomain && (
                                        <div className="mt-1 border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setEditClubId('')}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${editClubId === '' ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-500'}`}
                                            >
                                                — No Club / Unassigned —
                                            </button>
                                            {filtered.length === 0 ? (
                                                <p className="px-3 py-3 text-sm text-gray-400 text-center">No clubs found</p>
                                            ) : filtered.map((c: any) => (
                                                <button
                                                    key={c.clubId}
                                                    type="button"
                                                    onClick={() => { setEditClubId(c.clubId); setEditClubSearch(c.clubName); }}
                                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${editClubId === c.clubId ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-900'}`}
                                                >
                                                    <span>{c.clubName}</span>
                                                    <span className="text-gray-400 ml-1.5 text-xs font-mono">({c.clubId})</span>
                                                    <span className="text-gray-400 ml-2 text-xs">{c.memberCount} members</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {editClubId && (
                                        <p className="mt-1 text-xs text-green-600 font-medium">
                                            Selected: {(clubStats as any[]).find((c: any) => c.clubId === editClubId)?.clubName || editClubId}
                                            <span className="text-green-500 font-mono ml-1">({editClubId})</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 pb-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveStudentDomainClub}
                                    disabled={savingEdit || !editDomain}
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingEdit ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
