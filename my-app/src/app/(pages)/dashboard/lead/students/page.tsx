"use client"
import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiRefreshCw, FiEye, FiChevronLeft, FiChevronRight, FiFilter, FiDownload, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeadStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        year: "",
        category: ""
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    });
    const [userData, setUserData] = useState({ clubId: null });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    clubId: data.user?.clubId
                });
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchStudents = useCallback(async (page = 1) => {
        if (!userData.clubId) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                search: searchTerm,
                clubId: userData.clubId
            });

            if (filters.year && filters.year !== 'all') params.append('year', filters.year);
            if (filters.category && filters.category !== 'all') params.append('category', filters.category);

            const response = await fetch(`/api/dashboard/lead/students?${params}`);
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
    }, [searchTerm, filters, pagination.limit, userData.clubId]);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (userData.clubId) {
            fetchStudents(1);
        }
    }, [userData.clubId, fetchStudents]);

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

    const handleViewClick = (student) => {
        setSelectedStudent(student);
        setShowViewModal(true);
    };

    const downloadExcel = async () => {
        if (!userData.clubId) return;
        setDownloading(true);
        try {
            const params = new URLSearchParams({
                all: 'true',
                search: searchTerm,
                clubId: userData.clubId
            });
            if (filters.year && filters.year !== 'all') params.append('year', filters.year);
            if (filters.category && filters.category !== 'all') params.append('category', filters.category);

            const response = await fetch(`/api/dashboard/lead/students?${params}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to fetch students data');

            const allStudents = data.data.students;

            const ExcelJS = (await import("exceljs")).default;
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Students");
            sheet.columns = [
                { header: 'S.No', key: 'sno', width: 8 },
                { header: 'Username', key: 'username', width: 16 },
                { header: 'Name', key: 'name', width: 26 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Phone', key: 'phone', width: 14 },
                { header: 'Year', key: 'year', width: 8 },
                { header: 'Branch', key: 'branch', width: 14 },
                { header: 'Club', key: 'club', width: 22 },
                { header: 'Domain', key: 'domain', width: 10 },
                { header: 'Residence Type', key: 'residenceType', width: 16 },
                { header: 'Hostel/Bus Route', key: 'residenceDetail', width: 20 },
            ];

            const headerRow = sheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
            });
            headerRow.height = 22;
            sheet.views = [{ state: "frozen", ySplit: 1 }];
            sheet.autoFilter = { from: "A1", to: "K1" };

            allStudents.forEach((student, index) => {
                const row = sheet.addRow({
                    sno: index + 1,
                    username: student.username,
                    name: student.name,
                    email: student.email || 'N/A',
                    phone: student.phoneNumber || 'N/A',
                    year: student.year,
                    branch: student.branch || 'N/A',
                    club: student.clubName || 'N/A',
                    domain: student.selectedDomain,
                    residenceType: student.residenceType || 'N/A',
                    residenceDetail: student.residenceType === 'Hostel' ? (student.hostelName || 'N/A') : (student.busRoute || 'N/A'),
                });
                if (index % 2 === 1) {
                    row.eachCell((cell) => {
                        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
                    });
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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

    const categoryLabels = {
        'TEC': 'Technical',
        'LCH': 'Liberal Arts, Culture and Heritage',
        'ESO': 'Extension & Society Outreach',
        'IIE': 'Innovation, Incubation & Entrepreneurship',
        'HWB': 'Health & Well-being'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Club Students</h1>
                    <p className="text-gray-600 mt-1">Manage students in your assigned club</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={downloadExcel}
                        disabled={downloading}
                        variant="outline"
                    >
                        <FiDownload className="h-4 w-4 mr-2" />
                        <span>{downloading ? 'Exporting...' : 'Export XLSX'}</span>
                    </Button>
                    <Button
                        onClick={refreshData}
                        className="bg-red-800 hover:bg-red-900"
                    >
                        <FiRefreshCw className="h-4 w-4 mr-2" />
                        <span>Refresh</span>
                    </Button>
                </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <SelectItem value="LCH">Liberal Arts, Culture and Heritage (LCH)</SelectItem>
                                    <SelectItem value="ESO">Extension & Society Outreach (ESO)</SelectItem>
                                    <SelectItem value="IIE">Innovation, Incubation & Entrepreneurship (IIE)</SelectItem>
                                    <SelectItem value="HWB">Health & Well-being (HWB)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Button
                            onClick={() => {
                                setFilters({ year: 'all', category: 'all' });
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Branch
                                        </th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.branch}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.clubName || '—'}
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
                                                    onClick={() => handleViewClick(student)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors whitespace-nowrap"
                                                >
                                                    <FiEye className="h-3.5 w-3.5" /> View
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

            {/* View Details Modal */}
            {showViewModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">Student Details</h3>
                            <button
                                onClick={() => { setShowViewModal(false); setSelectedStudent(null); }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                    <dl className="space-y-2">
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Name</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.name}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Username</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.username}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Email</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.email || 'N/A'}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Phone</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.phoneNumber || 'N/A'}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Gender</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.gender || 'N/A'}</dd></div>
                                    </dl>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic & Club</h4>
                                    <dl className="space-y-2">
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Year</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.year} Year</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Branch</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.branch || 'N/A'}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Domain</dt><dd className="text-sm font-medium text-gray-900">{categoryLabels[selectedStudent.selectedDomain] || selectedStudent.selectedDomain}</dd></div>
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Club</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.clubName || 'N/A'}</dd></div>
                                    </dl>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 md:col-span-2">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Residence</h4>
                                    <dl className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col"><dt className="text-sm text-gray-500">Residence Type</dt><dd className="text-sm font-medium text-gray-900">{selectedStudent.residenceType || 'N/A'}</dd></div>
                                        <div className="flex flex-col">
                                            <dt className="text-sm text-gray-500">{selectedStudent.residenceType === 'Hostel' ? 'Hostel Name' : 'Bus Route'}</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {selectedStudent.residenceType === 'Hostel' ? (selectedStudent.hostelName || 'N/A') : (selectedStudent.busRoute || 'N/A')}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg">
                            <button
                                onClick={() => { setShowViewModal(false); setSelectedStudent(null); }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
