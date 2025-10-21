"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FiExternalLink, FiCheck, FiX, FiAlertTriangle, FiFileText } from "react-icons/fi";

const ReportsEvaluation = ({
    userRole,
    reportType, // 'internal' or 'final'
    title,
    maxMarks,
    marksBreakdown = []
}) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [evaluationData, setEvaluationData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [modalViewType, setModalViewType] = useState('all'); // 'reports', 'links', or 'all'

    // Get API endpoints based on user role and report type
    const apis = useMemo(() => {
        let studentsApi, evaluateApi;

        // Determine students API based on role
        switch (userRole) {
            case 'lead':
                studentsApi = '/api/dashboard/lead/students';
                break;
            case 'faculty':
                studentsApi = '/api/dashboard/faculty/students';
                break;
            case 'admin':
                studentsApi = '/api/dashboard/admin/students?role=student';
                break;
            default:
                studentsApi = '/api/dashboard/lead/students';
        }

        // Determine evaluation API based on role
        switch (userRole) {
            case 'lead':
                evaluateApi = reportType === 'internal' ? '/api/lead/evaluate/internal' : '/api/lead/evaluate/external';
                break;
            case 'faculty':
                evaluateApi = reportType === 'internal' ? '/api/faculty/evaluate/internal' : '/api/faculty/evaluate/external';
                break;
            case 'admin':
                evaluateApi = reportType === 'internal' ? '/api/admin/evaluate/internal' : '/api/admin/evaluate/external';
                break;
            default:
                evaluateApi = reportType === 'internal' ? '/api/lead/evaluate/internal' : '/api/lead/evaluate/external';
        }

        return {
            students: studentsApi,
            submissions: reportType === 'internal' ? '/api/student/submissions/internal' : '/api/student/submissions/external',
            evaluate: evaluateApi
        };
    }, [userRole, reportType]);

    // Fetch students only (user data should be passed as props or fetched once)
    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch students based on role
            const studentsResponse = await fetch(apis.students);
            if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                const studentsList = userRole === 'admin' ?
                    studentsData.data || studentsData :
                    studentsData.data.students;

                // Fetch submissions and marks for each student
                const studentsWithSubmissions = await Promise.all(
                    studentsList.map(async (student) => {
                        try {
                            // Fetch submissions
                            const submissionsResponse = await fetch(`${apis.submissions}?username=${student.username}`);
                            const submissionsData = submissionsResponse.ok ? await submissionsResponse.json() : { submissions: [], submission: null };

                            if (reportType === 'internal') {
                                // Internal reports logic
                                const reportsEvaluated = submissionsData.submissions.filter(s => s.submission_type === 'report' && s.evaluated).length;
                                const youtubeEvaluated = submissionsData.submissions.some(s => s.submission_type === 'youtube_link' && s.evaluated);
                                const linkedinEvaluated = submissionsData.submissions.some(s => s.submission_type === 'linkedin_link' && s.evaluated);

                                const hasUnevaluatedReports = submissionsData.submissions.some(s => s.submission_type === 'report' && s.submission_url && !s.evaluated);
                                const hasUnevaluatedYoutube = submissionsData.submissions.some(s => s.submission_type === 'youtube_link' && s.submission_url && !s.evaluated);
                                const hasUnevaluatedLinkedin = submissionsData.submissions.some(s => s.submission_type === 'linkedin_link' && s.submission_url && !s.evaluated);

                                const needsReview = hasUnevaluatedReports || hasUnevaluatedYoutube || hasUnevaluatedLinkedin;
                                const hasSubmissions = submissionsData.submissions.length > 0;

                                return {
                                    ...student,
                                    submissions: submissionsData.submissions,
                                    hasSubmissions,
                                    needsReview,
                                    reportsStatus: `${reportsEvaluated}/7`,
                                    youtubeStatus: hasUnevaluatedYoutube ? 'review' : youtubeEvaluated ? 'completed' : 'NULL',
                                    linkedinStatus: hasUnevaluatedLinkedin ? 'review' : linkedinEvaluated ? 'completed' : 'NULL'
                                };
                            } else {
                                // Final reports logic
                                const hasFinalReport = submissionsData.submission?.final_report_url;
                                const hasYoutube = submissionsData.submission?.presentation_youtube_url;
                                const hasLinkedin = submissionsData.submission?.presentation_linkedin_url;
                                const isEvaluated = submissionsData.submission?.total > 0;

                                const needsReview = (hasFinalReport || hasYoutube || hasLinkedin) && !isEvaluated;
                                const hasSubmissions = hasFinalReport || hasYoutube || hasLinkedin;

                                return {
                                    ...student,
                                    finalSubmission: submissionsData.submission,
                                    hasSubmissions,
                                    needsReview,
                                    isEvaluated
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching submissions for ${student.username}:`, error);
                            return {
                                ...student,
                                submissions: [],
                                finalSubmission: null,
                                hasSubmissions: false,
                                needsReview: false,
                                reportsStatus: '0/7',
                                youtubeStatus: 'NULL',
                                linkedinStatus: 'NULL'
                            };
                        }
                    })
                );

                // Filter students based on report type and role
                let filteredStudents = studentsWithSubmissions;
                if (reportType === 'final') {
                    filteredStudents = studentsWithSubmissions.filter(student => student.hasSubmissions);
                } else if (reportType === 'internal') {
                    // For internal reports, show all students but they might not have submissions yet
                    filteredStudents = studentsWithSubmissions;
                }

                setStudents(filteredStudents);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }, [userRole, reportType, apis]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

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

        // Initialize evaluation data based on report type
        if (reportType === 'internal') {
            setEvaluationData({
                m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '',
                yt_m: '', lk_m: ''
            });
        } else {
            setEvaluationData({
                frm: '', fyt_m: '', flk_m: ''
            });
        }
    };

    const handleMarksSubmit = async () => {
        if (!selectedStudent) return;

        setSubmitting(true);
        try {
            const response = await fetch(apis.evaluate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentUsername: selectedStudent.username,
                    evaluationData
                })
            });

            if (response.ok) {
                setShowEvaluationModal(false);
                setShowModal(false);
                fetchStudents(); // Refresh data
                alert('Evaluation submitted successfully!');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to submit evaluation');
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Network error occurred');
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
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reports
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    YouTube Link
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    LinkedIn Link
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.username} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {student.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => handleViewReports(student)}
                                            className={`flex items-center space-x-2 hover:text-red-600 transition-colors ${
                                                student.needsReview ? 'font-semibold' : ''
                                            }`}
                                        >
                                            <span>{student.reportsStatus}</span>
                                            {student.needsReview && (
                                                <FiAlertTriangle className="w-4 h-4 text-orange-500" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {student.youtubeStatus !== 'NULL' ? (
                                            <button
                                                onClick={() => handleViewLinks(student)}
                                                className={`hover:text-red-600 transition-colors ${getStatusColor(student.youtubeStatus)}`}
                                            >
                                                {student.youtubeStatus}
                                                {student.youtubeStatus === 'review' && (
                                                    <FiAlertTriangle className="inline w-4 h-4 ml-1 text-orange-500" />
                                                )}
                                            </button>
                                        ) : (
                                            <span className={getStatusColor(student.youtubeStatus)}>
                                                {student.youtubeStatus}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {student.linkedinStatus !== 'NULL' ? (
                                            <button
                                                onClick={() => handleViewLinks(student)}
                                                className={`hover:text-red-600 transition-colors ${getStatusColor(student.linkedinStatus)}`}
                                            >
                                                {student.linkedinStatus}
                                                {student.linkedinStatus === 'review' && (
                                                    <FiAlertTriangle className="inline w-4 h-4 ml-1 text-orange-500" />
                                                )}
                                            </button>
                                        ) : (
                                            <span className={getStatusColor(student.linkedinStatus)}>
                                                {student.linkedinStatus}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewClick(student)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            // Final reports table
            return (
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
                                    Final Submission
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Marks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.username} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {student.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => handleViewClick(student)}
                                            className={`flex items-center space-x-2 hover:text-red-600 transition-colors ${
                                                student.needsReview ? 'font-semibold' : ''
                                            }`}
                                        >
                                            <FiFileText className="w-4 h-4" />
                                            <span>View Final Submission</span>
                                            {student.needsReview && (
                                                <FiAlertTriangle className="w-4 h-4 text-orange-500" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            student.isEvaluated ? 'bg-green-100 text-green-800' :
                                            student.needsReview ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {student.isEvaluated ? (
                                                <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                            ) : student.needsReview ? (
                                                <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                            ) : (
                                                'Not Submitted'
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.finalSubmission?.total_marks ? `${student.finalSubmission.total_marks}/100` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewClick(student)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    const renderModalContent = () => {
        if (reportType === 'internal') {
            const showReports = modalViewType === 'reports' || modalViewType === 'all';
            const showLinks = modalViewType === 'links' || modalViewType === 'all';

            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submission Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Marks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Link
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Report Rows - Only show if modalViewType includes reports */}
                            {showReports && Array.from({ length: 7 }, (_, i) => {
                                const reportNumber = i + 1;
                                const submission = selectedStudent.submissions.find(
                                    s => s.submission_type === 'report' && s.report_number === reportNumber
                                );

                                return (
                                    <tr key={reportNumber} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Report {reportNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                submission?.evaluated ? 'bg-green-100 text-green-800' :
                                                submission?.submission_url ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {submission?.evaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : submission?.submission_url ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {submission?.marks ? `${submission.marks}/7` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {submission?.submission_url ? (
                                                <a
                                                    href={submission.submission_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    <FiExternalLink className="w-4 h-4 mr-1" />
                                                    View Report
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {submission?.submission_url && !submission?.evaluated && (
                                                <button
                                                    onClick={() => handleEvaluate(reportNumber)}
                                                    className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    Evaluate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* YouTube Link Row - Only show if modalViewType includes links */}
                            {showLinks && (() => {
                                const submission = selectedStudent.submissions.find(s => s.submission_type === 'youtube_link');
                                return (
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            YouTube Link
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                submission?.evaluated ? 'bg-green-100 text-green-800' :
                                                submission?.submission_url ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {submission?.evaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : submission?.submission_url ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {submission?.marks ? `${submission.marks}/5.5` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {submission?.submission_url ? (
                                                <a
                                                    href={submission.submission_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    <FiExternalLink className="w-4 h-4 mr-1" />
                                                    View Link
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {submission?.submission_url && !submission?.evaluated && (
                                                <button
                                                    onClick={() => handleEvaluate('youtube_link')}
                                                    className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    Evaluate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })()}

                            {/* LinkedIn Link Row - Only show if modalViewType includes links */}
                            {showLinks && (() => {
                                const submission = selectedStudent.submissions.find(s => s.submission_type === 'linkedin_link');
                                return (
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            LinkedIn Link
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                submission?.evaluated ? 'bg-green-100 text-green-800' :
                                                submission?.submission_url ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {submission?.evaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : submission?.submission_url ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {submission?.marks ? `${submission.marks}/5.5` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {submission?.submission_url ? (
                                                <a
                                                    href={submission.submission_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    <FiExternalLink className="w-4 h-4 mr-1" />
                                                    View Link
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {submission?.submission_url && !submission?.evaluated && (
                                                <button
                                                    onClick={() => handleEvaluate('linkedin_link')}
                                                    className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    Evaluate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            // Final reports modal content
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submission Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Marks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Link
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Final Report Row */}
                            {(() => {
                                const submission = selectedStudent.finalSubmission;
                                const hasReport = submission?.final_report_url;
                                const isReportEvaluated = submission?.frm > 0;

                                return (
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Final Report
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                isReportEvaluated ? 'bg-green-100 text-green-800' :
                                                hasReport ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {isReportEvaluated ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Evaluated</>
                                                ) : hasReport ? (
                                                    <><FiAlertTriangle className="w-3 h-3 mr-1" />Needs Review</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {isReportEvaluated ? `${submission.frm}/25` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {hasReport ? (
                                                <a
                                                    href={submission.final_report_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    <FiExternalLink className="w-4 h-4 mr-1" />
                                                    View Report
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {hasReport && !isReportEvaluated && (
                                                <button
                                                    onClick={() => handleEvaluate('final')}
                                                    className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    Evaluate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })()}

                            {/* YouTube Presentation Row */}
                            {(() => {
                                const submission = selectedStudent.finalSubmission;
                                const hasYoutube = submission?.presentation_youtube_url;

                                return (
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            YouTube Presentation
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                hasYoutube ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {hasYoutube ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Submitted</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            -
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {hasYoutube ? (
                                                <a
                                                    href={submission.presentation_youtube_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    <FiExternalLink className="w-4 h-4 mr-1" />
                                                    View Presentation
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            -
                                        </td>
                                    </tr>
                                );
                            })()}

                            {/* LinkedIn Presentation Row */}
                            {(() => {
                                const submission = selectedStudent.finalSubmission;
                                const hasLinkedin = submission?.presentation_linkedin_url;

                                return (
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            LinkedIn Presentation
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                hasLinkedin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {hasLinkedin ? (
                                                    <><FiCheck className="w-3 h-3 mr-1" />Submitted</>
                                                ) : (
                                                    'Not Submitted'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            -
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {hasLinkedin ? (
                                                <a
                                                    href={submission.presentation_linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    <FiExternalLink className="w-4 h-4 mr-1" />
                                                    View Post
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            -
                                        </td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    const renderEvaluationModal = () => {
        if (reportType === 'internal') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Report {selectedItem} Marks (0-7)
                        </label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            max="7"
                            value={evaluationData[`m${selectedItem}`]}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                [`m${selectedItem}`]: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                            placeholder="Enter marks"
                        />
                    </div>

                    {selectedItem === 'youtube_link' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                YouTube Link Marks (0-5.5)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5.5"
                                value={evaluationData.yt_m}
                                onChange={(e) => setEvaluationData(prev => ({
                                    ...prev,
                                    yt_m: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                placeholder="Enter marks for YouTube link"
                            />
                        </div>
                    )}

                    {selectedItem === 'linkedin_link' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LinkedIn Link Marks (0-5.5)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5.5"
                                value={evaluationData.lk_m}
                                onChange={(e) => setEvaluationData(prev => ({
                                    ...prev,
                                    lk_m: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                placeholder="Enter marks for LinkedIn link"
                            />
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Final Report Marks (0-25)
                        </label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            max="25"
                            value={evaluationData.frm}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                frm: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                            placeholder="Enter marks for final report"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            YouTube Presentation Marks (0-7.5)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="7.5"
                            value={evaluationData.fyt_m}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                fyt_m: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                            placeholder="Enter marks for YouTube presentation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            LinkedIn Presentation Marks (0-7.5)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="7.5"
                            value={evaluationData.flk_m}
                            onChange={(e) => setEvaluationData(prev => ({
                                ...prev,
                                flk_m: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
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

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {renderStudentTable()}

                {students.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No students found.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {selectedStudent.name} ({selectedStudent.username}) - {modalViewType === 'reports' ? 'Reports' : modalViewType === 'links' ? 'Links' : (reportType === 'internal' ? 'Internal' : 'Final') + ' Submissions'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            {renderModalContent()}
                        </div>
                    </div>
                </div>
            )}

            {/* Evaluation Modal */}
            {showEvaluationModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Submit Marks
                                </h2>
                                <button
                                    onClick={() => setShowEvaluationModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            {renderEvaluationModal()}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => setShowEvaluationModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMarksSubmit}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Marks'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsEvaluation;
