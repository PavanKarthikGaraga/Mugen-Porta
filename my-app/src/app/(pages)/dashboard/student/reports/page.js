"use client";
import { useState, useEffect, useCallback } from "react";
import { FiUpload, FiCheck, FiX, FiEye, FiLink, FiYoutube, FiLinkedin, FiFileText, FiBarChart, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Domain mapping for submissions (only 5th and 6th have domains)
const domainMapping = {
    5: 'HWB Submission',
    6: 'ESO Submission'
};

const getDomainName = (day) => domainMapping[day] || `Submission ${day}`;

export default function StudentReports() {
    // Check if a submission is unlocked (first 4 are unlocked progressively, 5-6 always unlocked)
    const isSubmissionUnlocked = (day) => {
        if (day > 4) return true; // HWB and ESO are always unlocked
        if (day === 1) return true; // First submission is always unlocked

        // For submissions 2-4, check if previous submission is completed
        const prevDay = submissions.days[day - 2]; // day-2 because array is 0-indexed
        return prevDay && (prevDay.report.status === 'approved' || prevDay.report.status === 'submitted');
    };

    const [submissions, setSubmissions] = useState({
        days: Array.from({ length: 6 }, (_, i) => ({
            day: i + 1,
            domain: getDomainName(i + 1),
            report: { url: '', status: 'pending' },
            linkedin: { url: '', status: 'pending' },
            youtube: { url: '', status: 'pending' },
            reason: null
        }))
    });
    const [selectedItem, setSelectedItem] = useState(null);
    const [reportsExpanded, setReportsExpanded] = useState(false);
    const [linksExpanded, setLinksExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [resubmitMode, setResubmitMode] = useState({}); // Track which days are in resubmit mode

    // Fetch existing submissions
    const fetchSubmissions = useCallback(async () => {
        try {
            const response = await fetch('/api/student/submissions/internal', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();

                // Initialize submissions structure for 6 days
                const newSubmissions = {
                    days: Array.from({ length: 6 }, (_, i) => ({
                        day: i + 1,
                        domain: getDomainName(i + 1),
                        report: { url: '', status: 'pending' },
                        linkedin: { url: '', status: 'pending' },
                        youtube: { url: '', status: 'pending' },
                        reason: null
                    }))
                };

                // Use submissionsByDay if available, otherwise parse from submissions array
                if (data.submissionsByDay) {
                    data.submissionsByDay.forEach(dayData => {
                        const dayIndex = dayData.day - 1;
                        if (dayIndex >= 0 && dayIndex < 6) {
                            newSubmissions.days[dayIndex] = {
                                day: dayData.day,
                                domain: getDomainName(dayData.day),
                                report: {
                                    url: dayData.report || '',
                                    status: dayData.status === 'A' ? 'approved' :
                                           dayData.status === 'R' ? 'rejected' :
                                           dayData.status === 'S' ? 'submitted' :
                                           dayData.status === 'N' ? 'new' : 'pending'
                                },
                                linkedin: {
                                    url: dayData.linkedin || '',
                                    status: dayData.status === 'A' ? 'approved' :
                                           dayData.status === 'R' ? 'rejected' :
                                           dayData.status === 'S' ? 'submitted' :
                                           dayData.status === 'N' ? 'new' : 'pending'
                                },
                                youtube: {
                                    url: dayData.youtube || '',
                                    status: dayData.status === 'A' ? 'approved' :
                                           dayData.status === 'R' ? 'rejected' :
                                           dayData.status === 'S' ? 'submitted' :
                                           dayData.status === 'N' ? 'new' : 'pending'
                                },
                                reason: dayData.reason
                            };
                        }
                    });
                } else {
                    // Fallback: parse from submissions array (for backward compatibility)
                    data.submissions.forEach(submission => {
                        if (submission.day_number && submission.day_number >= 1 && submission.day_number <= 6) {
                            const dayIndex = submission.day_number - 1;
                            const status = submission.status === 'A' ? 'approved' :
                                         submission.status === 'R' ? 'rejected' :
                                         submission.status === 'S' ? 'submitted' :
                                         submission.status === 'N' ? 'new' : 'pending';

                            if (submission.submission_type === 'report') {
                                newSubmissions.days[dayIndex].report = {
                                    url: submission.submission_url || '',
                                    status: status
                                };
                            } else if (submission.submission_type === 'linkedin_link') {
                                newSubmissions.days[dayIndex].linkedin = {
                                    url: submission.submission_url || '',
                                    status: status
                                };
                            } else if (submission.submission_type === 'youtube_link') {
                                newSubmissions.days[dayIndex].youtube = {
                                    url: submission.submission_url || '',
                                    status: status
                                };
                            }
                            newSubmissions.days[dayIndex].reason = submission.reason;
                        }
                    });
                }

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

    const handleDaySubmit = async (day, reportUrl, linkedinUrl, youtubeUrl) => {
        if (!reportUrl.trim() || !linkedinUrl.trim() || !youtubeUrl.trim()) {
            toast.error('Please enter all three URLs (Report, LinkedIn, YouTube)');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/student/submissions/internal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    day,
                    reportUrl: reportUrl.trim(),
                    linkedinUrl: linkedinUrl.trim(),
                    youtubeUrl: youtubeUrl.trim()
                })
            });

            if (response.ok) {
                toast.success(`Day ${day} submitted successfully!`);
                fetchSubmissions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to submit day');
            }
        } catch (error) {
            toast.error('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleResubmit = (day) => {
        // Clear the URLs locally and enable resubmit mode
        const newDays = [...submissions.days];
        const index = newDays.findIndex(d => d.day === day);
        if (index !== -1) {
            newDays[index].report.url = '';
            newDays[index].linkedin.url = '';
            newDays[index].youtube.url = '';
            setSubmissions(prev => ({ ...prev, days: newDays }));

            // Set resubmit mode for this day
            setResubmitMode(prev => ({ ...prev, [day]: true }));
        }
    };

    const handleResubmitSubmit = async (day, reportUrl, linkedinUrl, youtubeUrl) => {
        if (!reportUrl.trim() || !linkedinUrl.trim() || !youtubeUrl.trim()) {
            toast.error('Please enter all three URLs (Report, LinkedIn, YouTube)');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/student/submissions/internal', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ day, reportUrl: reportUrl.trim(), linkedinUrl: linkedinUrl.trim(), youtubeUrl: youtubeUrl.trim() })
            });

            if (response.ok) {
                toast.success(`Day ${day} resubmitted successfully!`);
                // Clear resubmit mode and refresh data
                setResubmitMode(prev => ({ ...prev, [day]: false }));
                fetchSubmissions();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to resubmit');
            }
        } catch (error) {
            toast.error('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-50 border-green-200';
            case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
            case 'new': return 'text-purple-600 bg-purple-50 border-purple-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FiCheck className="w-4 h-4" />;
            case 'submitted': return <FiUpload className="w-4 h-4" />;
            case 'rejected': return <FiX className="w-4 h-4" />;
            case 'new': return <FiUpload className="w-4 h-4" />;
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
        if (selectedItem && selectedItem.startsWith('day-')) {
            const dayNumber = parseInt(selectedItem.split('-')[1]);
            return submissions.days.find(d => d.day === dayNumber);
        }
        return null;
    };

    const selectedData = getSelectedItemData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
                <p className="mt-2 text-gray-600">
                    Submit your submissions with LinkedIn and YouTube links for internal evaluation (60 marks total - 10 marks per day)
                </p>
            </div>

            {/* Stats at Top */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiBarChart className="mr-2" />
                        Submissions Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="text-center p-2">
                        <CardContent className="pt-3">
                            <div className="text-xl font-bold text-gray-900">
                                {submissions.days.filter(d => d.report.status === 'approved').length}/6
                            </div>
                            <div className="text-sm text-gray-600">Submissions Approved</div>
                        </CardContent>
                    </Card>
                    <Card className="text-center p-2">
                        <CardContent className="pt-3">
                            <div className="text-xl font-bold text-gray-900">
                                {submissions.days.filter(d => d.report.status === 'submitted').length}/6
                            </div>
                            <div className="text-sm text-gray-600">Submissions Submitted</div>
                        </CardContent>
                    </Card>
                    <Card className="text-center p-2">
                        <CardContent className="pt-3">
                            <div className="text-xl font-bold text-gray-900">
                                {submissions.days.filter(d => d.report.status === 'rejected').length}
                            </div>
                            <div className="text-sm text-gray-600">Submissions Rejected</div>
                        </CardContent>
                    </Card>
                    <Card className="text-center p-2">
                        <CardContent className="pt-3">
                            <div className="text-xl font-bold text-gray-900">
                                {submissions.days.filter(d => d.report.status === 'approved').length * 10}/60
                            </div>
                            <div className="text-sm text-gray-600">Internal Marks</div>
                        </CardContent>
                    </Card>
                </div>
                </CardContent>
            </Card>


            {/* Main Layout */}
            <div className="flex gap-6 ">
                {/* Sidebar - Left */}
                <Card className="w-80 flex-shrink-0 h-full">
                    <CardHeader>
                        <CardTitle>All Days</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                        <div className="space-y-1">
                            {submissions.days.map((day) => {
                                const dayStatus = day.report.status; // All components have same status
                                const isUnlocked = isSubmissionUnlocked(day.day);
                                return (
                                    <Button
                                        key={day.day}
                                        onClick={() => isUnlocked && setSelectedItem(`day-${day.day}`)}
                                        variant={selectedItem === `day-${day.day}` ? "secondary" : "ghost"}
                                        disabled={!isUnlocked}
                                        className={`w-full text-left py-6 rounded-md transition-colors flex items-center justify-between ${
                                            !isUnlocked
                                                ? 'cursor-not-allowed'
                                                : selectedItem === `day-${day.day}`
                                                ? 'bg-red-100 text-red-800 border border-red-200 py-6'
                                                : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium">{day.domain}</span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Report, LinkedIn, YouTube
                                            </div>
                                        </div>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(dayStatus)}`}>
                                            {getStatusIcon(dayStatus)}
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content - Right */}
                <Card className="flex-1 h-full">
                    <CardContent className="p-6">
                        {selectedData && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <FiFileText className="mr-2" />
                                        {selectedData.domain}
                                    </h2>
                                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border ${resubmitMode[selectedData.day] ? 'text-blue-600 bg-blue-50 border-blue-200' : getStatusColor(selectedData.report.status)}`}>
                                    {resubmitMode[selectedData.day] ? <FiUpload className="w-4 h-4" /> : getStatusIcon(selectedData.report.status)}
                                    <span className="capitalize">{resubmitMode[selectedData.day] ? 'Resubmitting' : selectedData.report.status}</span>
                                </div>
                                </div>

                            {/* Rejection Reason Display */}
                            {selectedData.reason && selectedData.report.status === 'rejected' && !resubmitMode[selectedData.day] && (
                                    <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div className="text-sm text-red-800">
                                            <strong className="text-red-900">Rejection Reason:</strong> {selectedData.reason}
                                        </div>
                                    </div>
                                )}

                                {/* URL Inputs */}
                                <div className="space-y-6">
                                    {/* Report URL */}
                                    <div>
                                                <Label className=" text-sm font-medium mb-2 flex items-center">
                                                    <FiFileText className="mr-2" />
                                                    Report URL (5 marks)
                                                </Label>
                                                <Input
                                                    type="url"
                                                    value={selectedData.report.url || ''}
                                                    onChange={(e) => {
                                                        const dayNumber = parseInt(selectedItem.split('-')[1]);
                                                        const newDays = [...submissions.days];
                                                        const index = newDays.findIndex(d => d.day === dayNumber);
                                                        if (index !== -1) {
                                                            newDays[index].report.url = e.target.value;
                                                            setSubmissions(prev => ({ ...prev, days: newDays }));
                                                        }
                                                    }}
                                                    placeholder="Enter report URL"
                                                    disabled={selectedData.report.status === 'submitted' || selectedData.report.status === 'approved' || selectedData.report.status === 'new' || (selectedData.report.status === 'rejected' && !resubmitMode[selectedData.day])}
                                                />
                                            </div>

                                    {/* LinkedIn URL */}
                                        <div>
                                            <Label className=" text-sm font-medium mb-2 flex items-center">
                                                <FiLinkedin className="mr-2 text-blue-600" />
                                                LinkedIn Post URL (2.5 marks)
                                            </Label>
                                            <Input
                                        type="url"
                                        value={selectedData.linkedin.url || ''}
                                        onChange={(e) => {
                                            const dayNumber = parseInt(selectedItem.split('-')[1]);
                                            const newDays = [...submissions.days];
                                            const index = newDays.findIndex(d => d.day === dayNumber);
                                            if (index !== -1) {
                                                newDays[index].linkedin.url = e.target.value;
                                                setSubmissions(prev => ({ ...prev, days: newDays }));
                                            }
                                        }}
                                        placeholder="Enter LinkedIn post URL"
                                        disabled={selectedData.linkedin.status === 'submitted' || selectedData.linkedin.status === 'approved' || selectedData.linkedin.status === 'new' || (selectedData.linkedin.status === 'rejected' && !resubmitMode[selectedData.day])}
                                    />
                                </div>

                                    {/* YouTube URL */}
                                        <div>
                                            <Label className=" text-sm font-medium mb-2 flex items-center">
                                                <FiYoutube className="mr-2 text-red-600" />
                                                YouTube Video URL (2.5 marks)
                                            </Label>
                                            <Input
                                        type="url"
                                        value={selectedData.youtube.url || ''}
                                        onChange={(e) => {
                                            const dayNumber = parseInt(selectedItem.split('-')[1]);
                                            const newDays = [...submissions.days];
                                            const index = newDays.findIndex(d => d.day === dayNumber);
                                            if (index !== -1) {
                                                newDays[index].youtube.url = e.target.value;
                                                setSubmissions(prev => ({ ...prev, days: newDays }));
                                            }
                                        }}
                                        placeholder="Enter YouTube video URL"
                                        disabled={selectedData.youtube.status === 'submitted' || selectedData.youtube.status === 'approved' || selectedData.youtube.status === 'new' || (selectedData.youtube.status === 'rejected' && !resubmitMode[selectedData.day])}
                                    />
                                </div>

                                    <div className="flex space-x-3">
                                        {/* Resubmit Button - only show for rejected submissions when not in resubmit mode */}
                                            {selectedData.report.status === 'rejected' && !resubmitMode[selectedData.day] && (
                                                <Button
                                                    onClick={() => {
                                                        const dayNumber = parseInt(selectedItem.split('-')[1]);
                                                        handleResubmit(dayNumber);
                                                    }}
                                                    disabled={loading}
                                                    variant="outline"
                                                    className="border-orange-600 text-orange-600 hover:bg-orange-50 hover:text-orange-900"
                                                >
                                                    <FiUpload className="mr-2 h-5 w-5" />
                                                    Resubmit
                                                </Button>
                                            )}

                                            {/* Submit/Resubmit Button */}
                                                <Button
                                                    onClick={() => {
                                                        const dayNumber = parseInt(selectedItem.split('-')[1]);
                                                        if (resubmitMode[selectedData.day]) {
                                                            // In resubmit mode, call resubmit API
                                                            handleResubmitSubmit(dayNumber, selectedData.report.url || '', selectedData.linkedin.url || '', selectedData.youtube.url || '');
                                                        } else {
                                                            // Normal submit
                                                            handleDaySubmit(dayNumber, selectedData.report.url || '', selectedData.linkedin.url || '', selectedData.youtube.url || '');
                                                        }
                                                    }}
                                                    disabled={loading ||
                                                        !(selectedData.report.url || '').trim() ||
                                                        !(selectedData.linkedin.url || '').trim() ||
                                                        !(selectedData.youtube.url || '').trim() ||
                                                        selectedData.report.status === 'submitted' ||
                                                        selectedData.report.status === 'approved' ||
                                                        selectedData.report.status === 'new'
                                                    }
                                                    className="bg-red-800 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                                                >
                                                    {loading ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    ) : resubmitMode[selectedData.day] ? (
                                                        <>
                                                            <FiUpload className="mr-2 h-5 w-5" />
                                                            Resubmit Day {selectedData.day}
                                                        </>
                                                    ) : selectedData.report.status === 'submitted' || selectedData.report.status === 'approved' ? (
                                                        <>
                                                            <FiCheck className="mr-2 h-5 w-5" />
                                                            {selectedData.report.status === 'approved' ? 'Approved' : 'Submitted'}
                                                        </>
                                                    ) : selectedData.report.status === 'new' ? (
                                                        <>
                                                            <FiCheck className="mr-2 h-5 w-5" />
                                                            Resubmitted
                                                        </>
                                                    ) : selectedData.report.status === 'rejected' ? (
                                                        <>
                                                            <FiX className="mr-2 h-5 w-5" />
                                                            Rejected
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiUpload className="mr-2 h-5 w-5" />
                                                            Submit {selectedData.domain}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                            </div>
                        )}
                        {!selectedData && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FiFileText className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Submission</h3>
                                <p className="text-gray-600 max-w-md">
                                    Choose a submission from the sidebar to view details and submit your work.
                                    The first 4 submissions unlock progressively as you complete them.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}