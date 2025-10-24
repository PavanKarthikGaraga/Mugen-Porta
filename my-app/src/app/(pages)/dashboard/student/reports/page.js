"use client";
import { useState, useEffect, useCallback } from "react";
import { FiUpload, FiCheck, FiX, FiEye, FiLink, FiYoutube, FiLinkedin, FiFileText, FiBarChart, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentReports() {
    const [submissions, setSubmissions] = useState({
        reports: Array.from({ length: 7 }, (_, i) => ({
            reportNumber: i + 1,
            url: '',
            status: 'pending',
            marks: null,
            feedback: null
        })),
        youtube: { url: '', status: 'pending', marks: null, feedback: null },
        linkedin: { url: '', status: 'pending', marks: null, feedback: null }
    });
    const [selectedItem, setSelectedItem] = useState('report-1');
    const [reportsExpanded, setReportsExpanded] = useState(false);
    const [linksExpanded, setLinksExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch existing submissions
    const fetchSubmissions = useCallback(async () => {
        try {
            const response = await fetch('/api/student/submissions/internal');
            if (response.ok) {
                const data = await response.json();

                // Initialize submissions structure
                const newSubmissions = {
                    reports: Array.from({ length: 7 }, (_, i) => ({
                        reportNumber: i + 1,
                        url: '',
                        status: 'pending',
                        marks: 0,
                        evaluated: false
                    })),
                    youtube: { url: '', status: 'pending', marks: 0, evaluated: false },
                    linkedin: { url: '', status: 'pending', marks: 0, evaluated: false }
                };

                // Populate with existing data
                data.submissions.forEach(submission => {
                    if (submission.submission_type === 'report') {
                        const reportIndex = submission.report_number - 1;
                        if (reportIndex >= 0 && reportIndex < 7) {
                            newSubmissions.reports[reportIndex] = {
                                reportNumber: submission.report_number,
                                url: submission.submission_url || '',
                                status: submission.evaluated ? 'evaluated' : 'pending',
                                marks: submission.marks || 0,
                                evaluated: submission.evaluated || false
                            };
                        }
                    } else if (submission.submission_type === 'youtube_link') {
                        newSubmissions.youtube = {
                            url: submission.submission_url || '',
                            status: submission.evaluated ? 'evaluated' : 'pending',
                            marks: submission.marks || 0,
                            evaluated: submission.evaluated || false
                        };
                    } else if (submission.submission_type === 'linkedin_link') {
                        newSubmissions.linkedin = {
                            url: submission.submission_url || '',
                            status: submission.evaluated ? 'evaluated' : 'pending',
                            marks: submission.marks || 0,
                            evaluated: submission.evaluated || false
                        };
                    }
                });

                setSubmissions(newSubmissions);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setFetchLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleReportSubmit = async (reportNumber, url) => {
        if (!url.trim()) {
            setMessage({ type: 'error', text: 'Please enter a valid URL' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/student/submissions/internal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionType: 'report',
                    reportNumber,
                    url: url.trim()
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `Report ${reportNumber} submitted successfully!` });
                fetchSubmissions();
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || 'Failed to submit report' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleLinkSubmit = async (linkType, url) => {
        if (!url.trim()) {
            setMessage({ type: 'error', text: 'Please enter a valid URL' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/student/submissions/internal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionType: linkType === 'youtube' ? 'youtube_link' : 'linkedin_link',
                    url: url.trim()
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `${linkType === 'youtube' ? 'YouTube' : 'LinkedIn'} link submitted successfully!` });
                fetchSubmissions();
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || 'Failed to submit link' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'evaluated': return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'evaluated': return <FiCheck className="w-4 h-4" />;
            case 'rejected': return <FiX className="w-4 h-4" />;
            default: return <FiUpload className="w-4 h-4" />;
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
        );
    }

    // Helper function to get selected item data
    const getSelectedItemData = () => {
        if (selectedItem.startsWith('report-')) {
            const reportNumber = parseInt(selectedItem.split('-')[1]);
            return submissions.reports.find(r => r.reportNumber === reportNumber);
        } else if (selectedItem === 'youtube') {
            return { ...submissions.youtube, title: 'YouTube Link', icon: FiYoutube, color: 'text-red-600' };
        } else if (selectedItem === 'linkedin') {
            return { ...submissions.linkedin, title: 'LinkedIn Link', icon: FiLinkedin, color: 'text-blue-600' };
        }
        return null;
    };

    const selectedData = getSelectedItemData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Reports & Links Submission</h1>
                <p className="mt-2 text-gray-600">
                    Submit your 7 reports and social media links for internal evaluation (60 marks total)
                </p>
            </div>

            {/* Stats at Top */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiBarChart className="mr-2" />
                        Submission Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="text-center p-4">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-gray-900">
                                {submissions.reports.filter(r => r.evaluated).length}/7
                            </div>
                            <div className="text-sm text-gray-600">Reports Evaluated</div>
                        </CardContent>
                    </Card>
                    <Card className="text-center p-4">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-gray-900">
                                {submissions.youtube.evaluated ? 1 : 0}/1
                            </div>
                            <div className="text-sm text-gray-600">YouTube Links Evaluated</div>
                        </CardContent>
                    </Card>
                    <Card className="text-center p-4">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-gray-900">
                                {submissions.linkedin.evaluated ? 1 : 0}/1
                            </div>
                            <div className="text-sm text-gray-600">LinkedIn Links Evaluated</div>
                        </CardContent>
                    </Card>
                </div>
                </CardContent>
            </Card>

            {/* Message Display */}
            {message.text && (
                <div className={`p-4 rounded-lg border ${
                    message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {message.text}
                    <Button
                        onClick={() => setMessage({ type: '', text: '' })}
                        variant="ghost"
                        className="float-right ml-4 font-bold h-auto p-1"
                    >
                        ×
                    </Button>
                </div>
            )}

            {/* Main Layout */}
            <div className="flex gap-6">
                {/* Sidebar - Left */}
                <Card className="w-80 flex-shrink-0">
                    <CardHeader>
                        <CardTitle>All Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>

                    {/* Reports Section with Dropdown */}
                    <div className="mb-6">
                        <Button
                            onClick={() => {
                                setReportsExpanded(!reportsExpanded);
                                if (!reportsExpanded) setLinksExpanded(false);
                            }}
                            variant="ghost"
                            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                        >
                            <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                <FiFileText className="mr-2" />
                                Reports (7 marks each)
                            </h4>
                            {reportsExpanded ? (
                                <FiChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                                <FiChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                        </Button>

                        {reportsExpanded && (
                            <div className="mt-2 space-y-2">
                                {submissions.reports.map((report) => (
                                    <Button
                                        key={report.reportNumber}
                                        onClick={() => setSelectedItem(`report-${report.reportNumber}`)}
                                        variant={selectedItem === `report-${report.reportNumber}` ? "secondary" : "ghost"}
                                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                                            selectedItem === `report-${report.reportNumber}`
                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                        }`}
                                    >
                                        <span className="text-sm">Report {report.reportNumber}</span>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(report.status)}`}>
                                            {getStatusIcon(report.status)}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Media Links Section with Dropdown */}
                    <div>
                        <Button
                            onClick={() => {
                                setLinksExpanded(!linksExpanded);
                                if (!linksExpanded) setReportsExpanded(false);
                            }}
                            variant="ghost"
                            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                        >
                            <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                <FiLink className="mr-2" />
                                Media Links (5.5 marks each)
                            </h4>
                            {linksExpanded ? (
                                <FiChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                                <FiChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                        </Button>

                        {linksExpanded && (
                            <div className="mt-2 space-y-2">
                                <Button
                                    onClick={() => setSelectedItem('youtube')}
                                    variant={selectedItem === 'youtube' ? 'secondary' : 'ghost'}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                                        selectedItem === 'youtube'
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <FiYoutube className="mr-2 text-red-600" />
                                        <span className="text-sm">YouTube Link</span>
                                    </div>
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(submissions.youtube.status)}`}>
                                        {getStatusIcon(submissions.youtube.status)}
                                    </div>
                                </Button>

                                <Button
                                    onClick={() => setSelectedItem('linkedin')}
                                    variant={selectedItem === 'linkedin' ? 'secondary' : 'ghost'}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                                        selectedItem === 'linkedin'
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <FiLinkedin className="mr-2 text-blue-600" />
                                        <span className="text-sm">LinkedIn Link</span>
                                    </div>
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(submissions.linkedin.status)}`}>
                                        {getStatusIcon(submissions.linkedin.status)}
                                    </div>
                                </Button>
                            </div>
                        )}
                    </div>
                    </CardContent>
                </Card>

                {/* Main Content - Right */}
                <Card className="flex-1">
                    <CardContent className="p-6">
                    {selectedData && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    {selectedItem.startsWith('report-') ? (
                                        <FiFileText className="mr-2" />
                                    ) : selectedItem === 'youtube' ? (
                                        <FiYoutube className="mr-2 text-red-600" />
                                    ) : (
                                        <FiLinkedin className="mr-2 text-blue-600" />
                                    )}
                                    {selectedItem.startsWith('report-')
                                        ? `Report ${selectedData.reportNumber}`
                                        : selectedData.title
                                    }
                                </h2>
                                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border ${getStatusColor(selectedData.status)}`}>
                                    {getStatusIcon(selectedData.status)}
                                    <span className="capitalize">{selectedData.status}</span>
                                </div>
                            </div>

                            {/* Marks Display */}
                            {selectedData.marks !== null && selectedData.marks !== undefined && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Marks:</span> {selectedData.marks}/
                                        {selectedItem.startsWith('report-') ? '7' : '5.5'}
                                    </div>
                                </div>
                            )}

                            {/* Feedback Display */}
                            {selectedData.feedback && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-blue-800">
                                        <strong className="text-blue-900">Feedback:</strong> {selectedData.feedback}
                                    </div>
                                </div>
                            )}

                            {/* URL Input and Submit */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="block text-sm font-medium mb-2">
                                        {selectedItem.startsWith('report-') ? 'Report URL' :
                                         selectedItem === 'youtube' ? 'YouTube Video URL' : 'LinkedIn Post URL'}
                                    </Label>
                                    <Input
                                        type="url"
                                        value={selectedData.url || ''}
                                        onChange={(e) => {
                                            if (selectedItem.startsWith('report-')) {
                                                const reportNumber = parseInt(selectedItem.split('-')[1]);
                                                const newReports = [...submissions.reports];
                                                const index = newReports.findIndex(r => r.reportNumber === reportNumber);
                                                if (index !== -1) {
                                                    newReports[index].url = e.target.value;
                                                    setSubmissions(prev => ({ ...prev, reports: newReports }));
                                                }
                                            } else if (selectedItem === 'youtube') {
                                                setSubmissions(prev => ({
                                                    ...prev,
                                                    youtube: { ...prev.youtube, url: e.target.value }
                                                }));
                                            } else if (selectedItem === 'linkedin') {
                                                setSubmissions(prev => ({
                                                    ...prev,
                                                    linkedin: { ...prev.linkedin, url: e.target.value }
                                                }));
                                            }
                                        }}
                                        placeholder={
                                            selectedItem.startsWith('report-')
                                                ? "Enter report URL"
                                                : selectedItem === 'youtube'
                                                ? "Enter YouTube video URL"
                                                : "Enter LinkedIn post URL"
                                        }
                                        disabled={selectedData.evaluated}
                                    />
                                </div>

                                <Button
                                    onClick={() => {
                                        if (selectedItem.startsWith('report-')) {
                                            const reportNumber = parseInt(selectedItem.split('-')[1]);
                                            handleReportSubmit(reportNumber, selectedData.url || '');
                                        } else if (selectedItem === 'youtube') {
                                            handleLinkSubmit('youtube', selectedData.url || '');
                                        } else if (selectedItem === 'linkedin') {
                                            handleLinkSubmit('linkedin', selectedData.url || '');
                                        }
                                    }}
                                    disabled={loading || !(selectedData.url || '').trim() || selectedData.evaluated}
                                    className="bg-red-800 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <FiUpload className="mr-2 h-5 w-5" />
                                            {selectedData.evaluated ? 'Evaluated' : 'Submit'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            </div>
    );
}