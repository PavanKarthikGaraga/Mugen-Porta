'use client';

import React, { useState, useEffect } from 'react';
import { generateActivityReportPdf } from '@/lib/activityReportPdf';
import { SDG_MAP } from '@/app/Data/activities-mock';

type ReportData = {
    activity_code: string;
    activity_title: string;
    activity_date: string;
    activity_venue: string;
    sdgs: number[];
    club_name: string;
    club_domain: string;
    club_logo_url: string | null;
    
    academic_year: string;
    time_slot: string;
    venue: string;
    students_participated: number;
    faculty_name: string;
    faculty_id: string;
    student_lead_name: string;
    student_lead_id: string;
    poster_url: string;
    permission_letter_url: string;
    overview: string;
    objectives: string;
    proceedings: string;
    key_highlights: string;
    learning_outcomes: string;
    conclusion: string;
    gallery: any[];
    attendance_sheets: any[];
};

export default function RegenerateReportsPage() {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Processing Queue State
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentProcessIndex, setCurrentProcessIndex] = useState(0);
    const [processingLogs, setProcessingLogs] = useState<string[]>([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/dashboard/admin/dev/regenerate-reports');
            const json = await res.json();
            if (json.success) {
                setReports(json.reports || []);
            } else {
                alert(json.error || 'Failed to fetch reports');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching reports');
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok || !data.url) return null;
            return data.url;
        } catch {
            return null;
        }
    };

    const startProcessing = async () => {
        if (reports.length === 0) return;
        if (!confirm(`Are you sure you want to regenerate PDFs for all ${reports.length} reports? This may take several minutes. Please do not close the tab.`)) return;

        setIsProcessing(true);
        setCurrentProcessIndex(0);
        setProcessingLogs([]);

        for (let i = 0; i < reports.length; i++) {
            const r = reports[i];
            setCurrentProcessIndex(i + 1);
            
            try {
                // Generate PDF using jsPDF on the client
                const pdfBlob = await generateActivityReportPdf({
                    isCse: false,
                    isDeptOrMhs: r.club_domain === 'DEPT. CLUBS' || r.club_domain === 'MHS. CLUBS',
                    clubName: r.club_name || "",
                    activityTitle: r.activity_title || "",
                    activityDate: r.activity_date ? new Date(r.activity_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
                    hodName: "",
                    hodDesignation: "",
                    facultyName: r.faculty_name || "",
                    posterUrl: r.poster_url || "",
                    permissionLetterUrl: r.permission_letter_url || "",
                    eventParticulars: {
                        activityName: r.activity_title || "",
                        organizingClub: r.club_name || "",
                        academicYear: r.academic_year || "",
                        facultyIncharge: [r.faculty_name, r.faculty_id].filter(Boolean).join(" - "),
                        studentLead: [r.student_lead_name, r.student_lead_id].filter(Boolean).join(" - "),
                        timeSlot: r.time_slot || "",
                        venue: r.venue || r.activity_venue || "",
                        studentsParticipated: r.students_participated ? String(r.students_participated) : "",
                        sdgsMapped: (r.sdgs || []).map((num: number) => `SDG ${num}: ${SDG_MAP[num]}`).join(", "),
                    },
                    overview: r.overview || "",
                    objectives: r.objectives || "",
                    proceedings: r.proceedings || "",
                    keyHighlights: r.key_highlights || "",
                    learningOutcomes: r.learning_outcomes || "",
                    conclusion: r.conclusion || "",
                    gallery: r.gallery || [],
                    attendanceSheets: r.attendance_sheets || [],
                    clubLogoUrl: r.club_logo_url,
                });

                if (!pdfBlob) {
                    throw new Error("Failed to create PDF blob");
                }

                // Upload PDF
                const file = new File([pdfBlob], `report-${r.activity_code}.pdf`, { type: "application/pdf" });
                const url = await uploadFile(file);
                
                if (!url) {
                    throw new Error("Failed to upload PDF");
                }

                // Update DB
                const res = await fetch('/api/dashboard/admin/dev/regenerate-reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activity_code: r.activity_code, report_pdf_url: url })
                });
                const json = await res.json();

                if (json.success) {
                    setProcessingLogs(prev => [...prev, `[SUCCESS] ${r.activity_code}: Regenerated & Uploaded.`]);
                } else {
                    setProcessingLogs(prev => [...prev, `[ERROR] ${r.activity_code}: ${json.message || json.error}`]);
                }
            } catch (error: any) {
                setProcessingLogs(prev => [...prev, `[ERROR] ${r.activity_code}: ${error.message}`]);
            }
        }

        setIsProcessing(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Auto-Regenerate PDFs</h1>
                <p className="text-gray-600 mt-2">Generate and re-upload the static PDF files for all finalized reports. This fixes issues like missing SDGs in old reports.</p>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading reports...</div>
            ) : reports.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200">
                    <p className="text-gray-500">No finalized reports found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Total Reports to process: <strong>{reports.length}</strong></p>
                        </div>
                        <button
                            onClick={startProcessing}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : 'Start Bulk Regeneration'}
                        </button>
                    </div>

                    {isProcessing && (
                        <div className="mb-6">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${(currentProcessIndex / reports.length) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 text-right">{currentProcessIndex} / {reports.length} processed</p>
                        </div>
                    )}

                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 h-96 overflow-y-auto mt-4">
                        {processingLogs.length === 0 ? (
                            <span className="text-gray-500">Waiting to start...</span>
                        ) : (
                            processingLogs.map((log, i) => (
                                <div key={i} className={log.includes('[ERROR]') ? 'text-red-400' : 'text-green-400'}>
                                    {log}
                                </div>
                            ))
                        )}
                        {/* Auto-scroll anchor */}
                        <div style={{ float:"left", clear: "both" }}
                            ref={(el) => { el?.scrollIntoView({ behavior: 'smooth' }); }}>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
