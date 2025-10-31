"use client";
import { useState, useEffect, useCallback } from "react";
import { FiUpload, FiCheck, FiX, FiFileText, FiYoutube, FiLinkedin, FiSend } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentFinalSubmission() {
    const [submission, setSubmission] = useState({
        finalReportUrl: '',
        presentationYoutubeUrl: '',
        presentationLinkedinUrl: '',
        status: 'pending',
        marks: null,
        feedback: null
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch existing final submission
    const fetchSubmission = useCallback(async () => {
        try {
            const response = await fetch('/api/student/submissions/external', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                if (data.submission) {
                    setSubmission({
                        finalReportUrl: data.submission.final_report_url || '',
                        presentationYoutubeUrl: data.submission.presentation_youtube_url || '',
                        presentationLinkedinUrl: data.submission.presentation_linkedin_url || '',
                        status: data.submission.evaluated ? 'evaluated' : 'pending',
                        marks: data.submission.marks || 0,
                        internal_marks: data.submission.internal_marks || 0,
                        evaluated: data.submission.evaluated || false
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch final submission:', error);
        } finally {
            setFetchLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmission();
    }, [fetchSubmission]);

    const handleSubmit = async () => {
        // Validate all required fields
        if (!submission.finalReportUrl.trim()) {
            setMessage({ type: 'error', text: 'Please enter the final report URL' });
            return;
        }
        if (!submission.presentationYoutubeUrl.trim()) {
            setMessage({ type: 'error', text: 'Please enter the presentation YouTube URL' });
            return;
        }
        if (!submission.presentationLinkedinUrl.trim()) {
            setMessage({ type: 'error', text: 'Please enter the presentation LinkedIn URL' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/student/submissions/external', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    finalReportUrl: submission.finalReportUrl.trim(),
                    presentationYoutubeUrl: submission.presentationYoutubeUrl.trim(),
                    presentationLinkedinUrl: submission.presentationLinkedinUrl.trim()
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Final submission completed successfully!' });
                fetchSubmission();
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || 'Failed to submit final project' });
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
            default: return <FiSend className="w-4 h-4" />;
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Final Project Submission</h1>
                <p className="mt-2 text-gray-600">
                    Submit your final report and presentation links for external evaluation (40 marks total)
                </p>
            </div>

            {/* Status Display */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Submission Status</CardTitle>
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(submission.status)}`}>
                            {getStatusIcon(submission.status)}
                            <span className="font-medium capitalize">{submission.status}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>

                {submission.marks !== null && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">
                            Total Marks: {submission.marks}/40
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            (25 marks for final report + 15 marks for presentation links)
                        </div>
                    </div>
                )}

                {submission.feedback && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Feedback</h3>
                        <p className="text-blue-800">{submission.feedback}</p>
                    </div>
                )}
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
                    <button
                        onClick={() => setMessage({ type: '', text: '' })}
                        className="float-right ml-4 font-bold"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Final Report Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiFileText className="mr-2" />
                        Final Report (25 marks)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium mb-2">
                                Final Report URL *
                            </Label>
                            <Input
                                type="url"
                                value={submission.finalReportUrl}
                                onChange={(e) => setSubmission(prev => ({
                                    ...prev,
                                    finalReportUrl: e.target.value
                                }))}
                                placeholder="Enter your final report URL (Google Docs, PDF link, etc.)"
                                disabled={submission.evaluated}
                            />
                        <p className="text-xs text-gray-500 mt-1">
                            Provide a link to your final project report
                        </p>
                    </div>
                    </div>
                </CardContent>
            </Card>

            {/* Presentation Links Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiSend className="mr-2" />
                        Presentation Links (15 marks total - 7.5 marks each)
                    </CardTitle>
                </CardHeader>
                <CardContent>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* YouTube Presentation */}
                    <div className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium mb-2 flex items-center">
                                <FiYoutube className="mr-2 text-red-600" />
                                Presentation YouTube Video *
                            </Label>
                            <Input
                                type="url"
                                value={submission.presentationYoutubeUrl}
                                onChange={(e) => setSubmission(prev => ({
                                    ...prev,
                                    presentationYoutubeUrl: e.target.value
                                }))}
                                placeholder="Enter YouTube video URL"
                                disabled={submission.evaluated}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Link to your project presentation video on YouTube
                            </p>
                        </div>
                    </div>

                    {/* LinkedIn Presentation */}
                    <div className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium mb-2 flex items-center">
                                <FiLinkedin className="mr-2 text-blue-600" />
                                Presentation LinkedIn Post *
                            </Label>
                            <Input
                                type="url"
                                value={submission.presentationLinkedinUrl}
                                onChange={(e) => setSubmission(prev => ({
                                    ...prev,
                                    presentationLinkedinUrl: e.target.value
                                }))}
                                placeholder="Enter LinkedIn post URL"
                                disabled={submission.evaluated}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Link to your project presentation post on LinkedIn
                            </p>
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Ready to Submit?</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Make sure all URLs are correct and accessible before submitting.
                                You can only submit once.
                            </p>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading || submission.evaluated ||
                                    !submission.finalReportUrl.trim() ||
                                    !submission.presentationYoutubeUrl.trim() ||
                                    !submission.presentationLinkedinUrl.trim()}
                            className="bg-red-800 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <FiSend className="h-5 w-5" />
                                <span>{submission.evaluated ? 'Already Submitted' : 'Submit Final Project'}</span>
                            </>
                        )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-yellow-800 mb-3">Important Notes</h3>
                <ul className="list-disc list-inside text-yellow-700 space-y-2">
                    <li>Ensure all URLs are publicly accessible and will remain available for evaluation</li>
                    <li>The final report should comprehensively document your entire project</li>
                    <li>Presentation videos should clearly demonstrate your project and its outcomes</li>
                    <li>LinkedIn posts should professionally showcase your project work</li>
                    <li>You can only submit once - make sure everything is correct before submitting</li>
                </ul>
            </div>
        </div>
    );
}
