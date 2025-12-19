"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FiExternalLink, FiCheck, FiX, FiAlertTriangle, FiFileText, FiSearch } from "react-icons/fi";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";

const ReportsEvaluation = ({
    userRole,
    reportType, // 'internal' or 'final'
    title,
    maxMarks,
    marksBreakdown = []
}) => {
    const [allStudents, setAllStudents] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [evaluationData, setEvaluationData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [modalViewType, setModalViewType] = useState('all'); // 'reports', 'links', or 'all'
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearchTerm, setActiveSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        domain: '',
        year: '',
        clubId: '',
        evaluationStatus: '' // 'done', 'pending', or ''
    });
    const [clubStats, setClubStats] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [hasPagination, setHasPagination] = useState(false);

    // Get API endpoints based on user role and report type
    const apis = useMemo(() => {
        let studentsApi, evaluateApi;

        // Determine students API based on role
        switch (userRole) {
            case 'lead':
                const leadParams = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: '50'
                });

                // Add filter parameters
                if (activeSearchTerm.trim()) leadParams.append('search', activeSearchTerm.trim());
                if (filters.domain) leadParams.append('category', filters.domain); // API uses 'category' for domain
                if (filters.year) leadParams.append('year', filters.year);

                studentsApi = `/api/dashboard/lead/students?${leadParams.toString()}`;
                break;
            case 'faculty':
                const facultyParams = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: '50'
                });

                // Add filter parameters
                if (activeSearchTerm.trim()) facultyParams.append('search', activeSearchTerm.trim());
                if (filters.domain) facultyParams.append('category', filters.domain); // API uses 'category' for domain
                if (filters.year) facultyParams.append('year', filters.year);

                studentsApi = `/api/dashboard/faculty/students?${facultyParams.toString()}`;
                break;
            case 'admin':
                const params = new URLSearchParams({
                    role: 'student',
                    page: currentPage.toString(),
                    limit: '50'
                });

                // Add filter parameters
                if (activeSearchTerm.trim()) params.append('search', activeSearchTerm.trim());
                if (filters.domain) params.append('domain', filters.domain); // Admin API uses 'domain' directly
                if (filters.year) params.append('year', filters.year);
                if (filters.clubId) params.append('clubId', filters.clubId);

                studentsApi = `/api/dashboard/admin/students?${params.toString()}`;
                break;
            default:
                studentsApi = '/api/dashboard/lead/students';
        }

        // Determine evaluation API based on role
        switch (userRole) {
            case 'lead':
                evaluateApi = reportType === 'internal' ? '/api/dashboard/lead/evaluate/internal' : '/api/dashboard/lead/evaluate/external';
                break;
            case 'faculty':
                evaluateApi = reportType === 'internal' ? '/api/dashboard/faculty/evaluate/internal' : '/api/dashboard/faculty/evaluate/external';
                break;
            case 'admin':
                evaluateApi = reportType === 'internal' ? '/api/dashboard/admin/evaluate/internal' : '/api/dashboard/admin/evaluate/external';
                break;
            default:
                evaluateApi = reportType === 'internal' ? '/api/dashboard/lead/evaluate/internal' : '/api/dashboard/lead/evaluate/external';
        }

        // For internal reports, we need different API structure
        if (reportType === 'internal') {
            switch (userRole) {
                case 'lead':
                    evaluateApi = '/api/dashboard/lead/evaluate/internal';
                    break;
                case 'faculty':
                    evaluateApi = '/api/dashboard/faculty/evaluate/internal';
                    break;
                case 'admin':
                    evaluateApi = '/api/dashboard/admin/evaluate/internal';
                    break;
                default:
                    evaluateApi = '/api/dashboard/lead/evaluate/internal';
            }
        }

        return {
            students: studentsApi,
            evaluate: evaluateApi
        };
    }, [userRole, reportType, currentPage, activeSearchTerm, filters.domain, filters.year, filters.clubId]);

    // Set pagination flag for admin
    useEffect(() => {
        setHasPagination(userRole === 'admin');
        if (userRole !== 'admin') {
            setCurrentPage(1); // Reset to page 1 when not admin
            setTotalPages(1);
        }
    }, [userRole]);

    // Fetch students and club stats
    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch students based on role (now includes submission data)
            const studentsResponse = await fetch(apis.students, { credentials: 'include' });
            if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                const studentsList = studentsData.success ?
                    studentsData.data.students :
                    (studentsData.data || studentsData);

                // Handle pagination for admin
                if (userRole === 'admin' && studentsData.success && studentsData.data?.pagination) {
                    setTotalPages(studentsData.data.pagination.pages || 1);
                    setTotalStudents(studentsData.data.pagination.total || 0);
                }

                // Fetch club stats for filtering (only for admin role)
                if (userRole === 'admin' && studentsData.success && studentsData.data?.clubStats) {
                    setClubStats(studentsData.data.clubStats);
                }

                // Process students with submission data (already included in API response)
                const studentsWithSubmissions = studentsList.map((student) => {
                    if (reportType === 'internal') {
                        // Internal reports logic - new day-based structure
                        const submissions = student.submissions || [];

                        // Group submissions by day
                        const daysByNumber = {};
                        submissions.forEach(sub => {
                            if (sub.day_number) {
                                if (!daysByNumber[sub.day_number]) {
                                    daysByNumber[sub.day_number] = {
                                        day: sub.day_number,
                                        report: null,
                                        linkedin: null,
                                        youtube: null,
                                        status: null,
                                        reason: null
                                    };
                                }

                                if (sub.submission_type === 'report') {
                                    daysByNumber[sub.day_number].report = sub.submission_url;
                                    daysByNumber[sub.day_number].status = sub.status;
                                    daysByNumber[sub.day_number].reason = sub.reason;
                                } else if (sub.submission_type === 'linkedin_link') {
                                    daysByNumber[sub.day_number].linkedin = sub.submission_url;
                                } else if (sub.submission_type === 'youtube_link') {
                                    daysByNumber[sub.day_number].youtube = sub.submission_url;
                                }
                            }
                        });

                        const days = Object.values(daysByNumber);
                        const approvedDays = days.filter(d => d.status === 'A').length;
                        const submittedDays = days.filter(d => d.status === 'S').length;
                        const rejectedDays = days.filter(d => d.status === 'R').length;
                        const newDays = days.filter(d => d.status === 'N').length;
                        const pendingDays = 6 - days.length;

                        const hasUnevaluatedSubmissions = days.some(d => d.status === 'S' || d.status === 'N');
                        const hasSubmissions = days.length > 0;
                        const needsReview = hasUnevaluatedSubmissions;

                        return {
                            ...student,
                            hasSubmissions,
                            needsReview,
                            days: days,
                            approvedDays,
                            submittedDays,
                            rejectedDays,
                            pendingDays,
                            totalDays: days.length
                        };
                    } else {
                        // Final reports logic
                        const finalSubmission = student.finalSubmission;
                        const hasFinalReport = finalSubmission?.final_report_url;
                        const hasYoutube = finalSubmission?.presentation_youtube_url;
                        const hasLinkedin = finalSubmission?.presentation_linkedin_url;
                        const isEvaluated = finalSubmission?.evaluated || false;

                        const needsReview = (hasFinalReport || hasYoutube || hasLinkedin) && !isEvaluated;
                        const hasSubmissions = hasFinalReport || hasYoutube || hasLinkedin;

                        return {
                            ...student,
                            hasSubmissions,
                            needsReview,
                            isEvaluated
                        };
                    }
                });

                setAllStudents(studentsWithSubmissions);
                setStudents(studentsWithSubmissions);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }, [userRole, reportType, apis.students]);

    // Handle page changes
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        // fetchStudents will be called via useEffect when currentPage changes
    }, []);

    // Reset to page 1 when filters change
    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Handle search execution
    const executeSearch = useCallback(() => {
        setActiveSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to first page when searching
    }, [searchTerm]);

    // Handle search input key press
    const handleSearchKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    }, [executeSearch]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeSearchTerm, filters.domain, filters.year, filters.clubId, filters.evaluationStatus]);

    const handleViewReports = (student) => {
        setSelectedStudent(student);
        setModalViewType('reports');
        setShowModal(true);
    };

    const handleViewLinks = (student) => {
        setSelectedStudent(student);
        setModalViewType('links');
        setShowModal(true);
    };

    const handleViewClick = (student) => {
        setSelectedStudent(student);
        setModalViewType('all');
        setShowModal(true);
    };

    const handleEvaluate = (day, action) => {
        console.log('handleEvaluate called with:', { day, action, typeofDay: typeof day });

        if (reportType === 'internal') {
            // For internal reports, handle day approval/rejection directly
            // Ensure we only store plain data, not DOM elements
            const dayValue = typeof day === 'object' && day?.target ? parseInt(day.target.value) : parseInt(day);
            console.log('dayValue calculated as:', dayValue, 'from day:', day);
            setSelectedItem({ day: dayValue, action });
            if (action === 'reject') {
                setShowEvaluationModal(true);
                setEvaluationData({ reason: '' });
            } else {
                // For approve, submit directly
                handleMarksSubmit(dayValue, action);
            }
        } else {
            // For final reports, use the old evaluation modal
            // Ensure we only store plain data
            const dayValue = typeof day === 'object' && day?.target ? day.target.value : day;
            setSelectedItem({ day: dayValue, action: 'final' });
            setShowEvaluationModal(true);
            const submission = selectedStudent?.finalSubmission;
            setEvaluationData({
                frm: submission?.frm || '',
                fyt_m: submission?.fyt_m || '',
                flk_m: submission?.flk_m || ''
            });
        }
    };

    const handleMarksSubmit = async (dayParam, actionParam) => {
        if (!selectedStudent) return;


        setSubmitting(true);
        let requestBody = {}; // Define outside try block so it's accessible in catch

        try {
            // Ensure all parameters are plain values, not objects with circular references
            const day = parseInt(dayParam || selectedItem?.day);
            const action = actionParam || selectedItem?.action;


            if (reportType === 'internal') {
                // For internal reports, use the new day-based evaluation
                // Ensure all values are primitives
                const reason = action === 'reject' ? String(evaluationData.reason || '') : null;

                requestBody = {
                    studentUsername: String(selectedStudent.username),
                    day: parseInt(day),
                    action: String(action),
                    reason: reason
                };
            } else {
                // For final reports, use the old evaluation structure
                // Ensure evaluationData contains only plain values
                const cleanEvaluationData = {
                    frm: String(evaluationData.frm || ''),
                    fyt_m: String(evaluationData.fyt_m || ''),
                    flk_m: String(evaluationData.flk_m || '')
                };

                requestBody = {
                    studentUsername: String(selectedStudent.username),
                    evaluationData: cleanEvaluationData
                };
            }

            // Validate request body before sending
            if (reportType === 'internal') {
                if (!requestBody.studentUsername || !requestBody.day || !requestBody.action) {
                    console.error('Missing required fields in request body:', requestBody);
                    toast.error('Missing required fields for evaluation');
                    return;
                }
                if (requestBody.action === 'reject' && !requestBody.reason) {
                    console.error('Reason required for rejection:', requestBody);
                    toast.error('Reason is required for rejection');
                    return;
                }
            }


            const response = await fetch(apis.evaluate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                // Show success message in the evaluation modal
                setEvaluationData(prev => ({ ...prev, success: true }));

                // Refresh data immediately
                await fetchStudents();

                // Find the updated student data and update selectedStudent
                setAllStudents(currentStudents => {
                    const updatedStudent = currentStudents.find(s => s.username === selectedStudent?.username);
                    if (updatedStudent) {
                        setSelectedStudent(updatedStudent);
                    }
                    return currentStudents;
                });

                // Keep success visible for 3 seconds, then close both modals
                setTimeout(() => {
                    setShowEvaluationModal(false);
                    setShowModal(false);
                    setSelectedItem(null);
                    setSelectedStudent(null);
                    setEvaluationData({});
                }, 3000);
            } else {
                // Read response body only once
                let errorMessage = 'Failed to submit evaluation';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.log('Error response data:', errorData);
                } catch (parseError) {
                    // If JSON parsing fails, try to get text
                    try {
                        const errorText = await response.text();
                        console.log('Error response text:', errorText);
                    } catch (textError) {
                        console.log('Could not read error response');
                    }
                }
                toast.error(errorMessage);
                // Don't close modal on error, let user retry
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            console.error('Request body that caused error:', requestBody);
            toast.error('Network error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'review': return 'text-orange-600';
            case 'NULL': return 'text-gray-400';
            default: return 'text-gray-600';
        }
    };

    const renderStudentTable = () => {
        if (reportType === 'internal') {
            return (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student, index) => (
                                    <tr key={student.username} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            {student.approvedDays}/6
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            {student.submittedDays}/6
                                            {student.needsReview && (
                                                <FiAlertTriangle className="w-4 h-4 ml-1 text-orange-500 inline" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            {student.rejectedDays}/6
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.pendingDays}/6
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Button
                                                variant="link"
                                                onClick={() => handleViewClick(student)}
                                                className="h-auto p-0 text-blue-600 hover:text-blue-900"
                                            >
                                                View Days
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else {
            // Final reports table
            return (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Submission</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student, index) => (
                                    <tr key={student.username} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Button
                                                variant="link"
                                                onClick={() => handleViewClick(student)}
                                                className={`h-auto p-0 text-red-800 hover:text-red-600 ${
                                                    student.needsReview ? 'font-semibold' : ''
                                                }`}
                                            >
                                                <FiFileText className="w-4 h-4 mr-2" />
                                                <span>View Final Submission</span>
                                                {student.needsReview && (
                                                    <FiAlertTriangle className="w-4 h-4 ml-1 text-orange-500" />
                                                )}
                                            </Button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Badge
                                                variant={
                                                    student.isEvaluated ? "default" :
                                                    student.needsReview ? "secondary" :
                                                    "outline"
                                                }
                                                className={
                                                    student.isEvaluated ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                                    student.needsReview ? "bg-orange-100 text-orange-800 hover:bg-orange-100" :
                                                    "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }
                                            >
                                                {student.isEvaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : student.needsReview ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.finalSubmission?.marks ? `${student.finalSubmission.marks}/100` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Button
                                                variant="link"
                                                onClick={() => handleViewClick(student)}
                                                className="h-auto p-0 text-blue-600 hover:text-blue-900"
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    };

    const renderModalContent = () => {
        if (!selectedStudent) return null;

        if (reportType === 'internal') {
            // Show days for internal reports
            const days = selectedStudent.days || [];

            return (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Report</TableHead>
                                <TableHead>LinkedIn</TableHead>
                                <TableHead>YouTube</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 6 }, (_, i) => {
                                const dayNumber = i + 1;
                                const dayData = days.find(d => d.day === dayNumber) || {
                                    day: dayNumber,
                                    report: null,
                                    linkedin: null,
                                    youtube: null,
                                    status: null,
                                    reason: null
                                };

                                const getStatusBadge = (status) => {
                                    switch (status) {
                                        case 'A':
                                            return <Badge className="bg-green-100 text-green-800"><FiCheck className="w-3 h-3 mr-1" />Approved</Badge>;
                                        case 'R':
                                            return <Badge className="bg-red-100 text-red-800"><FiX className="w-3 h-3 mr-1" />Rejected</Badge>;
                                        case 'S':
                                            return <Badge className="bg-orange-100 text-orange-800"><FiAlertTriangle className="w-3 h-3 mr-1" />Submitted</Badge>;
                                        case 'N':
                                            return <Badge className="bg-purple-100 text-purple-800"><FiAlertTriangle className="w-3 h-3 mr-1" />New</Badge>;
                                        default:
                                            return <Badge variant="outline">Not Submitted</Badge>;
                                    }
                                };

                                return (
                                    <TableRow key={dayNumber}>
                                        <TableCell className="font-medium">
                                            Day {dayNumber}
                                        </TableCell>
                                        <TableCell>
                                            {dayData.report ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={dayData.report}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FiExternalLink className="w-4 h-4 mr-1" />
                                                        View
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {dayData.linkedin ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={dayData.linkedin}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FiExternalLink className="w-4 h-4 mr-1" />
                                                        View
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {dayData.youtube ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={dayData.youtube}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FiExternalLink className="w-4 h-4 mr-1" />
                                                        View
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                {getStatusBadge(dayData.status)}
                                                {dayData.reason && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        <strong>Reason:</strong> {dayData.reason}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(dayData.status === 'S' || dayData.status === 'N') && (
                                                <div className="flex space-x-2">
                                                    <Button
                                                        onClick={() => handleEvaluate(dayNumber, 'approve')}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-900"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            console.log('Reject button clicked, dayNumber:', dayNumber, 'typeof:', typeof dayNumber);
                                                            handleEvaluate(dayNumber, 'reject');
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            );
        } else {
            // Final reports modal content
            return (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Submission Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Final Report Row */}
                            {(() => {
                                const submission = selectedStudent.finalSubmission;
                                const hasReport = submission?.final_report_url;
                                const isReportEvaluated = selectedStudent.isEvaluated;

                                return (
                                    <TableRow key="final-report">
                                        <TableCell className="font-medium">
                                            Final Report
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    isReportEvaluated ? "default" :
                                                    hasReport ? "secondary" :
                                                    "outline"
                                                }
                                                className={
                                                    isReportEvaluated ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                                    hasReport ? "bg-orange-100 text-orange-800 hover:bg-orange-100" :
                                                    "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }
                                            >
                                                {isReportEvaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : hasReport ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {isReportEvaluated ? `${submission.frm}/25` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {hasReport ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={submission.final_report_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FiExternalLink className="w-4 h-4 mr-1" />
                                                        View Report
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {hasReport && !isReportEvaluated && (
                                                <Button
                                                    onClick={() => handleEvaluate('final')}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-900"
                                                >
                                                    Evaluate
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })()}

                            {/* YouTube Presentation Row */}
                            {(() => {
                                const submission = selectedStudent.finalSubmission;
                                const hasYoutube = submission?.presentation_youtube_url;

                                return (
                                    <TableRow key="youtube-presentation">
                                        <TableCell className="font-medium">
                                            YouTube Presentation
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={hasYoutube ? "default" : "outline"}
                                                className={
                                                    hasYoutube ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                                    "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }
                                            >
                                                {hasYoutube ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Submitted</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            -
                                        </TableCell>
                                        <TableCell>
                                            {hasYoutube ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={submission.presentation_youtube_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FiExternalLink className="w-4 h-4 mr-1" />
                                                        View Presentation
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            -
                                        </TableCell>
                                    </TableRow>
                                );
                            })()}

                            {/* LinkedIn Presentation Row */}
                            {(() => {
                                const submission = selectedStudent.finalSubmission;
                                const hasLinkedin = submission?.presentation_linkedin_url;

                                return (
                                    <TableRow key="linkedin-presentation">
                                        <TableCell className="font-medium">
                                            LinkedIn Presentation
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={hasLinkedin ? "default" : "outline"}
                                                className={
                                                    hasLinkedin ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                                    "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }
                                            >
                                                {hasLinkedin ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Submitted</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            -
                                        </TableCell>
                                        <TableCell>
                                            {hasLinkedin ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={submission.presentation_linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FiExternalLink className="w-4 h-4 mr-1" />
                                                        View Post
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            -
                                        </TableCell>
                                    </TableRow>
                                );
                            })()}
                        </TableBody>
                    </Table>
                </div>
            );
        }
    };

    const renderEvaluationModal = () => {
        if (!selectedItem) {
            return <div>Loading...</div>;
        }

        if (reportType === 'internal') {
            // For internal reports, show rejection reason input
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="rejection-reason">
                            Rejection Reason for Day {selectedItem?.day || 'Unknown'}
                        </Label>
                        <textarea
                            id="rejection-reason"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows="4"
                            value={evaluationData.reason}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                reason: e.target.value
                            }))}
                            placeholder="Please provide a reason for rejecting this submission..."
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="final-report-marks">
                            Final Report Marks (0-25)
                        </Label>
                        <Input
                            id="final-report-marks"
                            type="number"
                            step="1"
                            min="0"
                            max="25"
                            value={evaluationData.frm}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                frm: e.target.value
                            }))}
                            placeholder="Enter marks for final report"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="final-youtube-marks">
                            YouTube Presentation Marks (0-7.5)
                        </Label>
                        <Input
                            id="final-youtube-marks"
                            type="number"
                            step="0.1"
                            min="0"
                            max="7.5"
                            value={evaluationData.fyt_m}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                fyt_m: e.target.value
                            }))}
                            placeholder="Enter marks for YouTube presentation"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="final-linkedin-marks">
                            LinkedIn Presentation Marks (0-7.5)
                        </Label>
                        <Input
                            id="final-linkedin-marks"
                            type="number"
                            step="0.1"
                            min="0"
                            max="7.5"
                            value={evaluationData.flk_m}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                flk_m: e.target.value
                            }))}
                            placeholder="Enter marks for LinkedIn presentation"
                        />
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                            <strong>Total Possible:</strong> 25 (Report) + 7.5 (YouTube) + 7.5 (LinkedIn) = 40 marks
                        </p>
                    </div>
                </div>
            );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 text-gray-600">
                    Review and evaluate student submissions ({maxMarks} marks total)
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-1">
                        <div className="relative flex">
                            <input
                                type="text"
                                placeholder="Search by name or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchKeyPress}
                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <button
                                onClick={executeSearch}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                type="button"
                            >
                                <FiSearch className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Domain Filter */}
                    <div>
                        <select
                            value={filters.domain}
                            onChange={(e) => handleFiltersChange({...filters, domain: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Domains</option>
                            <option value="TEC">Technology</option>
                            <option value="LCH">Literature & Culture</option>
                            <option value="ESO">Environment & Social</option>
                            <option value="IIE">Innovation & Entrepreneurship</option>
                            <option value="HWB">Health & Wellbeing</option>
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <select
                            value={filters.year}
                            onChange={(e) => handleFiltersChange({...filters, year: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Years</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                        </select>
                    </div>

                    {/* Club Filter */}
                    <div>
                        <select
                            value={filters.clubId}
                            onChange={(e) => handleFiltersChange({...filters, clubId: e.target.value})}
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

                    {/* Evaluation Status Filter */}
                    <div>
                        <select
                            value={filters.evaluationStatus}
                            onChange={(e) => handleFiltersChange({...filters, evaluationStatus: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="">All Status</option>
                            <option value="done">Evaluation Done</option>
                            <option value="pending">Evaluation Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            {renderStudentTable()}

            {students.length === 0 && !loading && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No students found matching your criteria.</p>
                </div>
            )}

            {/* Pagination Controls for Admin */}
            {hasPagination && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing page {currentPage} of {totalPages}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            )}

            {/* Modal */}
            <Dialog open={showModal && !!selectedStudent} onOpenChange={setShowModal}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto data-[state=open]:slide-in-from-top-[50%] data-[state=open]:slide-in-from-left-1/2">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedStudent?.name} ({selectedStudent?.username}) - {modalViewType === 'reports' ? 'Reports' : modalViewType === 'links' ? 'Links' : (reportType === 'internal' ? 'Internal' : 'Final') + ' Submissions'}
                        </DialogTitle>
                        <DialogDescription>
                            {modalViewType === 'reports' ? 'View and manage student reports' : modalViewType === 'links' ? 'View submission links' : `Evaluate ${reportType} submissions`}
                        </DialogDescription>
                    </DialogHeader>
                    {renderModalContent()}
                </DialogContent>
            </Dialog>

            {/* Evaluation Modal */}
            <Dialog open={showEvaluationModal && !!selectedItem} onOpenChange={(open) => {
                setShowEvaluationModal(open);
                if (!open) {
                    setSelectedItem(null);
                    setEvaluationData({});
                }
            }}>
                <DialogContent className="max-w-md data-[state=open]:slide-in-from-top-[50%] data-[state=open]:slide-in-from-left-1/2">
                    <DialogHeader>
                        <DialogTitle>
                            {evaluationData.success ? 'Evaluation Submitted!' : 'Submit Marks'}
                        </DialogTitle>
                        <DialogDescription>
                            {evaluationData.success
                                ? 'Evaluation has been submitted successfully.'
                                : reportType === 'internal'
                                    ? `Evaluate ${selectedItem?.action === 'approve' ? 'approval' : 'rejection'} for Day ${selectedItem?.day}`
                                    : 'Submit final marks for the student'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {evaluationData.success ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <FiCheck className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
                            <p className="text-gray-600 text-center">Evaluation submitted successfully. The data will refresh automatically.</p>
                        </div>
                    ) : (
                        <>
                            {renderEvaluationModal()}

                            <div className="flex space-x-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowEvaluationModal(false);
                                        setSelectedItem(null);
                                        setEvaluationData({});
                                    }}
                                    className="flex-1"
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        console.log('Submit button clicked, selectedItem:', selectedItem);
                                        handleMarksSubmit(selectedItem?.day, selectedItem?.action);
                                    }}
                                    disabled={submitting}
                                    className="flex-1 bg-red-800 hover:bg-red-900"
                                >
                                    {submitting ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </div>
                                    ) : (
                                        'Submit Marks'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReportsEvaluation;
