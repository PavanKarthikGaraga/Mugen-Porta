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
                        // Internal reports logic
                        const submissions = student.submissions || [];
                        const reportsEvaluated = submissions.filter(s => s.submission_type === 'report' && s.evaluated).length;
                        const youtubeEvaluated = submissions.some(s => s.submission_type === 'youtube_link' && s.evaluated);
                        const linkedinEvaluated = submissions.some(s => s.submission_type === 'linkedin_link' && s.evaluated);

                        const hasUnevaluatedReports = submissions.some(s => s.submission_type === 'report' && s.submission_url && !s.evaluated);
                        const hasUnevaluatedYoutube = submissions.some(s => s.submission_type === 'youtube_link' && s.submission_url && !s.evaluated);
                        const hasUnevaluatedLinkedin = submissions.some(s => s.submission_type === 'linkedin_link' && s.submission_url && !s.evaluated);

                        const needsReview = hasUnevaluatedReports || hasUnevaluatedYoutube || hasUnevaluatedLinkedin;
                        const hasSubmissions = submissions.length > 0;

                        return {
                            ...student,
                            hasSubmissions,
                            needsReview,
                            reportsStatus: `${reportsEvaluated}/7`,
                            youtubeStatus: hasUnevaluatedYoutube ? 'review' : youtubeEvaluated ? 'completed' : 'NULL',
                            linkedinStatus: hasUnevaluatedLinkedin ? 'review' : linkedinEvaluated ? 'completed' : 'NULL'
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

    const handleEvaluate = (itemType) => {
        setSelectedItem(itemType);
        setShowEvaluationModal(true);

        // Initialize evaluation data based on report type and pre-populate with existing marks
        if (reportType === 'internal') {
            // Find existing marks for the selected item
            let existingMarks = {};

            if (selectedStudent?.submissions) {
                if (typeof itemType === 'number' && itemType >= 1 && itemType <= 7) {
                    // Evaluating a specific report
                    const reportSubmission = selectedStudent.submissions.find(
                        s => s.submission_type === 'report' && s.report_number === itemType
                    );
                    existingMarks[`m${itemType}`] = reportSubmission?.marks || '';
                } else if (itemType === 'youtube_link') {
                    // Evaluating YouTube link
                    const youtubeSubmission = selectedStudent.submissions.find(
                        s => s.submission_type === 'youtube_link'
                    );
                    existingMarks.yt_m = youtubeSubmission?.marks || '';
                } else if (itemType === 'linkedin_link') {
                    // Evaluating LinkedIn link
                    const linkedinSubmission = selectedStudent.submissions.find(
                        s => s.submission_type === 'linkedin_link'
                    );
                    existingMarks.lk_m = linkedinSubmission?.marks || '';
                }
            }

            // Only pre-populate the field being evaluated, leave others undefined
            let evaluationDataObj = {};
            if (typeof itemType === 'number' && itemType >= 1 && itemType <= 7) {
                evaluationDataObj[`m${itemType}`] = existingMarks[`m${itemType}`] || '';
            } else if (itemType === 'youtube_link') {
                evaluationDataObj.yt_m = existingMarks.yt_m || '';
            } else if (itemType === 'linkedin_link') {
                evaluationDataObj.lk_m = existingMarks.lk_m || '';
            }
            setEvaluationData(evaluationDataObj);
        } else {
            // For final reports, pre-populate with existing marks
            const submission = selectedStudent?.finalSubmission;
            setEvaluationData({
                frm: submission?.frm || '',
                fyt_m: submission?.fyt_m || '',
                flk_m: submission?.flk_m || ''
            });
        }
    };

    const handleMarksSubmit = async () => {
        if (!selectedStudent) return;

        setSubmitting(true);
        try {
            // Prepare evaluation data based on selected item type
            let submissionData = {};

            if (reportType === 'internal') {
                if (typeof selectedItem === 'number' && selectedItem >= 1 && selectedItem <= 7) {
                    // Evaluating a specific report - only send that report's marks
                    submissionData[`m${selectedItem}`] = evaluationData[`m${selectedItem}`];
                } else if (selectedItem === 'youtube_link') {
                    // Evaluating YouTube link
                    submissionData.yt_m = evaluationData.yt_m;
                } else if (selectedItem === 'linkedin_link') {
                    // Evaluating LinkedIn link
                    submissionData.lk_m = evaluationData.lk_m;
                }
            } else {
                // Final reports - send all data
                submissionData = evaluationData;
            }

            const response = await fetch(apis.evaluate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    studentUsername: selectedStudent.username,
                    evaluationData: submissionData
                })
            });

            if (response.ok) {
                // Update the selected student data immediately to reflect the evaluation
                setSelectedStudent(prev => {
                    if (!prev) return null;

                    if (reportType === 'internal') {
                        // Update submissions array with new evaluation status
                        const updatedSubmissions = prev.submissions?.map(sub => {
                            if (typeof selectedItem === 'number' && sub.submission_type === 'report' && sub.report_number === selectedItem) {
                                return { ...sub, evaluated: true, marks: parseInt(submissionData[`m${selectedItem}`]) || 0 };
                            } else if (selectedItem === 'youtube_link' && sub.submission_type === 'youtube_link') {
                                return { ...sub, evaluated: true, marks: parseFloat(submissionData.yt_m) || 0 };
                            } else if (selectedItem === 'linkedin_link' && sub.submission_type === 'linkedin_link') {
                                return { ...sub, evaluated: true, marks: parseFloat(submissionData.lk_m) || 0 };
                            }
                            return sub;
                        }) || [];

                        return {
                            ...prev,
                            submissions: updatedSubmissions
                        };
                    } else {
                        return {
                            ...prev,
                            isEvaluated: true
                        };
                    }
                });

                setShowEvaluationModal(false);
                // Don't close the main modal immediately, let user see the updated status
                fetchStudents(); // Refresh data in background
                toast.success('Evaluation submitted successfully!');

                // Close modal after a short delay to let user see the updated status
                setTimeout(() => {
                    setShowModal(false);
                    setSelectedStudent(null);
                }, 1500);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to submit evaluation');
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YouTube</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
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
                                                onClick={() => handleViewReports(student)}
                                                className={`h-auto p-0 text-red-800 hover:text-red-600 ${
                                                    student.needsReview ? 'font-semibold' : ''
                                                }`}
                                            >
                                                <span>{student.reportsStatus}</span>
                                                {student.needsReview && (
                                                    <FiAlertTriangle className="w-4 h-4 ml-1 text-orange-500" />
                                                )}
                                            </Button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.youtubeStatus !== 'NULL' ? (
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleViewLinks(student)}
                                                    className={`h-auto p-0 ${getStatusColor(student.youtubeStatus)} hover:text-red-600`}
                                                >
                                                    {student.youtubeStatus}
                                                    {student.youtubeStatus === 'review' && (
                                                        <FiAlertTriangle className="w-4 h-4 ml-1 text-orange-500" />
                                                    )}
                                                </Button>
                                            ) : (
                                                <span className={getStatusColor(student.youtubeStatus)}>
                                                    {student.youtubeStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.linkedinStatus !== 'NULL' ? (
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleViewLinks(student)}
                                                    className={`h-auto p-0 ${getStatusColor(student.linkedinStatus)} hover:text-red-600`}
                                                >
                                                    {student.linkedinStatus}
                                                    {student.linkedinStatus === 'review' && (
                                                        <FiAlertTriangle className="w-4 h-4 ml-1 text-orange-500" />
                                                    )}
                                                </Button>
                                            ) : (
                                                <span className={getStatusColor(student.linkedinStatus)}>
                                                    {student.linkedinStatus}
                                                </span>
                                            )}
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
            const showReports = modalViewType === 'reports' || modalViewType === 'all';
            const showLinks = modalViewType === 'links' || modalViewType === 'all';

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
                            {/* Report Rows - Only show if modalViewType includes reports */}
                            {showReports && Array.from({ length: 7 }, (_, i) => {
                                const reportNumber = i + 1;
                                const submission = selectedStudent.submissions?.find(
                                    s => s.submission_type === 'report' && s.report_number === reportNumber
                                );

                                return (
                                    <TableRow key={reportNumber}>
                                        <TableCell className="font-medium">
                                            Report {reportNumber}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    submission?.evaluated ? "default" :
                                                    submission?.submission_url ? "secondary" :
                                                    "outline"
                                                }
                                                className={
                                                    submission?.evaluated ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                                    submission?.submission_url ? "bg-orange-100 text-orange-800 hover:bg-orange-100" :
                                                    "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }
                                            >
                                                {submission?.evaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : submission?.submission_url ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {submission?.marks ? `${submission.marks}/7` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {submission?.submission_url ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={submission.submission_url}
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
                                            {submission?.submission_url && !submission?.evaluated && (
                                                <Button
                                                    onClick={() => handleEvaluate(reportNumber)}
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
                            })}

                            {/* YouTube Link Row - Only show if modalViewType includes links */}
                            {showLinks && (() => {
                                const submission = selectedStudent.submissions?.find(s => s.submission_type === 'youtube_link');
                                return (
                                    <TableRow key="youtube">
                                        <TableCell className="font-medium">
                                            YouTube Link
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    submission?.evaluated ? "default" :
                                                    submission?.submission_url ? "secondary" :
                                                    "outline"
                                                }
                                                className={
                                                    submission?.evaluated ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                                    submission?.submission_url ? "bg-orange-100 text-orange-800 hover:bg-orange-100" :
                                                    "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }
                                            >
                                                {submission?.evaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : submission?.submission_url ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {submission?.marks ? `${submission.marks}/5.5` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {submission?.submission_url ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={submission.submission_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FiExternalLink className="w-4 h-4 mr-1" />
                                                        View Link
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {submission?.submission_url && !submission?.evaluated && (
                                                <Button
                                                    onClick={() => handleEvaluate('youtube_link')}
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

                            {/* LinkedIn Link Row - Only show if modalViewType includes links */}
                            {showLinks && (() => {
                                const submission = selectedStudent.submissions?.find(s => s.submission_type === 'linkedin_link');
                                return (
                                    <TableRow key="linkedin">
                                        <TableCell className="font-medium">
                                            LinkedIn Link
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    submission?.evaluated ? "default" :
                                                    submission?.submission_url ? "secondary" :
                                                    "outline"
                                                }
                                                className={
                                                    submission?.evaluated ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                                    submission?.submission_url ? "bg-orange-100 text-orange-800 hover:bg-orange-100" :
                                                    "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                }
                                            >
                                                {submission?.evaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : submission?.submission_url ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {submission?.marks ? `${submission.marks}/5.5` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {submission?.submission_url ? (
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                                >
                                                    <a
                                                        href={submission.submission_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FiExternalLink className="w-4 h-4 mr-1" />
                                                        View Link
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {submission?.submission_url && !submission?.evaluated && (
                                                <Button
                                                    onClick={() => handleEvaluate('linkedin_link')}
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
        if (reportType === 'internal') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="report-marks">
                            Report {selectedItem} Marks (0-7)
                        </Label>
                        <Input
                            id="report-marks"
                            type="number"
                            step="1"
                            min="0"
                            max="7"
                            value={evaluationData[`m${selectedItem}`]}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                [`m${selectedItem}`]: e.target.value
                            }))}
                            placeholder="Enter marks"
                        />
                    </div>

                    {selectedItem === 'youtube_link' && (
                        <div className="space-y-2">
                            <Label htmlFor="youtube-marks">
                                YouTube Link Marks (0-5.5)
                            </Label>
                            <Input
                                id="youtube-marks"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5.5"
                                value={evaluationData.yt_m}
                                onChange={(e) => setEvaluationData(prev => ({
                                    ...prev,
                                    yt_m: e.target.value
                                }))}
                                placeholder="Enter marks for YouTube link"
                            />
                        </div>
                    )}

                    {selectedItem === 'linkedin_link' && (
                        <div className="space-y-2">
                            <Label htmlFor="linkedin-marks">
                                LinkedIn Link Marks (0-5.5)
                            </Label>
                            <Input
                                id="linkedin-marks"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5.5"
                                value={evaluationData.lk_m}
                                onChange={(e) => setEvaluationData(prev => ({
                                    ...prev,
                                    lk_m: e.target.value
                                }))}
                                placeholder="Enter marks for LinkedIn link"
                            />
                        </div>
                    )}
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
                            <option value="Rural">Rural Development</option>
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
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedStudent?.name} ({selectedStudent?.username}) - {modalViewType === 'reports' ? 'Reports' : modalViewType === 'links' ? 'Links' : (reportType === 'internal' ? 'Internal' : 'Final') + ' Submissions'}
                        </DialogTitle>
                    </DialogHeader>
                    {renderModalContent()}
                </DialogContent>
            </Dialog>

            {/* Evaluation Modal */}
            <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Submit Marks</DialogTitle>
                    </DialogHeader>

                    {renderEvaluationModal()}

                    <div className="flex space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowEvaluationModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMarksSubmit}
                            disabled={submitting}
                            className="flex-1 bg-red-800 hover:bg-red-900"
                        >
                            {submitting ? 'Submitting...' : 'Submit Marks'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReportsEvaluation;
