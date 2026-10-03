'use client';

import React, { useState } from 'react';
import { FiDownload, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';

const domainMap: Record<string, string> = {
    LCH: 'Liberal Arts & Culture',
    TEC: 'Technology',
    HWB: 'Health & Wellbeing',
    ESO: 'Extension & Social Outreach',
    IIE: 'Innovation, Incubation & Entrepreneurship'
};

export default function MonthlyReportsPage() {
    const [monthInput, setMonthInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const handleFetchData = async () => {
        if (!monthInput) {
            toast.error('Please select a month');
            return;
        }

        const [year, month] = monthInput.split('-');
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard/admin/samam/monthly-reports?month=${month}&year=${year}`);
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            
            // Process data for the report
            const processed = processReportData(data, year, month);
            setReportData(processed);
            toast.success('Data fetched successfully! You can now generate reports.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch report data.');
        } finally {
            setLoading(false);
        }
    };

    const processReportData = (data: any, year: string, month: string) => {
        const { clubs, activities, studentStats } = data;
        
        const totalClubs = clubs.length;
        const totalActivities = activities.length;
        let totalParticipants = 0;
        let totalRegistered = 0;

        // Group by domains
        const domainStats: any = {
            LCH: { name: domainMap.LCH, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            TEC: { name: domainMap.TEC, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            HWB: { name: domainMap.HWB, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            ESO: { name: domainMap.ESO, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
            IIE: { name: domainMap.IIE, clubs: 0, activities: 0, participants: 0, regStudents: 0 },
        };

        const activeClubsSet = new Set();
        const eventDaysSet = new Set();

        activities.forEach((act: any) => {
            const p = parseInt(act.participants) || 0;
            totalParticipants += p;
            if (act.domain && domainStats[act.domain]) {
                domainStats[act.domain].activities += 1;
                domainStats[act.domain].participants += p;
            }
            if (act.club_id) activeClubsSet.add(act.club_id);
            if (act.activity_date) eventDaysSet.add(act.activity_date.substring(0, 10));
        });

        // Club-wise statistics
        const clubStatsList: any[] = [];

        clubs.forEach((club: any) => {
            const stat = studentStats.find((s: any) => s.clubId === club.id);
            const regCount = stat ? parseInt(stat.total) : 0;
            totalRegistered += regCount;
            
            if (domainStats[club.domain]) {
                domainStats[club.domain].clubs += 1;
                domainStats[club.domain].regStudents += regCount;
            }

            clubStatsList.push({
                name: club.name,
                domain: club.domain,
                yr1: stat ? parseInt(stat.yr1) : 0,
                yr2: stat ? parseInt(stat.yr2) : 0,
                yr3: stat ? parseInt(stat.yr3) : 0,
                yr4: stat ? parseInt(stat.yr4) : 0,
                dayScholar: stat ? parseInt(stat.dayScholar) : 0,
                hosteler: stat ? parseInt(stat.hosteler) : 0,
                total: regCount
            });
        });
        
        // Sort club stats by domain then name
        clubStatsList.sort((a, b) => {
            if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
            return a.name.localeCompare(b.name);
        });

        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = date.toLocaleString('default', { month: 'long' });

        return {
            monthStr: `${monthName} ${year}`,
            monthName, year,
            totalClubs,
            totalActivities,
            totalParticipants,
            totalRegistered,
            activeClubsCount: activeClubsSet.size,
            eventDaysCount: eventDaysSet.size,
            domainStats: Object.values(domainStats).filter((d: any) => d.clubs > 0 || d.activities > 0),
            clubStatsList,
            activities
        };
    };

    const downloadPDF = () => {
        if (!reportData) return;
        const doc = new jsPDF();
        const { monthStr, totalClubs, totalActivities, totalParticipants, totalRegistered, domainStats, clubStatsList, activities, activeClubsCount, eventDaysCount } = reportData;

        // Title Page
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(151, 0, 3); // KL Red
        doc.text(monthStr.toUpperCase(), 105, 30, { align: 'center' });
        doc.setFontSize(24);
        doc.text("KL SAC MONTHLY REPORT", 105, 45, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text("Student Activity Center", 105, 55, { align: 'center' });
        doc.text("Koneru Lakshmaiah Education Foundation", 105, 62, { align: 'center' });

        // Stats Boxes (Simple representation for PDF)
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        
        doc.text(`Total Clubs: ${totalClubs}`, 20, 85);
        doc.text(`Activities Conducted: ${totalActivities}`, 80, 85);
        doc.text(`Total Participants: ${totalParticipants}`, 140, 85);
        doc.text(`Registered Students: ${totalRegistered}`, 80, 95);
        
        doc.text(`Active Clubs: ${activeClubsCount}`, 20, 105);
        doc.text(`Event Days: ${eventDaysCount}`, 80, 105);

        // Domain Summary Table
        doc.text("Domain-wise Summary", 14, 125);
        const domainRows = domainStats.map((d: any) => [d.name, d.clubs, d.activities, d.participants, d.regStudents]);
        (doc as any).autoTable({
            startY: 130,
            head: [['Domain Name', 'Clubs', 'Activities', 'Participants', 'Reg. Students']],
            body: domainRows,
            theme: 'grid',
            headStyles: { fillColor: [151, 0, 3] },
        });

        // Highlights (Activities)
        doc.addPage();
        doc.text("Key Highlights", 14, 20);
        
        const activityHighlights = activities.map((a: any) => `• ${a.club_name || ''} conducted ${a.title} with ${a.participants} participants.`);
        let yPos = 30;
        activityHighlights.forEach((text: string) => {
            const lines = doc.splitTextToSize(text, 180);
            if (yPos + lines.length * 7 > 280) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(lines, 14, yPos);
            yPos += lines.length * 7;
        });

        // Club-wise stats
        doc.addPage();
        doc.text("REGISTERED STUDENT DATA — CLUB-WISE STATISTICS", 14, 20);
        const clubRows = clubStatsList.map((c: any, i: number) => [
            i + 1, c.name, c.domain, c.yr1, c.yr2, c.yr3, c.yr4, c.dayScholar, c.hosteler, c.total
        ]);
        (doc as any).autoTable({
            startY: 25,
            head: [['S.No', 'Club', 'Domain', '1st Yr', '2nd Yr', '3rd Yr', '4th Yr', 'Day Scholar', 'Hosteler', 'Total']],
            body: clubRows,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [151, 0, 3] },
        });

        // Activity Details
        doc.addPage();
        doc.setFontSize(11);
        doc.text("Domain-wise Activity Details", 14, 20);
        const actRows = activities.map((a: any, i: number) => [
            i + 1, a.title, a.club_name || '-', a.participants, a.venue || '-', a.activity_date ? new Date(a.activity_date).toLocaleDateString() : '-'
        ]);
        (doc as any).autoTable({
            startY: 25,
            head: [['S.No', 'Activity Name', 'Club', 'Students', 'Venue', 'Date']],
            body: actRows,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [151, 0, 3] },
        });

        doc.save(`KL_SAC_Monthly_Report_${monthStr.replace(' ', '_')}.pdf`);
    };

    const downloadWord = async () => {
        if (!reportData) return;
        const { monthStr, totalClubs, totalActivities, totalParticipants, totalRegistered, domainStats, clubStatsList, activities } = reportData;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: monthStr.toUpperCase(),
                        alignment: AlignmentType.CENTER,
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: "KL SAC MONTHLY REPORT",
                        alignment: AlignmentType.CENTER,
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Student Activity Center", italics: true })
                        ],
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    
                    new Paragraph({ text: `Total Clubs: ${totalClubs}` }),
                    new Paragraph({ text: `Activities Conducted: ${totalActivities}` }),
                    new Paragraph({ text: `Total Participants: ${totalParticipants}` }),
                    new Paragraph({ text: `Registered Students: ${totalRegistered}` }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    
                    new Paragraph({ text: "Domain-wise Summary", heading: HeadingLevel.HEADING_3 }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: ['Domain Name', 'Clubs', 'Activities', 'Participants', 'Reg. Students'].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] }))
                            }),
                            ...domainStats.map((d: any) => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(d.name)] }),
                                    new TableCell({ children: [new Paragraph(d.clubs.toString())] }),
                                    new TableCell({ children: [new Paragraph(d.activities.toString())] }),
                                    new TableCell({ children: [new Paragraph(d.participants.toString())] }),
                                    new TableCell({ children: [new Paragraph(d.regStudents.toString())] }),
                                ]
                            }))
                        ]
                    }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    
                    new Paragraph({ text: "Key Highlights", heading: HeadingLevel.HEADING_3 }),
                    ...activities.map((a: any) => new Paragraph({
                        text: `• ${a.club_name || 'Club'} conducted ${a.title} with ${a.participants} participants.`,
                        spacing: { after: 100 }
                    })),
                ],
            }],
        });

        Packer.toBlob(doc).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `KL_SAC_Monthly_Report_${monthStr.replace(' ', '_')}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Monthly Reports</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Month & Year</label>
                    <div className="flex flex-wrap gap-4">
                        <input
                            type="month"
                            value={monthInput}
                            onChange={(e) => setMonthInput(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none w-full sm:w-auto"
                        />
                        <button 
                            onClick={handleFetchData}
                            disabled={loading || !monthInput}
                            className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <FiRefreshCw className={loading ? "animate-spin" : ""} />
                            {loading ? 'Fetching...' : 'Fetch Data'}
                        </button>
                    </div>
                </div>
            </div>

            {reportData && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Report Ready: {reportData.monthStr}</h2>
                            <p className="text-gray-500">
                                {reportData.totalActivities} Activities • {reportData.totalParticipants} Participants • {reportData.totalRegistered} Registered Students
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={downloadPDF}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FiFileText />
                                Download PDF
                            </button>
                            <button
                                onClick={downloadWord}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FiDownload />
                                Download DOCX
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl font-bold text-red-700">{reportData.totalClubs}</div>
                            <div className="text-sm text-gray-600 font-medium mt-1">Total Clubs</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl font-bold text-red-700">{reportData.totalActivities}</div>
                            <div className="text-sm text-gray-600 font-medium mt-1">Activities Conducted</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl font-bold text-red-700">{reportData.totalParticipants}</div>
                            <div className="text-sm text-gray-600 font-medium mt-1">Total Participants</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <div className="text-3xl font-bold text-red-700">{reportData.totalRegistered}</div>
                            <div className="text-sm text-gray-600 font-medium mt-1">Registered Students</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
